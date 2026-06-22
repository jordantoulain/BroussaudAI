# Architecture Technique - Projet Broussaud AI (Stage BTS SIO)

**Projet Pédagogique BTS SIO - Option SLAM**
**Lycée Suzanne Valadon, Limoges**
**Entreprise d'accueil: Broussaud - Usine textile spécialisée dans la fabrication de chaussettes**
**Type**: Application full-stack SaaS interne pour l'entreprise

---

## 🎓 Contexte Pédagogique

Ce document d'architecture technique a été développé dans le cadre d'un **stage de fin d'étude du BTS SIO (Services Informatiques aux Organisations)** option **SLAM (Solutions Logicielles et Applications Métiers)** réalisé à l'entreprise Broussaud.

**Objectifs pédagogiques**:
- ✅ Concevoir et documenter une architecture technique complète
- ✅ Appliquer les bonnes pratiques d'architecture logicielle
- ✅ Intégrer des technologies modernes (FastAPI, Next.js, Supabase, LlamaIndex)
- ✅ Respecter les contraintes professionnelles (sécurité, performances, maintenabilité)

**Compétences validées par ce document**: C1.1 (Analyse), C1.2 (Développement), C1.3 (Intégration), C4.1 (Maintenance)

---

## 🏗️ Stack Technique

**Apprentissage**: Sélection et intégration d'une stack technique moderne et adaptée aux besoins de l'entreprise.

### Backend (Python 3.11+)

| Technologie | Version | Rôle | Apprentissage | Compétences |
|-------------|---------|------|---------------|-------------|
| **Python** | 3.11+ | Langage principal | Programmation avancée | C1.2 |
| **FastAPI** | Latest | Framework API REST moderne | Développement d'API performantes | C1.2, C1.3 |
| **Uvicorn** | - | Serveur ASGI | Déploiement d'applications Python | C1.3, C1.4 |
| **Supabase** | - | Base de données PostgreSQL + Vector Store | Intégration cloud, Vector DB | C1.2, C1.3 |
| **Psycopg2** | - | Client PostgreSQL | Connexion DB | C1.3 |
| **LlamaIndex** | - | Framework RAG | IA conversationnelle | C1.2, C1.3 |
| **Google GenAI** | - | LLM (Gemini 3.1 flash-lite) + Embeddings | API Google, Vectorisation | C1.2 |
| **PyJWT** | - | JWT encoding/decoding | Authentification moderne | C2.3 |
| **Bcrypt** | - | Hashing des mots de passe | Sécurité des données | C2.2, C2.3 |
| **Pydantic** | - | Validation des données | Validation avancée | C2.2 |
| **Phoenix** | - | Logger pour le debug | Logging avancé | C1.2 |
| **PyOTP** | - | TOTP generation and verification | MFA | C2.3 |
| **QRCode** | - | Génération de QR codes | Enrôlement MFA | C2.3 |

**Pourquoi FastAPI ?**
- Performances élevées (ASGI)
- Documentation automatique (Swagger/OpenAPI)
- Validation des données intégrée (Pydantic)
- Facilité d'apprentissage et de maintenance
- Support natif de l'asynchrone

**Pourquoi Supabase ?**
- Solution tout-en-un (PostgreSQL + Auth + Storage + Vector Store)
- Gratuit pour le développement
- Intégration facile avec Python
- Support des embeddings pour le RAG

---

### Serveur MCP (Model Context Protocol)

| Technologie | Version | Rôle | Apprentissage | Compétences |
|-------------|---------|------|---------------|-------------|
| **Python** | 3.12 | Langage | Développement moderne | C1.2 |
| **FastMCP** | - | Framework MCP Server | Protocole moderne | C1.2, C1.3 |
| **Uvicorn** | - | Serveur ASGI | Déploiement | C1.3, C1.4 |
| **Supabase** | - | Client Supabase | Accès aux données | C1.3 |

