# Références Techniques - Projet Broussaud AI (Stage BTS SIO)

**Documentation technique pour le projet pédagogique**
**BTS SIO Option SLAM - Lycée Suzanne Valadon & Entreprise Broussaud**

---

## 🔐 Variables d'Environnement

**⚠️ SÉCURITÉ CRITIQUE (Compétences: C2.2, C2.3)**
- **NE JAMAIS** committer de fichiers `.env` avec des valeurs réelles dans le dépôt Git
- **NE JAMAIS** partager les clés secrètes (JWT_SECRET, API Keys) par email ou messagerie
- **TOUJOURS** utiliser les fichiers `.env.example` comme templates
- **TOUJOURS** ajouter `.env` au fichier `.gitignore`

### Backend (`api/.env.example`) - Configuration Python

**Apprentissage**: Gestion des configurations d'application, protection des secrets

| Variable | Description | Obligatoire | Valeur par défaut | Compétences |
|----------|-------------|------------|------------------|-------------|
| `SUPABASE_URL` | URL du projet Supabase (base de données) | ✅ | - | C1.3 |
| `SUPABASE_KEY` | Clé anonyme (anon key) pour l'accès public | ✅ | - | C1.3, C2.3 |
| `SUPABASE_CONNECTION_STRING` | Connection string PostgreSQL pour les requêtes directes | ✅ | - | C1.3 |
| `JWT_SECRET` | **Secret pour signer les tokens JWT** - Générer avec `openssl rand -hex 32` | ✅ | - | C2.3 |
| `GOOGLE_API_KEY` | Clé API Google GenAI (pour Gemini) | ✅ | - | C1.2 |
| `PORTS` | Port Docker Compose | ✅ | 8000 | C1.4 |
| `RAG_COLLECTION_NAME` | Nom de la collection dans le vector store | ✅ | documents_gemini | C1.2 |
| `RAG_EMBEDDING_DIM` | Dimension des embeddings | ✅ | 3072 (Gemini) | C1.2 |
| `RAG_SIMILARITY_TOP_K` | Nombre de résultats similaires à retourner | ✅ | 10 | C1.2 |
| `MCP_SERVER_URL` | URL du serveur MCP | ✅ | http://host.docker.internal:8010/mcp | C1.3 |
| `OLLAMA_BASE_URL` | URL Ollama (pour développement local) | ❌ | http://localhost:11434 | C1.2 |
| `MISTRAL_API_KEY` | Clé MistralAI (alternative à Google) | ❌ | - | C1.2 |

### Serveur MCP (`mcp/.env.example`) - Configuration du serveur MCP

| Variable | Description | Obligatoire | Compétences |
|----------|-------------|------------|-------------|
| `SUPABASE_URL` | URL du projet Supabase | ✅ | C1.3 |
| `SUPABASE_KEY` | Clé anonyme (anon key) | ✅ | C1.3, C2.3 |

### Frontend (`web/.env.example`) - Configuration Next.js

| Variable | Description | Obligatoire | Compétences |
|----------|-------------|------------|-------------|
| `NEXT_PUBLIC_API_URL` | URL du backend API | ✅ | C1.3 |

⚠️ **IMPORTANT**: Les variables préfixées par **NEXT_PUBLIC_** sont **visibles par le client** (dans le code JavaScript exécuté côté navigateur). Ne JAMAIS y mettre de secrets !

---

## 📦 Dépendances Majeures

### Backend (`api/requirements.txt`) - Python 3.11+

**Stack technique backend - Apprentissage: Intégration de bibliothèques Python pour le développement web**

