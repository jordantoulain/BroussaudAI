# Références - Local Chatbot Broussaud

---

## Variables d'Environnement

**⚠️ SÉCURITÉ : NE JAMAIS committer de fichiers `.env` avec des valeurs réelles !**

### Backend (`api/.env.example`)

| Variable | Description | Obligatoire |
|----------|-------------|------------|
| `SUPABASE_URL` | URL du projet Supabase | ✅ |
| `SUPABASE_KEY` | Clé anonyme (anon key) | ✅ |
| `SUPABASE_CONNECTION_STRING` | Connection string PostgreSQL | ✅ |
| `JWT_SECRET` | **Générer avec** `openssl rand -hex 32` | ✅ |
| `GOOGLE_API_KEY` | Clé API Google GenAI | ✅ |
| `PORTS` | Port Docker Compose | ✅ |
| `RAG_COLLECTION_NAME` | Nom collection vector store (défaut: documents_gemini) | ✅ |
| `RAG_EMBEDDING_DIM` | Dimension embeddings (défaut: 3072) | ✅ |
| `RAG_SIMILARITY_TOP_K` | Nombre résultats similaires (défaut: 10) | ✅ |
| `MCP_SERVER_URL` | URL serveur MCP (défaut: http://host.docker.internal:8010/mcp) | ✅ |
| `OLLAMA_BASE_URL` | URL Ollama (dev local) | ❌ |
| `MISTRAL_API_KEY` | Clé MistralAI | ❌ |

### Serveur MCP (`mcp/.env.example`)

| Variable | Description | Obligatoire |
|----------|-------------|------------|
| `SUPABASE_URL` | URL du projet Supabase | ✅ |
| `SUPABASE_KEY` | Clé anonyme (anon key) | ✅ |

### Frontend (`web/.env.example`)

| Variable | Description | Obligatoire |
|----------|-------------|------------|
| `NEXT_PUBLIC_API_URL` | URL du backend | ✅ |

⚠️ **NEXT_PUBLIC_** = **visible par le client** → Ne JAMAIS y mettre de secrets !

---

## Dépendances Majeures

### Backend (`api/requirements.txt`)

| Package | Rôle |
|---------|------|
| fastapi | Serveur API |
| uvicorn[standard] | ASGI Server |
| supabase | Client Supabase |
| python-multipart | Upload files |
| bcrypt | Hashing passwords |
| PyJWT | JWT encoding/decoding |
| pydantic[email] | Validation + email support |
| llama-index | Framework RAG |
| llama-index-llms-google-genai | Google LLM support |
| llama-index-embeddings-google-genai | Google Embeddings |
| llama-index-vector-stores-supabase | Supabase Vector Store |
| llama-index-readers-file | PDF/Files reader |
| llama-index-llms-mistralai | Mistral LLM (optionnel) |
| llama-index-embeddings-mistralai | Mistral Embeddings (optionnel) |
| llama-index-llms-ollama | Ollama LLM (optionnel) |
| llama-index-embeddings-ollama | Ollama Embeddings (optionnel) |
| llama-index-tools-mcp | MCP tools integration |
| google-genai | Google GenAI SDK (Gemini) |

### Serveur MCP (`mcp/requirements.txt`)

| Package | Rôle |
|---------|------|
| uvicorn[standard] | ASGI Server |
| supabase | Client Supabase |
| fastmcp | Framework MCP Server |

### Frontend (`web/package.json`)

| Package | Version | Rôle |
|---------|---------|------|
| next | 16.2.7 | Framework |
| react | 19.2.4 | UI |
| react-dom | 19.2.4 | DOM |
| tailwindcss | 4.x | Styling |
| @tailwindcss/postcss | - | Tailwind plugin |
| axios | 1.17.0 | HTTP Client |
| js-cookie | 3.0.8 | Cookies management |
| lucide-react | 1.17.0 | Icons |
| react-apexcharts | - | Wrapper React pour ApexCharts |
| apexcharts | - | Librairie de graphiques |


---

## Commandes Spécifiques

### Backend

```bash
# Lancer serveur (dev)
uvicorn app.main:app --reload --port 8000

# Lancer serveur (prod)
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Docker Compose
cd api && docker-compose up --build
```

### Serveur MCP

```bash
# Lancer serveur (dev)
cd mcp && uvicorn app.server:app --reload --port 8000

# Lancer serveur (prod)
cd mcp && uvicorn app.server:app --host 0.0.0.0 --port 8000

# Docker
cd mcp && docker build -t mcp-server . && docker run -p 8000:8000 mcp-server
```

### Frontend

```bash
npm run dev      # Développement
npm run build    # Production
npm run start    # Lancer build
npm run lint     # Linting
```

---

## Configuration Technique

### Backend

- **CORS** : `allow_origins=["http://localhost:3000"]`
- **JWT** : Tokens signés HS256
  - **access_token** : 5 min
  - **refresh_token** : 7 jours
- **Vector Store** : `documents_gemini` (3072 dimensions) dans Supabase

### Frontend

- **API Routes** : `/api/refresh` (rafraîchissement token), `/api/user` (infos utilisateur)
- **Cookies** : `access_token` (httpOnly=false), `refresh_token` (httpOnly=true)
- **Intercepteur Axios** : Rafraîchissement automatique sur 401
