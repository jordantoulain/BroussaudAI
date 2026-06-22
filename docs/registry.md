# Registry - Catalogue des Composants Réutilisables (Stage BTS SIO)

**Projet Pédagogique BTS SIO - Option SLAM**
**Lycée Suzanne Valadon & Entreprise Broussaud**

---

## 📚 Introduction

Ce registry (catalogue) documente l'ensemble des **composants, modules, fonctions et services réutilisables** développés dans le cadre du stage BTS SIO. Il sert à:
- **Centraliser** la documentation des éléments réutilisables
- **Faciliter** la maintenance et l'évolution du code
- **Illustrer** les bonnes pratiques de développement apprendre pendant le stage
- **Valider** les compétences acquises (DRY, modularité, réutilisabilité)

**Compétences validées par ce document**: C1.2 (Développer des applications), C1.3 (Intégrer des solutions), C4.1 (Maintenir et faire évoluer)

---

## 🏗️ Backend (FastAPI + Python)

### 📁 Modules Principaux

**Apprentissage**: Architecture modulaire, séparation des responsabilités (SOLID), DRY principle

| Chemin | Description | Utilisation | Compétences | Complexité |
|--------|-------------|-------------|-------------|------------|
| `core/supabase_client.py` | Client Supabase configuré et réutilisable | `from core.supabase_client import supabase` | C1.2, C1.3 | ⭐⭐ |
| `core/supabase_init.py` | Initialisation des tables DB (users, conversations, messages, sessions, reviews, stats_ia, mfa_secrets) | Appelé au startup de l'application | C1.2, C1.3 | ⭐⭐⭐ |
| `core/llm.py` | Configuration des modèles LLM et embeddings | Importé au démarrage | C1.2, C1.3 | ⭐⭐ |
| `core/database.py` | Gestion centralisée des connexions MariaDB | Pooling de connexions | C1.2, C1.4 | ⭐⭐⭐ |
| `core/crypto_utils.py` | Fonctions cryptographiques (chiffrement Fernet pour MFA) | Sécurité des secrets | C2.2, C2.3 | ⭐⭐⭐ |
| `core/sanitize.py` | Sanitization des entrées avec bleach | Protection contre XSS | C2.2 | ⭐⭐ |

### 🎯 Services (Architecture Modulaire)

**Apprentissage**: Refactoring d'un module monolithique en services spécialisés, pattern Service Layer

| Chemin | Description | Exports | Utilisation | Compétences | Apprentissages |
|--------|-------------|--------|-------------|-------------|---------------|
| `services/agent.py` | Point d'entrée principal pour les services agent (backward compatible) | `RAGConfig`, `RAGAgentService`, `chat_with_agent`, `get_rag_service` | Interface unifiée pour le RAG | C1.2, C1.3 | Architecture modulaire |
| `services/config.py` | Configuration RAG avec dataclass | `RAGConfig` (collection_name, dimension, similarity_top_k, mcp_server_url, prompts_dir) | Centralisation des paramètres | C1.2, C4.1 | Pattern Configuration Object |
| `services/prompts.py` | Gestion des templates de prompts | `PromptManager`, `load_prompt`, `get_prompt_template` | Séparation des prompts du code | C1.2, C4.1 | Séparation des responsabilités |
| `services/utils.py` | Fonctions utilitaires | `extract_json_from_response`, `patch_Gemini_schema` | Réutilisation de code | C1.2 | DRY principle |
| `services/pdf_generator.py` | Génération de PDF et upload Supabase | `PDFGenerator`, `generate_conversation_pdf_link`, `upload_to_supabase_storage` | Export des conversations | C1.2, C1.3 | Génération de documents |
| `services/rag_service.py` | Service RAG principal | `RAGAgentService`, `get_rag_tool`, `get_pdf_tool`, `get_summary_tool`, contexte async | Cœur du moteur RAG | C1.2, C1.3 | Intégration LlamaIndex, Vector Store |
| `services/agent_orchestrator.py` | Orchestration de l'agent IA | `chat_with_agent` avec intégration MCP | Coordination des outils | C1.2, C1.3 | Pattern Orchestrator |