| Package | Version | Rôle | Apprentissage | Compétences |
|---------|---------|------|--------------|-------------|
| **fastapi** | - | Framework API REST moderne, basé sur Pydantic | Développement d'API robustes | C1.2, C1.3 |
| **uvicorn[standard]** | - | Serveur ASGI performant pour FastAPI | Déploiement d'applications Python | C1.3, C1.4 |
| **supabase** | - | Client Python pour Supabase (PostgreSQL + Vector Store) | Intégration base de données cloud | C1.2, C1.3 |
| **python-multipart** | - | Gestion de l'upload de fichiers | Upload de documents | C1.2 |
| **bcrypt** | - | Hashing sécurisé des mots de passe | Sécurité des données | C2.2, C2.3 |
| **PyJWT** | - | Encodage/Décodage des tokens JWT | Authentification moderne | C2.3 |
| **pydantic[email]** | - | Validation des données + support email | Validation avancée | C2.2 |
| **llama-index** | - | Framework RAG pour l'IA conversationnelle | Intégration IA | C1.2, C1.3 |
| **llama-index-llms-google-genai** | - | Support des modèles Google (Gemini) | LLM providers | C1.2 |
| **llama-index-embeddings-google-genai** | - | Embeddings Google (gemini-embedding-2) | Vectorisation | C1.2 |
| **llama-index-vector-stores-supabase** | - | Vector Store Supabase pour LlamaIndex | Stockage vectoriel | C1.2, C1.3 |
| **llama-index-readers-file** | - | Lecteur de fichiers PDF | Traitement de documents | C1.2 |
| **llama-index-readers-file.pandas** | - | Lecteur pour JSON, CSV, XLSX via Pandas | Multi-formats | C1.2 |
| **llama-index-llms-mistralai** | - | Support des modèles MistralAI (optionnel) | Multi-providers | C1.2 |
| **llama-index-embeddings-mistralai** | - | Embeddings MistralAI (optionnel) | Alternative | C1.2 |
| **llama-index-llms-ollama** | - | Support d'Ollama (LLM local) | Développement local | C1.2 |
| **llama-index-embeddings-ollama** | - | Embeddings Ollama (optionnel) | Développement local | C1.2 |
| **llama-index-tools-mcp** | - | Intégration MCP (Model Context Protocol) | Protocole moderne | C1.3 |
| **google-genai** | - | SDK Google GenAI (Gemini) | API Google | C1.2 |
| **pandas** | - | Manipulation de données (lecteur XLSX) | Data processing | C1.2 |
| **openpyxl** | - | Support des fichiers Excel (XLSX) | Manipulation Excel | C1.2 |
| **pyotp** | - | Génération et vérification TOTP | MFA | C2.3 |
| **qrcode** | - | Génération de QR codes | MFA enrollment | C2.3 |
| **phoenix** | - | Logger pour le debug et le suivi des requêtes | Logging avancé | C1.2 |

### Serveur MCP (`mcp/requirements.txt`) - Python 3.12+

| Package | Version | Rôle | Compétences |
|---------|---------|------|-------------|
| **uvicorn[standard]** | - | Serveur ASGI | C1.3, C1.4 |
| **supabase** | - | Client Supabase | C1.3 |
| **fastmcp** | - | Framework MCP Server | C1.2, C1.3 |

### Frontend (`web/package.json`) - Node.js 18+

**Stack technique frontend - Apprentissage: Développement d'interfaces modernes avec React et Next.js**

| Package | Version | Rôle | Apprentissage | Compétences |
|---------|---------|------|--------------|-------------|
| **next** | 16.2.7 | Framework React avec App Router | Développement moderne | C1.2, C1.3 |
| **react** | 19.2.4 | Bibliothèque UI | Composants React | C1.2 |
| **react-dom** | 19.2.4 | DOM React | Rendu côté client | C1.2 |
| **tailwindcss** | 4.x | Framework CSS utility-first | Styling moderne | C1.2 |
| **@tailwindcss/postcss** | - | Plugin PostCSS pour Tailwind | Configuration | C1.3 |
| **axios** | 1.17.0 | Client HTTP | Appels API | C1.2, C1.3 |
| **js-cookie** | 3.0.8 | Gestion des cookies | Stockage des tokens | C1.3, C2.3 |
| **lucide-react** | 1.17.0 | Bibliothèque d'icônes | UI moderne | C1.2 |
| **react-apexcharts** | - | Wrapper React pour ApexCharts | Visualisation de données | C1.2 |
| **apexcharts** | - | Librairie de graphiques | Dashboards | C1.2 |

---

## 💻 Commandes Spécifiques

### Backend (FastAPI + Python)

**Apprentissage: Déploiement et développement avec FastAPI**

```bash
# 📦 Installation des dépendances
cd api
pip install -r requirements.txt

# 🚀 Lancer le serveur en mode développement (avec reload)
uvicorn app.main:app --reload --port 8000

# 🏭 Lancer le serveur en mode production
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 🐳 Lancer avec Docker Compose (recommandé pour la production)
cd api
docker-compose up --build

# 🧹 Lancer avec cleanup
cd api
docker-compose down && docker-compose up --build

# 🔍 Accéder à la documentation Swagger
# Ouvrir dans le navigateur: http://localhost:8000/docs
```

### Serveur MCP (FastMCP + Python)

**Apprentissage: Développement d'un serveur MCP pour l'intégration de données**

```bash
# 📦 Installation des dépendances
cd mcp
pip install -r requirements.txt

# 🚀 Lancer le serveur en mode développement
uvicorn app.server:app --reload --port 8010

# 🏭 Lancer le serveur en mode production
uvicorn app.server:app --host 0.0.0.0 --port 8010

# 🐳 Builder et lancer avec Docker
cd mcp
docker build -t mcp-server . && docker run -p 8010:8010 mcp-server

# 🔍 Tester le serveur MCP
# Utiliser un client MCP ou Postman pour tester les endpoints
```

### Frontend (Next.js + React)

**Apprentissage: Développement moderne avec Next.js 16**

```bash
# 📦 Installation des dépendances
cd web
npm install

# 🚀 Lancer en mode développement (avec hot reload)
npm run dev

# 🏭 Builder pour la production
npm run build

# 🚀 Lancer la version build
npm run start

# ✅ Linting (vérification de la qualité du code)
npm run lint

# 🧹 Linting avec auto-fix
npm run lint -- --fix

# 🔍 Analyser la bundle size
npm run build && npx @next/bundle-analyzer
```

