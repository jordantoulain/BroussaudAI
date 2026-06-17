# Architecture - Local Chatbot Broussaud

**Domaine** : Usine textile Broussaud - Fabrication de chaussettes
**Type** : Application full-stack SaaS interne

---

## Stack Technique

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Python | 3.11+ | Langage |
| FastAPI | - | Framework API |
| Uvicorn | - | Serveur ASGI |
| Supabase | - | Base de données + Vector Store |
| Psycopg2 | - | Client PostgreSQL |
| LlamaIndex | - | Framework RAG |
| Google GenAI | - | LLM (Gemini 3.1 flash-lite) + Embeddings |
| PyJWT | - | JWT |
| Bcrypt | - | Hashing |
| Pydantic | - | Validation |
| Phoenix | - | Logger pour le debug |

### Serveur MCP

| Technologie | Version | Rôle |
|-------------|---------|------|
| Python | 3.12 | Langage |
| FastMCP | - | Framework MCP Server |
| Uvicorn | - | Serveur ASGI |
| Supabase | - | Client Supabase pour accès DB |

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 16.2.7 | Framework (App Router) |
| React | 19.2.4 | UI |
| Tailwind CSS | 4.x | Styling |
| Axios | 1.17.0 | Client HTTP |
| js-cookie | 3.0.8 | Cookies |
| Lucide React | 1.17.0 | Icônes |

### DevOps

| Technologie | Rôle |
|-------------|------|
| Docker | Conteneurisation |
| Docker Compose | Orchestration |

---

## Structure Projet

### Backend (`api/`)

```
api/
├── app/
│   ├── main.py              # Point d'entrée + lifespan + CORS
│   ├── router.py            # Router racine
│   ├── api/
│   │   ├── router.py        # Router API
│   │   └── routes/
│   │       ├── auth.py      # /auth/* (JWT, sessions)
│   │       ├── admin.py     # /admin/* (dashboard, users)
│   │       ├── ia.py        # /ai/* (chat, embedding)
│   │       └── conversations.py # /conversations/* (CRUD conversations)
│   └── core/
│       ├── llm.py          # Configuration LLM/Embeddings
│       ├── supabase_client.py # Client Supabase
│       └── supabase_init.py # Initialisation DB + tables
└── services/
    ├── __init__.py        # Exports centralisés de tous les modules
    ├── agent.py           # Point d'entrée principal (backward compatible)
    ├── config.py          # RAGConfig - Configuration du service RAG
    ├── prompts.py         # PromptManager - Gestion des templates de prompts
    ├── utils.py           # Fonctions utilitaires + patch Gemini
    ├── pdf_generator.py  # PDFGenerator - Génération de PDF et upload Supabase
    ├── rag_service.py     # RAGAgentService - Service RAG avec vector store et outils
    ├── agent_orchestrator.py # Orchestration de l'agent (chat_with_agent)
    └── prompts/           # Fichiers prompts (qa_prompt.txt, system_prompt.txt)
```

### Serveur MCP (`mcp/`)

```
mcp/
├── app/
│   ├── server.py           # Point d'entrée FastMCP + déclaration outils
│   ├── core/
│   │   └── supabase_client.py # Client Supabase (schema public)
│   └── tools/
│       ├── __init__.py     # Exports: hello_world, get_stat_by_name, get_stats_count, get_all_stats, get_stats_by_filter
│       ├── hello_world.py  # Tool: hello_world() -> str
│       ├── stats.py        # Tool: get_stat_by_name(name: str) -> dict
│       └── stats_utils.py  # Tools: get_stats_count(), get_all_stats(), get_stats_by_filter(filters: Dict)
├── Dockerfile              # Image Docker (Python 3.12-slim, port 8000)
└── requirements.txt        # Dépendances: uvicorn[standard], supabase, fastmcp
```

### Frontend (`web/`)

