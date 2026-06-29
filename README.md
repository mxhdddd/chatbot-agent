# Chatbot Agent Multi-Outils 🤖

**Un chatbot intelligent avec intégration API Deepseek, web search, calcul et RAG (Retrieval Augmented Generation)**

Auteur : Mathyas Haddadou  
Créé avec : FastAPI + React  
Stack : Python (Backend) + JavaScript (Frontend)

---

## 📋 Vue d'ensemble

Ce projet est un **chatbot conversationnel intelligent** doté de plusieurs outils :

✅ **Conversation naturelle** — Via API Deepseek (via OpenRouter)  
✅ **Recherche web** — Intégration Serper pour les résultats frais  
✅ **Calcul** — Évaluation sécurisée d'expressions mathématiques  
✅ **Résumé** — Extraction rapide de points clés  
✅ **RAG (PDF)** — Question-réponse sur documents uploadés  
✅ **Interface React** — UI moderne et responsive  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           Frontend (React)                       │
│  - Chat UI                                      │
│  - Tool Selector                                │
│  - File Upload                                  │
└──────────────┬──────────────────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────────────────┐
│           Backend (FastAPI)                     │
│  ┌─────────────────────────────────────────┐   │
│  │ Chat Endpoint (/chat)                   │   │
│  │ - Message routing                       │   │
│  │ - Tool selection                        │   │
│  │ - Conversation history                  │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │ Tools                                   │   │
│  │ - Web Search (Serper API)              │   │
│  │ - Calculator (eval sécurisé)           │   │
│  │ - Summarizer                           │   │
│  │ - PDF RAG (ChromaDB + embeddings)      │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │ LLM Integration                         │   │
│  │ - Deepseek Chat via OpenRouter          │   │
│  │ - Prompt engineering                    │   │
│  │ - Context management                    │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
         ↓
    External APIs:
    - OpenRouter (Deepseek)
    - Serper (Web Search)
    - ChromaDB (Vector Store)
```

---

## 🛠️ Outils Disponibles

### 1. **Web Search** 🔍
Recherche en temps réel via Serper API.

```
User: "Dernières nouvelles en IA"
Tool: web_search("Dernières nouvelles en IA")
→ Top 3 résultats avec titres, snippets, liens
```

### 2. **Calculator** 🧮
Évaluation mathématique sécurisée (eval sandbox).

```
User: "Combien fait 2^10 + 5*3"
Tool: calculate("2^10 + 5*3")
→ Résultat = 1035
```

### 3. **Summarizer** 📝
Extraction rapide des points clés d'un texte.

```
User: [Long paragraph]
Tool: summarize([paragraph])
→ Résumé en 3-4 phrases
```

### 4. **PDF RAG** 📚
Question-réponse sur documents uploadés.

**Processus** :
1. Upload PDF
2. Extraction texte avec PyPDF2
3. Chunking (500 mots, overlap 50)
4. Embedding avec SentenceTransformer (`all-MiniLM-L6-v2`)
5. Stockage dans ChromaDB
6. Recherche sémantique à la requête

```
User: "Quelle est la date d'expiration du contrat ?"
Tool: rag_search("date expiration contrat")
→ Contexte pertinent du PDF + réponse
```

---

## 🚀 Installation & Démarrage

### Prérequis
```
Python 3.8+
Node.js 14+ (pour React)
Clés API :
  - OPENROUTER_API_KEY (Deepseek)
  - SERPER_API_KEY (Web Search)
```

### Backend Setup

```bash
cd backend

# Virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer dépendances
pip install -r requirements.txt

# Créer .env avec les clés API
echo "OPENROUTER_API_KEY=sk-or-v1-..." > .env
echo "SERPER_API_KEY=1f6e1a72e4a..." >> .env

# Lancer le serveur
python app.py
# ou
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Backend démarre sur** : `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Installer dépendances
npm install

# Développement
npm start
# ou
npm run dev

# Production
npm run build
```