### Full Stack (Développement Local)

**Apprentissage: Développement full-stack intégré**

```bash
# Terminal 1: Backend
cd api
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd web
npm run dev

# Terminal 3: Serveur MCP (optionnel)
cd mcp
uvicorn app.server:app --reload --port 8010

# Terminal 4: Base de données (si local)
# Lancer Supabase localement ou utiliser Supabase Cloud
```

---

## ⚙️ Configuration Technique

### Backend (FastAPI)

**Apprentissage: Configuration d'une API moderne**

| Configuration | Valeur | Description | Compétences |
|---------------|--------|-------------|-------------|
| **CORS** | `allow_origins=["http://localhost:3000"]` | Autorise le frontend à appeler l'API | C2.2 |
| **JWT Algorithm** | HS256 | Algorithme de signature des tokens | C2.3 |
| **access_token** | 5 min | Durée de validité du token d'accès | C2.3 |
| **refresh_token** | 1 jour | Durée de validité du token de rafraîchissement | C2.3 |
| **Vector Store** | `documents_gemini` | Nom de la collection dans Supabase | C1.2 |
| **Dimension** | 3072 | Dimension des embeddings (Gemini) | C1.2 |
| **Similarity Top K** | 10 | Nombre de résultats similaires | C1.2 |

### Frontend (Next.js)

**Apprentissage: Configuration d'une application Next.js moderne**

| Configuration | Valeur | Description | Compétences |
|---------------|--------|-------------|-------------|
| **API Routes** | `/api/refresh` | Rafraîchissement du token JWT | C1.3, C2.3 |
| **API Routes** | `/api/user` | Récupération des infos utilisateur | C1.3 |
| **Cookies** | `access_token` | Token d'accès (httpOnly=false) | C2.3 |
| **Cookies** | `refresh_token` | Token de rafraîchissement (httpOnly=true) | C2.3 |
| **Intercepteur Axios** | - | Rafraîchissement automatique sur 401 | C1.3, C2.3 |

---

## 🎓 Ressources d'Apprentissage

### Documentations Officielles
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - Framework Python
- [Next.js Documentation](https://nextjs.org/docs) - Framework React
- [Supabase Documentation](https://supabase.com/docs) - Base de données
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Framework CSS
- [LlamaIndex Documentation](https://docs.llamaindex.ai/) - Framework RAG
- [Google GenAI Documentation](https://ai.google.dev/) - API Gemini

### Tutoriels Recommandés
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/) - Pour débuter avec FastAPI
- [Next.js Learn](https://nextjs.org/learn) - Pour maîtriser Next.js
- [Supabase Guides](https://supabase.com/docs/guides) - Pour utiliser Supabase efficacement
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/utility-first) - Pour le styling

### Outils de Développement
- **Visual Studio Code** - Éditeur de code recommandé
- **Git / GitHub** - Gestion de version
- **Docker Desktop** - Conteneurisation
- **Postman** - Tests d'API
- **Supabase Dashboard** - Gestion de la base de données

---

## 🔒 Bonnes Pratiques de Sécurité (Compétences: C2.1, C2.2, C2.3)

### Backend
1. ✅ **NE JAMAIS** stocker de secrets dans le code source
2. ✅ **TOUJOURS** utiliser des variables d'environnement
3. ✅ **TOUJOURS** valider les entrées utilisateur (Pydantic)
4. ✅ **TOUJOURS** sanitizer les entrées (bleach pour XSS)
5. ✅ **TOUJOURS** hasher les mots de passe (Bcrypt)
6. ✅ **TOUJOURS** utiliser HTTPS en production
7. ✅ **TOUJOURS** implémenter le rate limiting
8. ✅ **TOUJOURS** protéger les routes sensibles (JWT, rôles)

### Frontend
1. ✅ **NE JAMAIS** mettre de secrets dans le code frontend
2. ✅ **TOUJOURS** utiliser httpOnly pour les cookies sensibles
3. ✅ **TOUJOURS** valider les réponses API
4. ✅ **TOUJOURS** gérer les erreurs graciement
5. ✅ **TOUJOURS** utiliser le préfixe NEXT_PUBLIC_ pour les variables client

### Base de Données
1. ✅ **NE JAMAIS** utiliser l'utilisateur root
2. ✅ **TOUJOURS** utiliser des connexions sécurisées (SSL)
3. ✅ **TOUJOURS** appliquer le principe de moindre privilège
4. ✅ **TOUJOURS** sauvegarder régulièrement les données
5. ✅ **TOUJOURS** chiffrer les données sensibles

---

*Documentation technique maintenue dans le cadre du stage BTS SIO*
*Projet Broussaud AI - Lycée Suzanne Valadon & Entreprise Broussaud*
*© 2026 - Tous droits réservés*