```
web/
├── src/
│   ├── app/
│   │   ├── layout.js        # Layout racine + AnimatedBackground
│   │   ├── page.js          # Redirection /chat ou /login
│   │   ├── globals.css      # Styles globaux Tailwind
│   │   ├── chat/
│   │   │   ├── layout.jsx    # Layout commun chat avec sidebar
│   │   │   ├── page.jsx      # Interface chat principale
│   │   │   └── archives/
│   │   │       ├── page.jsx      # Liste des archives
│   │   │       └── [id]/
│   │   │           └── page.jsx  # Détail d'une archive
│   │   ├── admin/
│   │   │   ├── layout.jsx    # Layout admin avec AdminSidebar
│   │   │   ├── page.jsx      # Redirection vers /admin/dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.jsx  # Stats admin avec MiniChart
│   │   │   ├── members/
│   │   │   │   └── page.jsx  # CRUD membres avec SideCanvas + DeleteModal
│   │   │   └── conversations/
│   │   │       └── page.jsx  # Liste conversations avec recherche + filtres
│   │   ├── login/page.jsx   # Connexion
│   │   ├── register/page.jsx # Inscription
│   │   ├── logout/page.jsx  # Déconnexion
│   │   ├── actions/
│   │   │   └── auth.js      # Server Actions (login, register, logout)
│   │   └── api/
│   │       ├── refresh/route.js # Rafraîchissement token
│   │       └── user/route.js     # Infos utilisateur
│   ├── proxy.js              # Middleware (ex-middleware.js) Next.js 16
│   ├── components/
│   │   ├── shared/         # Composants partagés
│   │   │   └── Logo.jsx
│   │   ├── auth/           # Composants auth
│   │   │   ├── AuthCard.jsx
│   │   │   ├── ErrorAlert.jsx
│   │   │   ├── FormButton.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── FormRow.jsx
│   │   │   └── AuthLink.jsx
│   │   ├── chat/           # Composants chat
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SidebarCollapsed.jsx
│   │   │   ├── NavigationSelector.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── NewConversationButton.jsx
│   │   │   ├── ConversationList.jsx
│   │   │   ├── ConversationItem.jsx
│   │   │   ├── MessageMeta.jsx
│   │   │   └── TagBadge.jsx
│   │   ├── layout/
│   │   │   └── AnimatedBackground.jsx
│   │   ├── admin/
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── AdminNavigation.jsx
│   │   │   ├── MiniChart.jsx
│   │   │   ├── SideCanvas.jsx
│   │   │   ├── UserForm.jsx
│   │   │   ├── DeleteModal.jsx
│   │   │   └── RoleDropdown.jsx
│   │   ├── shared/
│   │   │   ├── index.js
│   │   │   ├── ErrorAlert.jsx
│   │   │   ├── LoadingIndicator.jsx
│   │   │   └── Logo.jsx
│   │   └── ui/
│   │       └── Dropdown.jsx
│   ├── hooks/
│   │   ├── useChat.js
│   │   ├── useUserInfo.js
│   │   ├── useConversations.js
│   │   ├── useClickOutside.js
│   │   └── index.js
│   └── services/
│       └── api.js          # Axios + interceptors
└── public/
    └── favicon.ico
```

---

## Base de Données (Supabase)

### Schéma `public`

| Table | Champs |
|-------|--------|
| **users** | id (UUID), nom, prenom, mail (UNIQUE), mdp (bcrypt), role (VARCHAR(50), DEFAULT 'USER') |
| **conversations** | id (UUID), user_id (FK), title (TEXT), is_active (BOOLEAN), created_at |
| **messages** | id (SERIAL), conversation_id (FK), question, label, sub_label, tags (JSONB), contexts (JSONB), response, created_at |
| **sessions** | id (UUID), user_id (FK), device_info, created_at, expires_at |

### Schéma `vecs` (Vector Store)

| Table | Champs |
|-------|--------|
| **documents_gemini** | id (UUID), vec (VECTOR(3072)), metadata (JSONB) |

**Index** : HNSW pour recherche vectorielle rapide
**Dimension** : 3072 (Google GenAI gemini-embedding-2)