**Pattern appliqué**: Service Layer Pattern - Chaque service a une responsabilité unique et bien définie.

---

### 🔌 Routes API (FastAPI)

**Apprentissage**: Développement d'API RESTful, gestion des routes, middleware

| Chemin | Description | Endpoints principaux | Middleware | Compétences |
|--------|-------------|----------------------|------------|-------------|
| `api/routes/auth.py` | Routes d'authentification | POST /auth/register, POST /auth/login, POST /auth/logout, POST /auth/refresh | - | C1.2, C2.3 |
| `api/routes/admin.py` | Routes d'administration avec protection rôle ADMIN | GET /admin/, GET /admin/users, POST /admin/users, PUT /admin/users/{id}, DELETE /admin/users/{id}, GET /admin/conversations, GET /admin/conversations/{id}, GET /admin/documents, DELETE /admin/documents/{filename} | `verify_admin()` | C1.2, C2.3 |
| `api/routes/ia.py` | Routes IA avec RAG | POST /ai/chat, POST /ai/embedding | Validation fichiers | C1.2, C1.3 |
| `api/routes/conversations.py` | Routes conversations utilisateur (non-admin) | GET /conversations, GET /conversations/{id}, GET /conversations/archives, GET /conversations/archives/{id}, DELETE /conversations/{id}, PATCH /conversations/{id}/pin | `verify_conversation_owner()` | C1.2, C2.2 |
| `api/routes/mfa.py` | Routes MFA (TOTP) | POST /mfa/enroll, POST /mfa/verify, POST /mfa/skip, GET /mfa/status/{user_id} | - | C2.3 |
| `api/routes/reviews.py` | Routes pour les avis | POST /reviews, PUT /reviews/{id} | - | C1.2 |
| `api/routes/sessions.py` | Routes pour les sessions utilisateur | GET /sessions/, DELETE /sessions/{session_id} | `get_current_user_from_token()` | C1.2, C2.3 |

---

### 🔧 Fonctions Backend

**Apprentissage**: Développement de fonctions réutilisables, bonnes pratiques de programmation

