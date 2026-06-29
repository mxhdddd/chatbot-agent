import requests
import re
import math
import os

SERPER_API_KEY = os.getenv("SERPER_API_KEY")

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
            return "Aucun résultat trouvé."
        output = ""
        for r in results:
            output += f"- {r.get('title', '')}: {r.get('snippet', '')} ({r.get('link', '')})\n"
        return output
    except Exception as e:
        return f"Erreur de recherche: {str(e)}"

def calculate(expression: str) -> str:
    try:
        expr = re.sub(r"[^0-9+\-*/(). ]", "", expression)
        result = eval(expr, {"__builtins__": None}, {"math": math})
        return str(result)
    except Exception as e:
        return f"Erreur de calcul: {str(e)}"

def summarize_text(text: str) -> str:
    try:
        sentences = text.split(".")
        return ". ".join(sentences[:3]) + "." if len(sentences) > 3 else text
    except Exception as e:
        return f"Erreur de resume: {str(e)}"