---

## Endpoints API

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| **Authentification** |
| POST | `/auth/register` | ❌ | Inscription |
| POST | `/auth/login` | ❌ | Connexion |
| POST | `/auth/logout` | ✅ | Déconnexion |
| POST | `/auth/refresh` | ❌ | Rafraîchissement token |
| **Conversations** |
| GET | `/conversations` | ✅ | Liste des conversations actives utilisateur |
| GET | `/conversations/{id}` | ✅ | Charger une conversation avec messages |
| GET | `/conversations/archives` | ✅ | Liste des conversations archivées |
| GET | `/conversations/archives/{id}` | ✅ | Charger une archive avec messages |
| DELETE | `/conversations/{id}` | ✅ | Soft-delete une conversation (is_active=false) |
| **IA** |
| POST | `/ai/chat` | ✅ | Chat avec RAG |
| POST | `/ai/embedding` | ✅ | Upload document (PDF/TXT/JSON/CSV/XLSX/MD) - ADMIN only, vérifie doublons via metadata.filename |
| **Administration** |
| GET | `/admin/` | ✅ | Dashboard admin avec stats + timeline (ADMIN seulement) |
| GET | `/admin/users` | ✅ | Liste utilisateurs (ADMIN seulement) |
| POST | `/admin/users` | ✅ | Créer utilisateur (ADMIN seulement) |
| PUT | `/admin/users/{id}` | ✅ | Mettre à jour utilisateur (ADMIN seulement) |
| DELETE | `/admin/users/{id}` | ✅ | Supprimer utilisateur (ADMIN seulement) |
| GET | `/admin/conversations` | ✅ | Liste TOUTES les conversations avec user_mail (ADMIN seulement) |
| GET | `/admin/conversations/{id}` | ✅ | Détail conversation + messages avec user_mail (ADMIN seulement) |
| GET | `/admin/documents` | ✅ | Liste documents regroupés par filename (ADMIN seulement) |
| DELETE | `/admin/documents/{filename}` | ✅ | Supprime toutes les lignes d'un fichier (chunks) (ADMIN seulement) |

---

## Outils MCP (`mcp/`)

| Tool | Description | Paramètres | Retour |
|------|-------------|-----------|--------|
| **get_user_stats_count** | Compte total des enregistrements dans stats_users | - | `int` |
| **get_user_performance** | Historique détaillé des performances d'un utilisateur | `utilisateur: str`, `limit_days: int=7` | `List[Dict]` |
| **get_daily_summary** | Bilan complet de production pour une date | `date: str` | `List[Dict]` |
| **get_user_stats_by_filter** | Stats utilisateur filtrées | `filters: Dict` | `List[Dict]` |
| **get_top_performers** | Top performeurs (opérateurs les plus productifs) | - | `List[Dict]` |
| **get_quality_alerts** | Alertes qualité basées sur les données | - | `List[Dict]` |
| **get_period_summary** | Résumé périodique des statistiques | - | `List[Dict]` |
| **get_aggregated_stats_by_user** | Stats agrégées par utilisateur | - | `List[Dict]` |
| **get_aggregated_stats_by_emplacement** | Stats agrégées par poste/emplacement | - | `List[Dict]` |

---

## Routes Frontend

| Route | Auth | Description |
|-------|------|-------------|
| `/` | ❌ | Redirection /chat ou /login |
| `/login` | ❌ | Connexion |
| `/register` | ❌ | Inscription |
| `/chat` | ✅ | Interface chat |
| `/logout` | ✅ | Déconnexion |
| `/admin` | ✅ | Redirection vers /admin/dashboard |
| `/admin/dashboard` | ✅ | Stats admin avec MiniChart (ADMIN seulement) |
| `/admin/members` | ✅ | CRUD membres avec SideCanvas (ADMIN seulement) |
| `/admin/conversations` | ✅ | Liste toutes conversations (ADMIN seulement) |
| `/admin/conversations/{id}` | ✅ | Détail conversation (ADMIN seulement) |
| `/admin/documents` | ✅ | Gestion des embeddings de documents (ADMIN seulement) |
| `/chat/archives` | ✅ | Liste des archives utilisateur (lecture seule) |
| `/chat/archives/{id}` | ✅ | Détail d'une archive (lecture seule) |
| `/api/refresh` | ❌ | Rafraîchissement token (API Route) |
| `/api/user` | ✅ | Infos utilisateur (API Route) |

