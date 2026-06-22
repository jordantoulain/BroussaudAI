# Broussaud AI - Projet Pédagogique BTS SIO

**Projet de stage - Entreprise Broussaud**
**Lycée Suzanne Valadon, Limoges**
**BTS SIO (Services Informatiques aux Organisations) - Option SLAM**

---

## 📚 Contexte Pédagogique

Ce projet s'inscrit dans le cadre d'un **stage de fin de première année du BTS SIO** réalisé au sein de l'entreprise **Broussaud**, spécialisée dans la fabrication de chaussettes de qualité en Nouvelle-Aquitaine. L'objectif pédagogique est de concevoir et développer une **application full-stack d'intelligence artificielle conversationnelle** dédiée à l'entreprise, permettant aux collaborateurs d'accéder à une assistance technique et informationnelle basée sur les données internes.

**Période de stage:** 5 semaines.

---

## 🎯 Objectifs du Projet

### Objectifs Pédagogiques (BTS SIO - SLAM)

| Compétence | Description | Niveau Visé |
|------------|-------------|-------------|
| **C1.1** | Analyse des besoins et conception de solutions | Maîtrisé |
| **C1.2** | Développement d'applications | Avancé |
| **C1.3** | Intégration de solutions | Avancé |
| **C1.4** | Administration des systèmes | Intermédiaire |
| **C2.1** | Gestion de projet | Avancé |
| **C4.1** | Maintenance et évolution | Intermédiaire |

### Objectifs Techniques

- ✅ Développer une application **full-stack** moderne (Next.js 16 + FastAPI)
- ✅ Implémenter un système de **chat intelligent** avec RAG (Retrieval-Augmented Generation)
- ✅ Intégrer des **mécanismes d'authentification sécurisés** (JWT, MFA)
- ✅ Concevoir une **interface utilisateur responsive** et intuitive
- ✅ Mettre en place une **architecture scalable** pour l'entreprise
- ✅ Documenter l'ensemble du projet selon les normes professionnelles

---

## 🏗️ Architecture du Projet

```
local_chatbot/
├── api/          # Backend FastAPI (Python 3.11+)
│   ├── app/      # Application FastAPI
│   │   ├── main.py              # Point d'entrée
│   │   ├── router.py            # Configuration des routes
│   │   ├── api/routes/          # Endpoints API
│   │   └── core/               # Modules principaux
│   └── services/ # Services métier (RAG, IA, etc.)
│
├── web/          # Frontend Next.js 16
│   ├── src/app/  # Pages et routes
│   ├── components/ # Composants React
│   └── services/ # Services frontend
│
├── mcp/          # Serveur MCP (Model Context Protocol)
│   └── app/      # Application FastMCP
│
└── docs/         # Documentation technique et pédagogique
    ├── CONTEXTE_PEDAGOGIQUE.md  # Contexte du stage
    ├── STAGE_BTS_SIO.md         # Suivi et évaluation
    ├── architecture.md         # Architecture technique
    ├── changelog.md            # Historique des modifications
    └── ...
```

---

## 🚀 Fonctionnalités Principales

### 🔐 Authentification & Sécurité
- **Système JWT** avec tokens d'accès (5 min) et de rafraîchissement (1 jour)
- **Authentification à deux facteurs (MFA)** via TOTP (Time-based One-Time Password)
- **Gestion des rôles** (USER/ADMIN) avec autorisations différenciées
- **Soft-delete** des comptes utilisateurs pour la conformité RGPD

### 💬 Chat Intelligent avec RAG
- **Assistant IA spécialisé** sur le domaine textile (usine Broussaud)
- **Récupération de contexte** (RAG) depuis les documents internes
- **Classification automatique** des conversations (labels, tags)
- **Historique des échanges** avec recherche et filtrage
- **Épinglage des conversations** favorites

