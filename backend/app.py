from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import requests
import PyPDF2
import io
import chromadb
from sentence_transformers import SentenceTransformer
import uuid

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")
MODEL = "deepseek/deepseek-chat"

# RAG setup
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
chroma_client = chromadb.Client()
collection = chroma_client.create_collection("documents")

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    tool: Optional[str] = None

conversation_histories = {}

def call_llm(messages):
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"},
        json={"model": MODEL, "messages": messages}
    )
    data = response.json()
    return data["choices"][0]["message"]["content"]

def web_search(query: str) -> str:
    try:
        response = requests.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"},
            json={"q": query, "num": 3}
        )
        data = response.json()
        results = data.get("organic", [])[:3]
        if not results:
            return "Aucun resultat trouve."
        output = ""
        for r in results:
            output += f"- {r.get('title', '')}: {r.get('snippet', '')} ({r.get('link', '')})\n"
        return output
    except Exception as e:
        return f"Erreur: {str(e)}"

def calculate(expression: str) -> str:
    try:
        import re, math
        expr = re.sub(r"[^0-9+\-*/(). ]", "", expression)
        result = eval(expr, {"__builtins__": None}, {"math": math})
        return str(result)
    except Exception as e:
        return f"Erreur: {str(e)}"

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks

def rag_search(query: str, n_results: int = 3) -> str:
    try:
        query_embedding = embedding_model.encode([query]).tolist()
        results = collection.query(query_embeddings=query_embedding, n_results=n_results)
        if not results["documents"][0]:
            return "Aucun document trouve."
        return "\n\n".join(results["documents"][0])
    except Exception as e:
        return f"Erreur RAG: {str(e)}"

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"

        chunks = chunk_text(text)
        embeddings = embedding_model.encode(chunks).tolist()
        ids = [str(uuid.uuid4()) for _ in chunks]

        try:
            chroma_client.delete_collection("documents")
        except:
            pass
        global collection
        collection = chroma_client.create_collection("documents")
        collection.add(documents=chunks, embeddings=embeddings, ids=ids)

        return {"message": f"PDF charge avec RAG ({len(pdf_reader.pages)} pages, {len(chunks)} chunks)", "pages": len(pdf_reader.pages), "chunks": len(chunks)}
    except Exception as e:
        return {"error": str(e)}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    user_id = "default_user"
    history = conversation_histories.get(user_id, [])
    last_message = request.messages[-1].content

    if request.tool == "web_search":
        tool_response = web_search(last_message)
        history.append({"role": "user", "content": f"Voici les resultats de recherche web pour '{last_message}':\n{tool_response}\n\nReponds en utilisant ces resultats."})
    elif request.tool == "calculate":
        tool_response = calculate(last_message)
        history.append({"role": "user", "content": f"Calcul de '{last_message}' = {tool_response}. Explique le resultat."})
    elif request.tool == "summarize":
        history.append({"role": "user", "content": f"Fais un resume de ce texte: {last_message}"})
    elif request.tool == "pdf":
        rag_context = rag_search(last_message)
        history.append({"role": "user", "content": f"Contexte du document (extrait pertinent via RAG):\n{rag_context}\n\nQuestion: {last_message}\n\nReponds uniquement en te basant sur ce contexte."})
    else:
        history.append({"role": "user", "content": last_message})

    ai_message = call_llm(history)
    history.append({"role": "assistant", "content": ai_message})
    conversation_histories[user_id] = history
    return {"message": ai_message}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