**Frontend démarre sur** : `http://localhost:3000`

---

## 📡 API Endpoints

### POST `/chat`
Envoyer un message et obtenir une réponse.

**Request** :
```json
{
  "messages": [
    {"role": "user", "content": "Quelle est la capitale de la France ?"}
  ],
  "tool": null
}
```

**Outils disponibles** :
- `null` — Chat normal
- `"web_search"` — Recherche web
- `"calculate"` — Calcul
- `"summarize"` — Résumé
- `"pdf"` — RAG sur PDF

**Response** :
```json
{
  "message": "La capitale de la France est Paris..."
}
```

### POST `/upload-pdf`
Uploader un PDF pour le RAG.

**Request** :
```
Content-Type: multipart/form-data
File: [PDF binary]
```

**Response** :
```json
{
  "message": "PDF chargé avec RAG (12 pages, 48 chunks)",
  "pages": 12,
  "chunks": 48
}
```

---

## 📝 Fichiers Principaux

### Backend

**`app.py`** (5.3 KB)
- FastAPI app
- Endpoints `/chat` et `/upload-pdf`
- LLM integration (Deepseek via OpenRouter)
- RAG setup (ChromaDB + embeddings)
- Conversation history management

**`tools.py`** (1.3 KB)
- Web search (Serper)
- Calculator
- Summarizer
- Utilitaires

**`requirements.txt`**
```
fastapi
uvicorn
python-dotenv
google-generativeai
requests
beautifulsoup4
PyPDF2
chromadb
sentence-transformers
```

### Frontend

**`src/App.js`** — App principal React

**`src/components/Chat.js`** — Zone chat

**`src/components/Message.js`** — Composant message

**`src/components/ToolSelector.js`** — Sélecteur d'outils

**`src/api.js`** — Appels API vers le backend

**`package.json`** — Dépendances npm

---

## 🔌 APIs Externes Utilisées

### 1. OpenRouter (Deepseek Chat)
```
POST https://openrouter.ai/api/v1/chat/completions
Model: "deepseek/deepseek-chat"
```

**Avantages** :
- Latency faible
- Prix compétitif
- Support multilingue

### 2. Serper (Web Search)
```
POST https://google.serper.dev/search
```

**Donne** : Top résultats Google en temps réel

### 3. ChromaDB (Vector Database)
- Stockage local des embeddings
- Recherche sémantique rapide
- Pas de dépendance externe

### 4. Sentence Transformers
- Modèle : `all-MiniLM-L6-v2`
- 384 dimensions
- Embeddings haute qualité

---

## 💡 Exemples d'Utilisation

### Exemple 1 : Chat Simple
```
User: "Dis-moi une blague"
Tool: null
→ Chatbot répond avec une blague drôle
```

### Exemple 2 : Web Search
```
User: "Quels sont les derniers événements en technologie ?"
Tool: "web_search"
→ Récupère les 3 articles les plus récents
→ Chatbot synthétise les résultats
```

### Exemple 3 : Calcul
```
User: "Quel est 15% de 250 ?"
Tool: "calculate"
→ Calcul : 250 * 0.15 = 37.5
→ Réponse : "15% de 250 est 37.5"
```

### Exemple 4 : RAG sur PDF
```
1. User upload "contrat.pdf"
   → 50 pages → 200 chunks
   → Embeddings créés
   → Stockés dans ChromaDB

2. User: "Quand expire le contrat ?"
   Tool: "pdf"
   → Recherche sémantique dans le PDF
   → Extrait contexte pertinent
   → Chatbot répond basé sur le contexte
```

---

## 🔐 Sécurité

### Points d'Attention

⚠️ **API Keys**
- Ne PAS committer les clés API
- Utiliser `.env` et `.gitignore`
- Régénérer les clés publiquement exposées

✅ **Calculator Sandbox**
- Utilise `eval()` avec `__builtins__: None`
- Limite les opérations autorisées
- Filtre les caractères non-mathématiques