**Pourquoi MCP ?**
- Standard émergent pour l'intégration d'outils IA
- Accès sécurisé aux données de production textile
- Architecture modulaire et extensible
- Intégration native avec LlamaIndex

---

### Frontend (Node.js 18+)

| Technologie | Version | Rôle | Apprentissage | Compétences |
|-------------|---------|------|---------------|-------------|
| **Next.js** | 16.2.7 | Framework React (App Router) | Développement moderne | C1.2, C1.3 |
| **React** | 19.2.4 | Bibliothèque UI | Composants réutilisables | C1.2 |
| **Tailwind CSS** | 4.x | Framework CSS utility-first | Styling moderne | C1.2 |
| **Axios** | 1.17.0 | Client HTTP | Communication API | C1.2, C1.3 |
| **js-cookie** | 3.0.8 | Gestion des cookies | Stockage des tokens | C1.3, C2.3 |
| **Lucide React** | 1.17.0 | Bibliothèque d'icônes | UI moderne | C1.2 |
| **ApexCharts** | - | Librairie de graphiques | Visualisation de données | C1.2 |

**Pourquoi Next.js 16 ?**
- App Router moderne et performant
- Support natif des Server Components
- Optimisation automatique des images
- Routing avancé
- Intégration facile avec Tailwind CSS

**Pourquoi Tailwind CSS ?**
- Développement rapide avec utility classes
- Cohérence du design
- Pas de CSS custom nécessaire
- Maintenance simplifiée

---

### DevOps & Infrastructure

| Technologie | Version | Rôle | Apprentissage | Compétences |
|-------------|---------|------|---------------|-------------|
| **Docker** | 24.0+ | Conteneurisation | Déploiement moderne | C1.4 |
| **Docker Compose** | - | Orchestration | Multi-containers | C1.4 |
| **Git** | 2.40+ | Version control | Collaboration | C1.2 |
| **GitHub** | - | Hébergement de code | CI/CD potentiel | C1.4 |

---

## 🗂️ Structure Projet

### Architecture Globale