| Module | Fonction | Paramètres | Retour | Description | Compétences |
|--------|----------|------------|--------|-------------|-------------|
| `api/routes/auth.py` | `get_current_user` | `token: str` | `dict` | Décode JWT, retourne user info (inclut role) | C2.3 |
| `api/routes/auth.py` | `create_access_token` | `data: dict` | `str` | Crée token JWT (5 min, inclut role) | C2.3 |
| `api/routes/auth.py` | `create_refresh_token` | `data: dict` | `str` | Crée token JWT (1 jour, inclut role) | C2.3 |
| `api/routes/auth.py` | `get_password_hash` | `password: str` | `str` | Hash bcrypt avec salt aléatoire | C2.2, C2.3 |
| `api/routes/auth.py` | `verify_password` | `plain, hashed: str` | `bool` | Vérifie mot de passe | C2.3 |
| `api/routes/admin.py` | `verify_admin` | `current_user: dict` | `bool` ou raise | Vérification rôle ADMIN (évite duplication) | C2.3 |
| `api/routes/admin.py` | `admin_dashboard` | `current_user: dict` | `dict` | Dashboard admin + timeline + stats_ia (tokens, temps réponse, avis) | C1.2, C1.3 |
| `api/routes/admin.py` | `get_stats` | - | `dict` | Récupère stats globale + stats_ia (today/week/all_time) | C1.2 |
| `api/routes/admin.py` | `get_timeline_data` | - | `dict` | Timeline conversations et messages sur 10 jours | C1.2 |
| `api/routes/conversations.py` | `verify_conversation_owner` | `conversation_id, current_user` | `bool` ou raise | Vérification propriétaire (évite duplication) | C2.2 |
| `api/routes/ia.py` | `update_stats_ia` | `conversation_id, new_message, tokens_used, response_time_ms` | - | Met à jour stats_ia avec conversations, messages, tokens, temps de réponse | C1.3 |
| `api/routes/reviews.py` | `update_review_stats_ia` | `is_positive: bool` | - | Met à jour stats_ia avec avis positifs/négatifs | C1.3 |
| `services/rag_service.py` | `get_rag_service` | - | `RAGAgentService` (async context) | Contexte async pour RAGAgentService | C1.2 |
| `services/rag_service.py` | `get_summary_tool` | `chat_history: list` | `FunctionTool` | Génère un résumé structuré (sujet, points clés, décisions, actions) | C1.2 |
| `services/agent_orchestrator.py` | `chat_with_agent` | `service, query, chat_history` | `dict` | Chat avec agent multi-outils (RAG + MCP + PDF + Summary) | C1.2, C1.3 |
| `services/pdf_generator.py` | `generate_conversation_pdf_link` | `chat_history: list` | `str` (JSON) | Génère PDF et retourne JSON avec `url` et `filename` | C1.2 |
| `services/utils.py` | `extract_json_from_response` | `text: str` | `str` | Extrait JSON brut d'une réponse textuelle | C1.2 |
| `app/main.py` | Logger Phoenix | - | - | Configuration du logger pour le debug | C1.2 |
| `api/routes/admin.py` | `list_documents` | `current_user: dict` | `dict` | Liste documents regroupés par filename (ADMIN seulement) | C1.2 |
| `api/routes/admin.py` | `delete_document` | `filename: str, current_user: dict` | `-` | Supprime toutes les lignes d'un fichier (ADMIN seulement) | C1.2 |
| `api/routes/ia.py` | `embed` | `text, file, current_user` | `dict` | Indexe PDF/TXT/JSON/CSV/XLSX/MD (ADMIN only, vérifie doublons) | C1.2 |
| `api/routes/mfa.py` | `enroll_mfa` | `user_id: str` | `dict` | Génère secret TOTP + QR code | C2.3 |
| `api/routes/mfa.py` | `verify_mfa` | `user_id, code: str` | `dict` | Vérifie code TOTP et émet tokens | C2.3 |
| `api/routes/mfa.py` | `skip_mfa_setup` | `user_id: str` | `dict` | Passe l'étape MFA et émet tokens | C2.3 |
| `api/routes/mfa.py` | `get_mfa_status` | `user_id: str` | `dict` | Retourne has_mfa et is_verified | C2.3 |
| `api/routes/conversations.py` | `toggle_pin_conversation` | `conversation_id: str, current_user: dict` | `dict` | Toggle le statut pinned d'une conversation | C1.2 |

---

## 🔌 Serveur MCP (FastMCP + Python)

**Apprentissage**: Développement d'un serveur MCP, intégration avec Model Context Protocol

### Modules MCP

| Chemin | Description | Utilisation | Compétences |
|--------|-------------|-------------|-------------|
| `mcp/app/core/supabase_client.py` | Client Supabase (schema public, timeout 10s) | `from core import supabase` | C1.3 |
| `mcp/app/tools/__init__.py` | Exports centralisés des outils MCP | Centralisation des outils | C1.2 |
| `mcp/app/server.py` | Instance FastMCP + registration des outils | Point d'entrée: `mcp.http_app()` | C1.2, C1.3 |

### Fonctions Outils MCP

**Apprentissage**: Développement d'outils MCP pour l'accès aux données de production textile