### 📁 Gestion des Documents
- **Upload multi-formats** : PDF, TXT, JSON, CSV, XLSX, Markdown
- **Indexation vectorielle** via Supabase Vector Store
- **Vérification des doublons** avant insertion
- **Interface d'administration** pour la gestion des embeddings

### 📊 Panneau d'Administration
- **Dashboard** avec statistiques (utilisateurs, conversations, messages)
- **CRUD utilisateurs** avec gestion des rôles
- **Visualisation des conversations** et métriques IA
- **Tableau de bord** avec graphiques (ApexCharts)

### 🎨 Interface Utilisateur
- **Design responsive** (mobile, tablette, desktop)
- **Thème clair** basé sur la palette neutre (100-400)
- **Animations fluides** pour une expérience utilisateur optimale
- **Accessibilité** respectée selon les normes WCAG

### 🔌 Serveur MCP
- **Intégration avec Model Context Protocol** pour l'accès aux données
- **Outils dédiés** aux statistiques de production (usine textile)
- **Architecture modulaire** pour l'extensibilité

---

## 🛠️ Stack Technique

### Backend
- **Langage**: Python 3.11+
- **Framework**: FastAPI (ASGI)
- **Serveur**: Uvicorn
- **Base de données**: Supabase (PostgreSQL + Vector Store)
- **ORM/ODM**: SQLAlchemy, Psycopg2
- **IA/RAG**: LlamaIndex + Google GenAI (Gemini)
- **Authentification**: JWT, Bcrypt, PyOTP
- **Validation**: Pydantic
- **Logging**: Phoenix

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19.2.4
- **Styling**: Tailwind CSS 4.x
- **HTTP Client**: Axios
- **Cookies**: js-cookie
- **Icons**: Lucide React
- **Graphiques**: ApexCharts (via react-apexcharts)

### Infrastructure
- **Conteneurisation**: Docker + Docker Compose
- **Hébergement**: Adaptable (local, cloud)
- **CI/CD**: Intégrable (GitHub Actions, GitLab CI)

---

## 📦 Prérequis