```
local_chatbot/
├── api/                          # 🏗️ Backend FastAPI (Python)
│   ├── app/
│   │   ├── main.py              # 🚀 Point d'entrée + lifespan + CORS + Logger Phoenix
│   │   ├── router.py            # 🔄 Router racine
│   │   ├── api/
│   │   │   ├── router.py        # 🔄 Router API
│   │   │   └── routes/          # 📡 Endpoints API
│   │   │       ├── auth.py      # 🔐 /auth/* (JWT, sessions, MFA)
│   │   │       ├── admin.py     # 📊 /admin/* (dashboard, users, conversations, documents)
│   │   │       ├── ia.py        # 🤖 /ai/* (chat RAG, embedding multi-formats)
│   │   │       ├── conversations.py # 💬 /conversations/* (CRUD + archives + pin)
│   │   │       ├── mfa.py       # 🔒 /mfa/* (TOTP MFA: enroll, verify, skip, status)
│   │   │       └── reviews.py    # ⭐ /reviews/* (gestion des avis)
│   │   └── core/               # 🧠 Modules principaux
│   │       ├── llm.py          # ⚙️ Configuration LLM/Embeddings
│   │       ├── supabase_client.py # 🗄️ Client Supabase configuré
│   │       ├── supabase_init.py # 📋 Initialisation DB + tables
│   │       ├── database.py     # 🗃️ Gestion connexions MariaDB (pooling)
│   │       ├── crypto_utils.py # 🔐 Fonctions cryptographiques (Fernet pour MFA)
│   │       └── sanitize.py     # 🧹 Sanitization des entrées (bleach contre XSS)
│   └── services/               # 🎯 Services métier (Architecture modulaire)
│       ├── __init__.py        # 📤 Exports centralisés de tous les modules
│       ├── agent.py           # 🤖 Point d'entrée principal (backward compatible)
│       ├── config.py          # ⚙️ RAGConfig - Configuration du service RAG
│       ├── prompts.py         # 📜 PromptManager - Gestion des templates de prompts
│       ├── utils.py           # 🔧 Fonctions utilitaires + patch Gemini
│       ├── pdf_generator.py  # 📄 PDFGenerator - Génération PDF + upload Supabase
│       ├── rag_service.py     # 🤖 RAGAgentService - Service RAG avec vector store
│       └── agent_orchestrator.py # 🎯 Orchestration de l'agent (chat_with_agent)
│
├── web/                          # 🎨 Frontend Next.js 16
│   ├── src/
│   │   ├── app/                # 📱 Pages et routes (App Router)
│   │   │   ├── globals.css    # 🎭 Styles globaux Tailwind CSS
│   │   │   ├── layout.js      # 🖼️ Layout racine + AnimatedBackground
│   │   │   ├── page.js        # 🚪 Redirection /chat ou /login selon authentification
│   │   │   ├── chat/          # 💬 Interface Chat
│   │   │   │   ├── layout.jsx    # Layout commun pour /chat/* avec sidebar
│   │   │   │   ├── page.jsx      # Interface chat principale
│   │   │   │   └── archives/      # 🗂️ Gestion des archives
│   │   │   │       ├── page.jsx      # Liste des archives (grille responsive)
│   │   │   │       └── [id]/        # Détail d'une archive
│   │   │   │           └── page.jsx  # Affichage archive (lecture seule)
│   │   │   ├── admin/          # 📊 Panneau d'Administration
│   │   │   │   ├── layout.jsx    # Layout admin avec AdminSidebar
│   │   │   │   ├── page.jsx      # Redirection vers /admin/dashboard
│   │   │   │   ├── dashboard/    # 📈 Tableau de bord
│   │   │   │   │   └── page.jsx  # Stats admin avec MiniChart
│   │   │   │   ├── members/      # 👥 Gestion des utilisateurs
│   │   │   │   │   └── page.jsx  # CRUD membres (SideCanvas, DeleteModal)
│   │   │   │   └── conversations/ # 💬 Gestion des conversations
│   │   │   │       ├── page.jsx      # Liste toutes conversations (recherche + filtres)
│   │   │   │       └── [id]/        # Détail d'une conversation
│   │   │   │           └── page.jsx
│   │   │   ├── login/          # 🔐 Authentification
│   │   │   │   ├── page.jsx      # Connexion
│   │   │   │   ├── mfa/         # MFA TOTP
│   │   │   │   │   └── page.jsx  # Configuration et vérification MFA
│   │   │   │   └── MFAClient.jsx # Composant client MFA réutilisable
│   │   │   ├── register/       # 📝 Inscription
│   │   │   │   └── page.jsx
│   │   │   ├── logout/         # 🚪 Déconnexion
│   │   │   │   └── page.jsx
│   │   │   ├── actions/        # ⚡ Server Actions
│   │   │   │   └── auth.js      # loginAction, registerAction, logoutAction
│   │   │   └── api/            # 🔌 API Routes Next.js
│   │   │       ├── refresh/    # Rafraîchissement token
│   │   │       │   └── route.js
│   │   │       └── user/       # Infos utilisateur
│   │   │           └── route.js
│   │   ├── proxy.js            # 🚧 Middleware (remplace middleware.js) - Protection route /admin
│   │   ├── components/        # 🧩 Composants React (40+)
│   │   │   ├── shared/         # 📦 Composants partagés (10+)
│   │   │   │   ├── index.js
│   │   │   │   ├── Logo.jsx
│   │   │   │   ├── Skeleton.jsx (AvatarSkeleton, TextSkeleton, StatsCardSkeleton, TableRowSkeleton, ConversationCardSkeleton)
│   │   │   │   ├── ActionAlert.jsx (ActionError, ActionSuccess)
│   │   │   │   ├── Tag.jsx
│   │   │   │   ├── ErrorAlert.jsx
│   │   │   │   ├── LoadingIndicator.jsx
│   │   │   │   └── index.js (exports)
│   │   │   ├── auth/           # 🔐 Composants Auth (6+)
│   │   │   │   ├── AuthCard.jsx
│   │   │   │   ├── FormInput.jsx
│   │   │   │   ├── FormButton.jsx
│   │   │   │   ├── FormRow.jsx
│   │   │   │   ├── AuthLink.jsx
│   │   │   │   └── index.js
│   │   │   ├── chat/           # 💬 Composants Chat (15+)
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── SidebarCollapsed.jsx
│   │   │   │   ├── NavigationSelector.jsx
│   │   │   │   ├── MessageList.jsx
│   │   │   │   ├── Message.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   ├── ChatHeader.jsx
│   │   │   │   ├── UserProfile.jsx
│   │   │   │   ├── NewConversationButton.jsx
│   │   │   │   ├── ConversationList.jsx
│   │   │   │   ├── ConversationItem.jsx
│   │   │   │   ├── MessageMeta.jsx
│   │   │   │   ├── TagBadge.jsx
│   │   │   │   └── index.js
│   │   │   ├── layout/         # 🖼️ Layout
│   │   │   │   └── AnimatedBackground.jsx
│   │   │   ├── admin/          # 📊 Composants Admin (8+)
│   │   │   │   ├── AdminSidebar.jsx
│   │   │   │   ├── AdminNavigation.jsx
│   │   │   │   ├── MiniChart.jsx
│   │   │   │   ├── SideCanvas.jsx
│   │   │   │   ├── UserForm.jsx
│   │   │   │   ├── DeleteModal.jsx
│   │   │   │   ├── RoleDropdown.jsx
│   │   │   │   └── DocumentUploadForm.jsx
│   │   │   └── ui/             # 🎨 Composants UI génériques
│   │   │       └── Dropdown.jsx
│   │   ├── hooks/             # ⚡ Hooks personnalisés (5+)
│   │   │   ├── useChat.js
│   │   │   ├── useUserInfo.js
│   │   │   ├── useConversations.js
│   │   │   ├── useClickOutside.js
│   │   │   └── index.js
│   │   └── services/          # 🔌 Services frontend
│   │       └── api.js          # Axios + interceptors JWT
│   │
│   └── public/                # 📂 Assets statiques
│       └── favicon.ico
│
├── mcp/                          # 🔌 Serveur MCP (Model Context Protocol)
│   ├── app/
│   │   ├── server.py           # 🚀 Point d'entrée FastMCP + déclaration outils
│   │   ├── core/
│   │   │   └── supabase_client.py # Client Supabase (schema public)
│   │   └── tools/
│   │       ├── __init__.py     # 📤 Exports centralisés des outils MCP
│   │       ├── hello_world.py  # Tool: hello_world() -> str
│   │       └── stats.py        # Tools: get_stat_by_name, get_stats_count, get_all_stats, get_stats_by_filter
│   ├── Dockerfile              # 🐳 Image Docker (Python 3.12-slim, port 8010)
│   └── requirements.txt        # 📦 Dépendances: uvicorn[standard], supabase, fastmcp
│
├── .gitignore                  # 🔒 Fichiers ignorés par Git
├── .env.example                # 📝 Template variables d'environnement (backend)
└── README.md                   # 📖 Documentation principale du projet

└── docs/                         # 📚 Documentation (10+ fichiers)
    ├── CONTEXTE_PEDAGOGIQUE.md  # 🎓 Contexte du stage BTS SIO
    ├── STAGE_BTS_SIO.md         # 📊 Suivi et évaluation du stage
    ├── architecture.md         # 🏗️ Architecture technique (ce document)
    ├── changelog.md            # 📝 Historique des modifications
    ├── plan.md                  # 📋 Plan de développement
    ├── references.md            # 🔧 Références techniques
    ├── ui.md                    # 🎨 Guide UI/UX
    ├── registry.md              # 📚 Catalogue des composants
    ├── features.md              # ✨ Liste des fonctionnalités
    ├── rapport_securite.md      # 🔒 Audit de sécurité
    └── data/
        └── flux_sac.md