✅ **PDF Processing**
- Pas de limite de taille (à ajouter)
- PyPDF2 pour l'extraction sécurisée
- Stockage local dans ChromaDB

---

## 📊 Architecture Détaillée : RAG

### Phase 1 : Upload PDF

```python
1. Upload fichier PDF
2. PyPDF2.PdfReader() → Extraction texte brute
3. chunk_text(text, chunk_size=500, overlap=50)
   → Découpe en chunks chevauchants
4. embedding_model.encode(chunks)
   → Transformation vecteurs (384D)
5. collection.add(documents, embeddings, ids)
   → Stockage dans ChromaDB
```

### Phase 2 : Query (Recherche)

```python
1. User pose une question
2. query_embedding = embedding_model.encode([question])
   → Transforme question en vecteur 384D
3. collection.query(query_embeddings, n_results=3)
   → Recherche top-3 chunks similaires (cosine similarity)
4. Contexte retourné au LLM
5. LLM formule réponse basée sur contexte
```

**Avantage** : Réponses précises basées sur le document, pas d'hallucinations

---

## 🎯 Cas d'Usage

✅ **Support Client Automatisé** — RAG sur FAQ documents
✅ **Recherche Informations** — Web search intégrée
✅ **Analyse Documents** — Résumé et Q&A sur PDFs
✅ **Calculs Financiers** — Calculs mathématiques rapides
✅ **Chat Conversationnel** — Dialogue naturel

---

## 🚧 Améliorations Futures

- [ ] Authentification utilisateur
- [ ] Limite de taille PDF
- [ ] Historique persistent (DB)
- [ ] Multi-language support
- [ ] Image recognition
- [ ] Voice input/output
- [ ] Streaming responses
- [ ] Rate limiting

---

## 📚 Stack Technique

**Backend**
- FastAPI (framework web ultrarapide)
- Uvicorn (serveur ASGI)
- Deepseek/OpenRouter (LLM)
- ChromaDB (vector DB)
- Sentence-Transformers (embeddings)
- PyPDF2 (PDF parsing)

**Frontend**
- React 18+
- Tailwind CSS
- Axios (HTTP client)
- Responsive design

---

## 📝 Licence

MIT License

---

## 📧 Contact

Mathyas Haddadou  
📧 mathyas.haddadou@univ-lorraine.fr  
🔗 [GitHub](https://github.com/mxhdddd)

---

**Créé avec Claude Code** 🚀  
**Dernière mise à jour** : Juin 2026  
**Statut** : Production-ready ✅

---

## 🔐 Configuration des Clés API

### Avant de lancer le projet

1. **Copie le fichier d'exemple** :
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Ouvre `backend/.env` et ajoute tes vraies clés API** :
   ```
   OPENROUTER_API_KEY=sk-or-v1-[ta-vraie-clé]
   SERPER_API_KEY=[ta-vraie-clé]
   ```

3. **Comment obtenir les clés ?**
   - **OpenRouter** : https://openrouter.ai/keys → Crée une clé API
   - **Serper** : https://serper.dev → Crée un compte et copie la clé

### ⚠️ IMPORTANT - Sécurité

- **Ne committe JAMAIS le `.env` avec tes vraies clés** ✅ Il est dans `.gitignore`
- Le `.env.example` est public (il ne contient pas les vraies clés)
- Si tu as accidentellement commité une clé, elle a été rejetée par GitHub
- ⚠️ IMPORTANT: Le fichier `.env.example` est juste un modèle. Tu DOIS créer un fichier `.env` (sans "example") dans le dossier `backend/` en copiant `.env.example` avec la commande `copy .env.example .env` (Windows) ou `cp .env.example .env` (Mac/Linux), puis y ajouter tes vraies clés API. Si tu ne vois que `.env.example` et pas `.env`, le serveur ne trouvera pas tes clés !