| Module | Fonction | Paramètres | Retour | Description | Compétences |
|--------|----------|------------|--------|-------------|-------------|
| `mcp/app/tools/stats.py` | `get_user_stats_count` | - | `int` | Compte total des enregistrements dans stats_users | C1.2 |
| `mcp/app/tools/stats.py` | `get_user_performance` | `utilisateur: str, limit_days: int=7` | `List[Dict]` | Historique détaillé des performances d'un utilisateur | C1.2 |
| `mcp/app/tools/stats.py` | `get_daily_summary` | `date: str` | `List[Dict]` | Bilan complet de production pour une date | C1.2 |
| `mcp/app/tools/stats.py` | `get_user_stats_by_filter` | `filters: Dict` | `List[Dict]` | Stats utilisateur filtrées par conditions | C1.2 |
| `mcp/app/tools/stats.py` | `get_top_performers` | - | `List[Dict]` | Top performeurs (opérateurs les plus productifs) | C1.2 |
| `mcp/app/tools/stats.py` | `get_quality_alerts` | - | `List[Dict]` | Alertes qualité basées sur les données | C1.2 |
| `mcp/app/tools/stats.py` | `get_period_summary` | - | `List[Dict]` | Résumé périodique des statistiques | C1.2 |
| `mcp/app/tools/stats.py` | `get_aggregated_stats_by_user` | - | `List[Dict]` | Stats agrégées par utilisateur | C1.2 |
| `mcp/app/tools/stats.py` | `get_aggregated_stats_by_emplacement` | - | `List[Dict]` | Stats agrégées par poste/emplacement | C1.2 |

---

## 🎨 Frontend (Next.js 16 + React + Tailwind CSS)

### 🧩 Composants UI Partagés

**Apprentissage**: Développement de composants React réutilisables, pattern Component-Based Architecture

| Chemin | Props | Description | Utilisation | Compétences |
|--------|-------|-------------|-------------|-------------|
| `components/shared/Logo.jsx` | - | Logo Broussaud avec animation | Identification visuelle | C1.2 |
| `components/shared/Skeleton.jsx` | `className` | Skeleton de chargement avec animation pulse | États de chargement | C1.2 |
| `components/shared/Skeleton.jsx` | `AvatarSkeleton` | Skeleton pour avatar (w-8 h-8) | UserProfile loading | C1.2 |
| `components/shared/Skeleton.jsx` | `TextSkeleton` | Skeleton pour ligne de texte (h-3) | Messages loading | C1.2 |
| `components/shared/Skeleton.jsx` | `StatsCardSkeleton` | Skeleton pour carte de statistiques | Dashboard loading | C1.2 |
| `components/shared/Skeleton.jsx` | `TableRowSkeleton` | Skeleton pour ligne de tableau (param: cells) | Listes loading | C1.2 |
| `components/shared/Skeleton.jsx` | `ConversationCardSkeleton` | Skeleton pour carte de conversation | Historique loading | C1.2 |
| `components/shared/ActionAlert.jsx` | `ActionError` | Alerte erreur réutilisable (icône TriangleAlert, fond rouge-500) | Feedback négatif | C1.2 |
| `components/shared/ActionAlert.jsx` | `ActionSuccess` | Alerte succès réutilisable (icône CheckCircle2, fond green-500) | Feedback positif | C1.2 |
| `components/shared/Tag.jsx` | `tag` | Badge pour afficher un tag avec style cohérent | Classification RAG | C1.2 |
| `components/shared/ErrorAlert.jsx` | `error, className` | Alerte erreur (déplacé de components/auth/) | Gestion des erreurs | C1.2 |
| `components/ui/Dropdown.jsx` | `buttonContent, buttonClassName, menuClassName, children` | Dropdown générique | Menus déroulants | C1.2 |
| `components/ui/SideCanvas.jsx` | `isOpen, onClose, title, children, className` | Panneau latéral glissant depuis la droite avec animation, gestion Échap, clic extérieur | Affichage de contenu latéral | C1.2 |

---

### 🔐 Composants Auth

**Apprentissage**: Développement de formulaires d'authentification, gestion des erreurs