### Environnement de Développement
- **Node.js**: 18.0.0 ou supérieur (recommandé: 20.x LTS)
- **Python**: 3.11 ou supérieur
- **Docker**: 24.0 ou supérieur (pour l'exécution conteneurisée)
- **Git**: 2.40 ou supérieur

### Outils Recommandés
- **Éditeur de code**: Visual Studio Code, PyCharm, WebStorm
- **Gestionnaire de paquets**: npm 10+ ou pnpm
- **Base de données**: Compte Supabase (gratuit pour le développement)
- **API Google**: Clé Google GenAI (Gemini) - à demander au tuteur entreprise

---

## 💻 Installation et Configuration

### 1. Cloner le dépôt

```bash
# Cloner le projet
git clone https://github.com/[votre-repo]/local_chatbot.git
cd local_chatbot

# Initialiser les sous-modules (si applicable)
git submodule update --init --recursive
```

### 2. Configuration Backend

```bash
# Se déplacer dans le backend
cd api

# Créer l'environnement virtuel (recommandé)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OU
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
# Copier le fichier d'exemple et le compléter
cp .env.example .env

# Variables obligatoires dans .env:
# SUPABASE_URL=your-supabase-url
# SUPABASE_KEY=your-supabase-anon-key
# SUPABASE_CONNECTION_STRING=your-postgresql-connection-string
# JWT_SECRET=$(openssl rand -hex 32)  # Générer un secret unique
# GOOGLE_API_KEY=your-google-genai-api-key
# RAG_COLLECTION_NAME=documents_gemini
# RAG_EMBEDDING_DIM=3072
# RAG_SIMILARITY_TOP_K=10
```

### 3. Initialisation de la Base de Données

```bash
# Exécuter le script d'initialisation de Supabase
# Ce script crée les tables nécessaires : users, conversations, messages, sessions, etc.
python app/core/supabase_init.py
```

### 4. Configuration Frontend

```bash
# Se déplacer dans le frontend
cd ../web

# Installer les dépendances npm
npm install

# Configurer les variables d'environnement
# Copier le fichier d'exemple et le compléter
cp .env.example .env

# Variable obligatoire dans .env:
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5. Lancement des Services

**Option 1: Développement local (recommandé)**

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
```

**Option 2: Avec Docker Compose**

```bash
# Depuis la racine du projet
cd api
docker-compose up --build
```

### 6. Accès à l'Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Serveur MCP**: http://localhost:8010

---

## 📖 Documentation

### Documentation Technique
- [📐 Architecture](docs/architecture.md) - Schéma technique complet
- [📋 Plan de Développement](docs/plan.md) - Roadmap et tâches
- [🔧 Références](docs/references.md) - Variables d'environnement, dépendances
- [🎨 UI/UX](docs/ui.md) - Guide de style et composants
- [📚 Registry](docs/registry.md) - Catalogue des composants et fonctions
- [✨ Features](docs/features.md) - Liste complète des fonctionnalités
- [📝 Changelog](docs/changelog.md) - Historique des modifications

---

## 🎓 Apprentissages Clés

### Compétences Développées

#### Développement Backend (Python/FastAPI)
- ✅ Architecture RESTful avec FastAPI
- ✅ Intégration avec Supabase (PostgreSQL + Vector Store)
- ✅ Implémentation de l'authentification JWT
- ✅ Gestion des rôles et permissions
- ✅ Intégration de l'IA générative (RAG)
- ✅ Manipulation de fichiers (PDF, CSV, etc.)
- ✅ Validation de données avec Pydantic

#### Développement Frontend (Next.js/React)
- ✅ Architecture Next.js 16 avec App Router
- ✅ Composants React réutilisables
- ✅ Gestion d'état avec hooks personnalisés
- ✅ Styling avec Tailwind CSS 4
- ✅ Appels API avec Axios et interceptors
- ✅ Gestion des cookies et sessions
- ✅ Design responsive et accessible

#### Base de Données (Supabase)
- ✅ Conception de schéma de base de données
- ✅ Implémentation de Vector Store pour l'IA
- ✅ Requêtes SQL avancées
- ✅ Gestion des transactions
- ✅ Optimisation des performances

#### DevOps et Infrastructure
- ✅ Conteneurisation avec Docker
- ✅ Orchestration avec Docker Compose
- ✅ Gestion des configurations
- ✅ Déploiement et CI/CD

#### Sécurité
- ✅ Authentification JWT sécurisée
- ✅ Authentification à deux facteurs (MFA)
- ✅ Protection contre les injections (SQL, XSS)
- ✅ Validation des entrées utilisateur
- ✅ Gestion des erreurs et logging
- ✅ Audit de sécurité complet

---

## 📊 Métriques du Projet

### Complexité Technique
- **Lignes de code**: ~15,000+ (Backend + Frontend)
- **Fichiers sources**: 100+ fichiers
- **Routes API**: 30+ endpoints
- **Composants React**: 40+ composants
- **Tables de base de données**: 6+ tables principales

### Statistiques de Développement
- **Durée du projet**: 5 semaines
- **Heures investies**: 35 heures
- **Technologies maîtrisées**: 15+
- **Documentation produite**: 10+ fichiers

---

## 📜 Licence

Ce projet est développé dans le cadre d'un **stage éducatif** pour le **BTS SIO du lycée Suzanne Valadon**. 

**Propriété intellectuelle**: Entreprise Broussaud, Limoges
**Utilisation autorisée**: Dans le cadre pédagogique du BTS SIO uniquement
**Redistribution**: Interdite sans autorisation préalable

---

*Projet réalisé dans le cadre du BTS SIO - Option SLAM*
*Lycée Suzanne Valadon, Limoges - Académie de Limoges*
*© 2026 - Entreprise Broussaud & Lycée Suzanne Valadon*