---

## Flux de Données

### Authentification
```
Utilisateur → Frontend → POST /auth/login → Backend → Vérification JWT
↓
Backend génère tokens → Frontend stocke cookies → Redirection /chat
↓
Intercepteur Axios détecte 401 → Appel /api/refresh → Nouveau access_token
```

### Chat avec RAG
```
Utilisateur → Frontend → POST /ai/chat → Backend → get_current_user
↓
Backend → RAGAgentService (VectorStoreIndex, SupabaseVectorStore) → chat_with_agent (FunctionAgent LlamaIndex + outils RAG/MCP + historique)
↓
Backend sauvegarde message + met à jour titre conversation depuis rag_result.title
↓
Frontend → Affichage avec classification automatique et contextes utilisés
```

### Gestion des Archives
```
Utilisateur → Frontend /chat → Clic "Mes archives" → /chat/archives
↓
Frontend → GET /conversations/archives → Backend → Filtre is_active=false + user_id
↓
Backend retourne {conversations: [...]}
↓
Frontend → Affiche grille responsive (1/2 colonnes) avec recherche et pagination
↓
Utilisateur → Clic sur archive → /chat/archives/{id}
↓
Frontend → GET /conversations/archives/{id} → Backend → Vérifie user_id + is_active=false
↓
Backend retourne {conversation, messages: [...]}
↓
Frontend → Affiche messages en lecture seule (pas d'input, ChatHeader avec isArchived)
```

### Embedding
```
Utilisateur → Frontend → POST /ai/embedding → Backend
↓
Backend → PDFReader → Nodes → index.insert_nodes (Supabase Vector Store)
```

---

## Sécurité

| Mécanisme | Implémentation |
|-----------|----------------|
| **Authentification** | JWT (HS256) |
| **access_token** | 5 min, contient {sub, mail, nom, prenom, role} |
| **refresh_token** | 7 jours, contient + session_id |
| **Hachage mdp** | Bcrypt avec salt aléatoire |
| **Sessions** | Stockées dans Supabase avec device_info |
| **CORS** | `allow_origins=["http://localhost:3000"]` |
| **Cookies** | access_token (httpOnly=false), refresh_token (httpOnly=true) |

---

## Infrastructure

### Développement
```
Docker Compose (api/)
Service: ai
- Port: ${PORTS}
- Environment:
  SUPABASE_URL
  SUPABASE_KEY
  SUPABASE_CONNECTION_STRING
  JWT_SECRET
  GOOGLE_API_KEY

Serveur MCP (mcp/)
- Port: 8000
- Environment:
  SUPABASE_URL
  SUPABASE_KEY
```

### Production
```
Client → Frontend (Next.js:3000) → Backend (FastAPI:8000) → Supabase Cloud
                                 ↓
                           Google Cloud (GenAI API)

Serveur MCP (FastMCP:8000) → Supabase Cloud (schema public, table stats)
```

---

## Configuration LLM

| Fournisseur | Modèle | Dimension | Statut |
|-------------|--------|----------|--------|
| Google GenAI | gemini-3.1-flash-lite | 3072 | ✅ Actif |
| Google GenAI | gemini-embedding-2 | 3072 | ✅ Actif |
| Ollama | qwen3:0.6b | 768 | ❌ Optionnel |
| Ollama | nomic-embed-text | 768 | ❌ Optionnel |
| MistralAI | mistral-small-2506 | 1024 | ❌ Optionnel |
| MistralAI | mistral-embed-2312 | 1024 | ❌ Optionnel |