| Chemin | Props | Description | Utilisation | Compétences |
|--------|-------|-------------|-------------|-------------|
| `components/auth/AuthCard.jsx` | `children, title` | Container carte auth avec styling cohérent | Formulaires auth | C1.2 |
| `components/auth/FormInput.jsx` | `type, name, value, onChange, placeholder, label, icon, error` | Input stylisé avec gestion des erreurs | Champs de formulaire | C1.2 |
| `components/auth/FormButton.jsx` | `type, children, disabled, className` | Bouton formulaire avec styles cohérents | Boutons auth | C1.2 |
| `components/auth/FormRow.jsx` | `children` | Ligne de formulaire | Groupement des champs | C1.2 |
| `components/auth/AuthLink.jsx` | `href, children` | Lien auth avec styling cohérent | Liens de navigation auth | C1.2 |

---

### 💬 Composants Chat

**Apprentissage**: Développement d'une interface de chat moderne, responsive, avec gestion d'état

| Chemin | Props | Description | Utilisation | Compétences |
|--------|-------|-------------|-------------|-------------|
| `components/chat/Sidebar.jsx` | `currentPage, onNewConversation, userInfo, conversations, activeConversationId, isMobile, isCollapsed, onToggle, onClose, isLoading` | Sidebar avec animation largeur (w-64 ↔ w-12), fixed sur mobile, isLoading pour skeletons | Navigation principale | C1.2, C1.3 |
| `components/chat/SidebarCollapsed.jsx` | `currentPage, userInfo, onToggle, isLoading` | Contenu collapsed (3 carrés) avec animation icône, skeleton avatar si isLoading | Sidebar compacte | C1.2 |
| `components/chat/NavigationSelector.jsx` | `currentPage, role` | Dropdown navigation (Broussaud AI, Boutique Maison Broussaud, Administration) - Administration visible uniquement pour ADMIN | Sélection de page | C1.2, C2.3 |
| `components/chat/NewConversationButton.jsx` | `onClick` | Bouton nouvelle conversation | Création de chat | C1.2 |
| `components/chat/ConversationList.jsx` | `conversations, activeConversationId, onSelectConversation, onDeleteConversation, onTogglePin, isLoading` | Liste conversations avec 3 skeletons si isLoading, sépare en sections "Épinglées" et "Historique" | Liste des conversations | C1.2 |
| `components/chat/ConversationItem.jsx` | `conversation, isActive, onClick, onDelete, onTogglePin` | Item conversation avec bouton pin (icône Pin, ambre-500 si épinglé) et bouton delete, boutons visibles au hover | Élément de la liste | C1.2 |
| `components/chat/UserProfile.jsx` | `userInfo, isLoading` | Profil utilisateur avec dropdown, fond rouge-500 pour ADMIN, skeleton si isLoading, bouton "Appareils connectés" | Profil utilisateur | C1.2 |
| `components/chat/SessionsList.jsx` | `isOpen, onClose` | Liste des appareils connectés (sessions) avec device_info, dates de création/expiration, bouton de déconnexion forcée | Gestion des sessions | C1.2, C2.3 |
| `components/chat/ChatInput.jsx` | `input, onChange, onSubmit, isLoading` | Input chat avec texte de prévention et gestion du chargement | Saisie utilisateur | C1.2 |
| `components/chat/ChatHeader.jsx` | `title, isArchived` | Header chat avec support titre et icône archive | En-tête du chat | C1.2 |
| `components/chat/MessageList.jsx` | `messages, isLoading, messagesEndRef, isAdminView, userEmail` | Liste messages avec scroll, masque désactivé si isAdminView=true | Liste des messages | C1.2 |
| `components/chat/Message.jsx` | `message, userEmail` | Bulle message (user/IA) avec icône loupe, affiche userEmail au lieu de "Vous" si fourni | Message individuel | C1.2 |
| `components/chat/MessageMeta.jsx` | `label, subLabel` | Métadonnées message (labels, sous-labels) | Informations du message | C1.2 |
| `components/chat/TagBadge.jsx` | `tag` | Badge pour afficher un tag | Classification | C1.2 |
| `components/chat/ChatInput.jsx` | `input, onChange, onSubmit, isLoading` | Input chat avec gestion des états | Interaction utilisateur | C1.2 |
| `components/chat/LoadingIndicator.jsx` | `className` | Indicateur de chargement animé | États de chargement | C1.2 |
| `components/chat/ApexChartComponent.jsx` | `config` | Graphique ApexCharts complet avec support de tous les types (line, bar, pie, area, etc.), toolbar inclus, responsive | Visualisation de données | C1.2 |

---

### 📊 Composants Admin

**Apprentissage**: Développement d'une interface d'administration complète, gestion des rôles

| Chemin | Props | Description | Utilisation | Compétences |
|--------|-------|-------------|-------------|-------------|
| `components/admin/AdminSidebar.jsx` | `userInfo, isMobile, isCollapsed, onToggle, onClose` | Sidebar admin avec NavigationSelector + AdminNavigation + UserProfile | Navigation admin | C1.2, C2.3 |
| `components/admin/AdminNavigation.jsx` | - | Navigation verticale admin (Dashboard, Membres, Conversations, Documents) | Menu admin | C1.2 |
| `components/admin/MiniChart.jsx` | `series, categories, color, height` | Graphique ApexCharts minimaliste non-interactif pour dashboard | Visualisation de données | C1.2 |
| `components/admin/SideCanvas.jsx` | `isOpen, onClose, title, children` | Panneau latéral glissant depuis la droite avec animation (translate-x) | Formulaires admin | C1.2 |
| `components/admin/UserForm.jsx` | `user, onSubmit, onCancel, loading` | Formulaire pour créer/modifier un utilisateur (nom, prénom, mail, mdp, rôle) | CRUD utilisateurs | C1.2 |
| `components/admin/DeleteModal.jsx` | `isOpen, onClose, onConfirm, title, message, itemName` | Modale de confirmation de suppression | Suppression sécurisée | C1.2 |
| `components/admin/RoleDropdown.jsx` | `value, onChange, className` | Dropdown custom pour sélection des rôles (USER/ADMIN) | Sélection de rôle | C1.2 |
| `components/admin/DocumentUploadForm.jsx` | `onSubmit, onCancel, loading` | Formulaire upload multi-formats (PDF/TXT/JSON/CSV/XLSX) avec drag & drop, validation (50MB), barre de progression | Upload de documents | C1.2 |

---

### 📄 Pages

#### Pages Admin

| Chemin | Description | Accès | Compétences |
|--------|-------------|-------|-------------|
| `app/admin/layout.jsx` | Layout admin avec AdminSidebar | ADMIN | C1.2, C2.3 |
| `app/admin/page.jsx` | Redirection vers /admin/dashboard | ADMIN | C1.2 |
| `app/admin/dashboard/page.jsx` | Stats admin avec MiniChart pour conversations et messages | ADMIN | C1.2 |
| `app/admin/members/page.jsx` | CRUD membres avec pagination, SideCanvas (création/modification), DeleteModal (suppression) | ADMIN | C1.2, C2.3 |
| `app/admin/conversations/page.jsx` | Liste conversations avec recherche + filtres label/sub_label/tag | ADMIN | C1.2 |
| `app/admin/conversations/[id]/page.jsx` | Détail conversation avec user_mail et MessageList (isAdminView=true, userEmail) | ADMIN | C1.2 |
| `app/admin/documents/page.jsx` | Gestion des embeddings de documents (liste regroupée par filename avec icônes par type, upload multi-formats, suppression) | ADMIN | C1.2 |

#### Pages Chat

| Chemin | Description | Accès | Compétences |
|--------|-------------|-------|-------------|
| `app/chat/layout.jsx` | Layout commun pour /chat/* avec Sidebar et gestion state | Authentifié | C1.2, C1.3 |
| `app/chat/page.jsx` | Page principale du chat avec chargement messages historiques | Authentifié | C1.2 |
| `app/chat/archives/page.jsx` | Liste des conversations archivées (grille responsive, recherche, pagination) | Authentifié | C1.2 |
| `app/chat/archives/[id]/page.jsx` | Détail d'une conversation archivée (lecture seule) | Authentifié | C1.2 |

#### Pages Auth

| Chemin | Description | Accès | Compétences |
|--------|-------------|-------|-------------|
| `app/login/page.jsx` | Page de connexion | Public | C1.2, C2.3 |
| `app/register/page.jsx` | Page d'inscription | Public | C1.2 |
| `app/logout/page.jsx` | Page de déconnexion | Authentifié | C1.2 |
| `app/login/mfa/page.jsx` | Page MFA pour configuration (QR code) et vérification TOTP avec option skip | Requires MFA | C2.3 |

---

### ⚡ Hooks Personnalisés

**Apprentissage**: Développement de hooks React pour la gestion d'état et la logique réutilisable

| Chemin | Retour | Description | Utilisation | Compétences |
|--------|--------|-------------|-------------|-------------|
| `hooks/useChat.js` | `messages, input, setInput, isLoading, conversationId, currentPage, setCurrentPage, handleSend, messagesEndRef` | Gestion chat + extraction des `contexts` depuis l'API | Gestion du chat | C1.2, C1.3 |
| `hooks/useUserInfo.js` | `userInfo, loading, error` | Infos utilisateur depuis JWT (inclut role) | Gestion de l'utilisateur | C1.2 |
| `hooks/useClickOutside.js` | `ref, onClickOutside` | Détection clic extérieur | Fermeture de dropdowns | C1.2 |
| `hooks/useConversations.js` | `conversations, loading, error, fetchConversations, deleteConversation` | Gestion des conversations utilisateur | Liste des conversations | C1.2 |

**Pattern appliqué**: Custom Hooks Pattern - Encapsulation de la logique dans des hooks réutilisables.

---

### 🔌 Services Frontend

**Apprentissage**: Développement de services pour la communication API et la gestion des requêtes

| Chemin | Description | Utilisation | Compétences |
|--------|-------------|-------------|-------------|
| `services/api.js` | Axios + interceptors JWT | `import { api } from '@/services/api'` | Communication API | C1.2, C1.3 |

**Fonctionnalités clés**:
- Intercepteurs Axios pour l'authentification automatique
- Gestion des tokens (access_token, refresh_token)
- Rafraîchissement automatique sur 401 Unauthorized

---

### 🎨 Layout

**Apprentissage**: Développement de layouts pour une structure cohérente de l'application

| Chemin | Props | Description | Utilisation | Compétences |
|--------|-------|-------------|-------------|-------------|
| `components/layout/AnimatedBackground.jsx` | - | Fond animé canvas (optimisé GPU) | Background principal | C1.2 |

---

## 🌐 API Routes Frontend

**Apprentissage**: Développement d'API Routes Next.js pour la communication backend

| Chemin | Méthode | Description | Compétences |
|--------|---------|-------------|-------------|
| `/api/refresh` | POST | Rafraîchit access_token via refresh_token | C1.3, C2.3 |
| `/api/user` | GET | Récupère infos user (inclut role) depuis JWT | C1.2 |
| `/sessions/` | GET | Récupère les sessions de l'utilisateur connecté | C1.2, C2.3 |
| `/sessions/{session_id}` | DELETE | Force la déconnexion d'une session spécifique (avec vérification propriétaire) | C1.2, C2.3 |

---

## 🚪 Middleware Frontend

**Apprentissage**: Protection des routes, gestion de l'authentification côté frontend

| Chemin | Description | Compétences |
|--------|-------------|-------------|
| `proxy.js` | Protection route /admin (vérification JWT + rôle ADMIN requis) | C1.2, C2.3 |

---

## 📁 Utils & Helpers

**Apprentissage**: Développement de fonctions utilitaires pour éviter la duplication de code

| Chemin | Fonction/Constante | Description | Utilisation | Compétences |
|--------|-------------------|-------------|-------------|-------------|
| `app/actions/auth.js` | `loginAction, registerAction, logoutAction` | Server Actions auth - loginAction gère redirection vers /login/mfa si requires_mfa | Authentification | C1.2, C2.3 |
| `utils/formatText.js` | `formatResponseText(text)` | Formate le texte IA avec `%NL%` (sauts de ligne) et `%BOLD%/%ENDBOLD%` (gras) | Affichage des réponses IA | C1.2 |
| `utils/pageColors.js` | `PAGE_COLORS`, `getPageColor()` | Gestion centralisée des couleurs par page | Cohérence visuelle | C1.2 |
| `utils/messageFormatters.js` | `parseAPIResponse`, `createAIMessage`, `createUserMessage`, `createWelcomeMessage`, `createErrorMessage`, `formatHistoricalMessages` | Formatage centralisé des messages chat | Gestion des messages | C1.2 |
| `utils/userUtils.js` | `getRoleColor(role)` | Retourne classe Tailwind pour couleur de rôle (ADMIN=red-500, USER=violet-500) | Affichage des rôles | C1.2 |
| `utils/chartParser.js` | `parseTextWithCharts()`, `TextWithCharts`, `hasCharts()`, `extractCharts()` | Parsing et extraction des configurations de graphiques ApexCharts du texte | Affichage des graphiques IA | C1.2 |

---

## 🎯 Bilan des Apprentissages

### Concepts Maîtrisés

| Concept | Description | Implémentation | Compétences |
|---------|-------------|----------------|-------------|
| **Architecture Modulaire** | Séparation des responsabilités en modules indépendants | Services backend, composants frontend | C1.2, C1.3 |
| **DRY Principle** | Don't Repeat Yourself - Éviter la duplication de code | Fonctions utilitaires, hooks, services | C1.2 |
| **Service Layer Pattern** | Séparation de la logique métier dans une couche service | Services agent, RAG, PDF | C1.2, C1.3 |
| **Component-Based Architecture** | Développement d'applications comme une hiérarchie de composants | Composants React | C1.2 |
| **Custom Hooks Pattern** | Encapsulation de la logique dans des hooks réutilisables | useChat, useUserInfo, etc. | C1.2 |
| **SOLID Principles** | Bonnes pratiques de développement orienté objet | Architecture backend | C1.2 |
| **Separation of Concerns** | Séparation des préoccupations (UI, logique, données) | Toute l'application | C1.2, C1.3 |

### Compétences Techniques

- ✅ Développement de composants React réutilisables
- ✅ Architecture modulaire backend
- ✅ Développement d'API RESTful
- ✅ Gestion de l'authentification JWT
- ✅ Intégration de bases de données
- ✅ Développement de services métiers
- ✅ Création de hooks personnalisés
- ✅ Développement d'outils MCP

---

## 📊 Statistiques du Registry

| Catégorie | Nombre | Description |
|-----------|--------|-------------|
| **Modules Backend** | 8+ | Core, services, routes |
| **Composants Frontend** | 44+ | UI, Auth, Chat, Admin |
| **Fonctions Backend** | 25+ | Auth, Admin, IA, Conversations |
| **Fonctions Frontend** | 11+ | Utils, Helpers |
| **Hooks Personnalisés** | 5+ | useChat, useUserInfo, useConversations |
| **Outils MCP** | 9+ | Stats, performances, alertes |
| **Pages** | 15+ | Auth, Chat, Admin |
| **API Routes** | 32+ | Backend + Frontend |

---

*Registry maintenu dans le cadre du stage BTS SIO*
*Projet Broussaud AI - Lycée Suzanne Valadon & Entreprise Broussaud*
*© 2026 - Tous droits réservés*