# Registry - Composants Réutilisables

---

## Backend

### Modules

| Chemin | Description | Utilisation |
|--------|-------------|-------------|
| `core/supabase_client.py` | Client Supabase configuré | `from core.supabase_client import supabase` |
| `core/supabase_init.py` | Initialisation tables DB (users, conversations, messages, sessions, reviews, stats_ia) | Appelé au startup |
| `core/llm.py` | Configuration LLM/Embeddings | Importé au démarrage |
| `services/agent.py` | Point d'entrée principal pour les services agent (backward compatible) | `from services.agent import RAGConfig, RAGAgentService, chat_with_agent, get_rag_service` |
| `services/config.py` | Configuration RAG | `RAGConfig` dataclass avec paramètres depuis env |
| `services/prompts.py` | Gestion des prompts | `PromptManager` pour charger les templates de prompts |
| `services/utils.py` | Fonctions utilitaires | `extract_json_from_response`, patch Gemini schema |
| `services/pdf_generator.py` | Génération PDF | `PDFGenerator`, `generate_conversation_pdf_link`, `upload_to_supabase_storage` |
| `services/rag_service.py` | Service RAG | `RAGAgentService`, `get_rag_tool`, `get_pdf_tool`, contexte async |
| `services/agent_orchestrator.py` | Orchestration agent | `chat_with_agent` avec intégration MCP |
| `api/routes/admin.py` | Routes administration avec protection rôle ADMIN | Accès administratif |
| `api/routes/conversations.py` | Routes conversations utilisateur (non-admin) | GET /conversations, GET /conversations/{id}, GET /conversations/archives, GET /conversations/archives/{id}, DELETE /conversations/{id}, PATCH /conversations/{id}/pin |
| `api/routes/ia.py` | Routes IA avec RAG | POST /ai/chat (chat avec agent), POST /ai/embedding (indexation PDF/TXT/JSON/CSV/XLSX/MD) |
| `app/main.py` | Configuration principale avec Logger Phoenix | Point d'entrée FastAPI |

## Serveur MCP

### Modules

| Chemin | Description | Utilisation |
|--------|-------------|-------------|
| `mcp/app/core/supabase_client.py` | Client Supabase (schema public, timeout 10s) | `from core import supabase` |
| `mcp/app/tools/__init__.py` | Exports centralisés des outils MCP | `from tools import get_user_stats_count, get_user_performance, get_daily_summary, get_user_stats_by_filter, get_top_performers, get_quality_alerts, get_period_summary, get_aggregated_stats_by_user, get_aggregated_stats_by_emplacement` |
| `mcp/app/server.py` | Instance FastMCP + registration des outils | Point d'entrée: `mcp.http_app()` |

### Fonctions Outils MCP

| Module | Fonction | Paramètres | Retour | Description |
|--------|----------|------------|--------|-------------|
| `mcp/app/tools/stats.py` | `get_user_stats_count` | - | `int` | Compte total des enregistrements dans stats_users |
| `mcp/app/tools/stats.py` | `get_user_performance` | `utilisateur: str, limit_days: int=7` | `List[Dict]` | Historique détaillé des performances d'un utilisateur |
| `mcp/app/tools/stats.py` | `get_daily_summary` | `date: str` | `List[Dict]` | Bilan complet de production pour une date spécifique |
| `mcp/app/tools/stats.py` | `get_user_stats_by_filter` | `filters: Dict` | `List[Dict]` | Stats utilisateur filtrées par conditions |
| `mcp/app/tools/stats.py` | `get_top_performers` | - | `List[Dict]` | Top performeurs (opérateurs les plus productifs) |
| `mcp/app/tools/stats.py` | `get_quality_alerts` | - | `List[Dict]` | Alertes qualité basées sur les données |
| `mcp/app/tools/stats.py` | `get_period_summary` | - | `List[Dict]` | Résumé périodique des statistiques |
| `mcp/app/tools/stats.py` | `get_aggregated_stats_by_user` | - | `List[Dict]` | Stats agrégées par utilisateur |
| `mcp/app/tools/stats.py` | `get_aggregated_stats_by_emplacement` | - | `List[Dict]` | Stats agrégées par poste/emplacement |

### Fonctions

| Module | Fonction | Paramètres | Retour | Description |
|--------|----------|------------|--------|-------------|
| `api/routes/auth.py` | `get_current_user` | `token: str` | `dict` | Décode JWT, retourne user info (inclut role) |
| `api/routes/auth.py` | `create_access_token` | `data: dict` | `str` | Crée token (5 min, inclut role) |
| `api/routes/auth.py` | `create_refresh_token` | `data: dict` | `str` | Crée token (7 jours, inclut role) |
| `api/routes/auth.py` | `get_password_hash` | `password: str` | `str` | Hash bcrypt |
| `api/routes/auth.py` | `verify_password` | `plain, hashed: str` | `bool` | Vérifie mot de passe |
| `api/routes/admin.py` | `admin_dashboard` | `current_user: dict` | `dict` | Dashboard admin + timeline + stats_ia (tokens, temps réponse, avis) (ADMIN seulement) |
| `api/routes/admin.py` | `get_stats` | - | `dict` | Récupère stats globale + stats_ia (today/week/all_time) |
| `api/routes/admin.py` | `get_timeline_data` | - | `dict` | Timeline conversations et messages sur 10 jours |
| `api/routes/ia.py` | `update_stats_ia` | `conversation_id, new_message, tokens_used, response_time_ms` | - | Met à jour stats_ia avec conversations, messages, tokens, temps de réponse |
| `api/routes/reviews.py` | `update_review_stats_ia` | `is_positive: bool` | - | Met à jour stats_ia avec avis positifs/négatifs |
| `api/routes/admin.py` | `list_users` | `current_user: dict` | `dict` | Liste utilisateurs (ADMIN seulement) |
| `api/routes/admin.py` | `create_user` | `user_data: dict, current_user: dict` | `dict` | Crée utilisateur (POST /admin/users) (ADMIN seulement) |
| `api/routes/admin.py` | `update_user` | `user_id: str, user_data: dict, current_user: dict` | `dict` | Met à jour utilisateur (PUT /admin/users/{id}) (ADMIN seulement) |
| `api/routes/admin.py` | `delete_user` | `user_id: str, current_user: dict` | `-` | Supprime utilisateur (DELETE /admin/users/{id}) (ADMIN seulement) |
| `api/routes/admin.py` | `get_timeline_data` | - | `dict` | Génère timeline 10 jours pour conversations et messages |
| `services/config.py` | `RAGConfig` | Dataclass de configuration (collection_name, dimension, similarity_top_k, mcp_server_url, prompts_dir) |
| `services/prompts.py` | `PromptManager` | Gestionnaire de prompts (load_prompt, get_prompt_template) |
| `services/rag_service.py` | `RAGAgentService` | Service principal avec vector_store, index, query_engine, get_rag_tool, get_pdf_tool, get_summary_tool |
| `services/rag_service.py` | `get_rag_service` | Contexte async pour RAGAgentService |
| `services/rag_service.py` | `get_summary_tool` | `chat_history: list` | `FunctionTool` | Génère un résumé structuré de la conversation (sujet, points clés, décisions, actions, résumé général) |
| `services/agent_orchestrator.py` | `chat_with_agent` | `service: RAGAgentService, query: str, chat_history: list` | `dict` | Chat avec agent multi-outils (RAG + MCP + PDF + Summary), historique, retourne `response`, `context` |
| `services/pdf_generator.py` | `PDFGenerator` | Classe utilitaire avec generate_conversation_pdf, upload_to_supabase_storage |
| `services/pdf_generator.py` | `generate_conversation_pdf_link` | `chat_history: list` | `str` (JSON) | Génère PDF et retourne JSON avec `url` et `filename` |
| `services/utils.py` | `extract_json_from_response` | `text: str` | `str` | Extrait JSON brut d'une réponse textuelle |
| `services/utils.py` | Intercepteur Gemini | Patching de `google.genai._transformers.t_schema` | Nettoie additionalProperties des schemas |
| `app/main.py` | Logger Phoenix | Configuration du logger pour le debug | Journalisation des requêtes et erreurs |
| `api/routes/admin.py` | `list_documents` | `current_user: dict` | `dict` | Liste documents regroupés par filename (GET /admin/documents) (ADMIN seulement) |
| `api/routes/admin.py` | `delete_document` | `filename: str, current_user: dict` | `-` | Supprime toutes les lignes d'un fichier (DELETE /admin/documents/{filename}) (ADMIN seulement) |
| `api/routes/ia.py` | `embed` | `text: str, file: UploadFile, current_user: dict` | `dict` | Indexe PDF/TXT/JSON/CSV/XLSX (POST /ai/embedding) (ADMIN seulement, vérifie doublons) |
| `api/routes/mfa.py` | `enroll_mfa` | `user_id: str` | `dict` | Génère secret TOTP + QR code (POST /mfa/enroll) |
| `api/routes/mfa.py` | `verify_mfa` | `user_id: str, code: str` | `dict` | Vérifie code TOTP et émet tokens (POST /mfa/verify) |
| `api/routes/mfa.py` | `skip_mfa_setup` | `user_id: str` | `dict` | Passe l'étape MFA et émet tokens (POST /mfa/skip) |
| `api/routes/mfa.py` | `get_mfa_status` | `user_id: str` | `dict` | Retourne has_mfa et is_verified (GET /mfa/status/{user_id}) |
| `api/routes/conversations.py` | `toggle_pin_conversation` | `conversation_id: str, current_user: dict` | `dict` | Toggle le statut pinned d'une conversation (PATCH /conversations/{id}/pin) |

---

## Frontend

### Composants UI

| Chemin | Props | Description |
|--------|-------|-------------|
| `components/shared/Logo.jsx` | - | Logo Broussaud |
| `components/shared/Skeleton.jsx` | `className` | Skeleton de chargement avec animation pulse |
| `components/shared/Skeleton.jsx` | `AvatarSkeleton` | Skeleton pour avatar (w-8 h-8) |
| `components/shared/Skeleton.jsx` | `TextSkeleton` | Skeleton pour ligne de texte (h-3) |
| `components/shared/Skeleton.jsx` | `StatsCardSkeleton` | Skeleton pour carte de statistiques |
| `components/shared/Skeleton.jsx` | `TableRowSkeleton` | Skeleton pour ligne de tableau (param: cells) |
| `components/shared/Skeleton.jsx` | `ConversationCardSkeleton` | Skeleton pour carte de conversation |
| `components/shared/ActionAlert.jsx` | `ActionError` | Alerte erreur réutilisable (icône TriangleAlert, fond rouge-500) |
| `components/shared/ActionAlert.jsx` | `ActionSuccess` | Alerte succès réutilisable (icône CheckCircle2, fond green-500) |
| `components/shared/Tag.jsx` | `tag` | Badge pour afficher un tag avec style cohérent |
| `components/shared/ErrorAlert.jsx` | `error, className` | Alerte erreur (déplacé de components/auth/) |
| `components/ui/Dropdown.jsx` | `buttonContent, buttonClassName, menuClassName, children` | Dropdown générique |

### Composants Auth

| Chemin | Props | Description |
|--------|-------|-------------|
| `components/auth/AuthCard.jsx` | `children, title` | Container carte auth |
| `components/auth/FormInput.jsx` | `type, name, value, onChange, placeholder, label, icon, error` | Input stylisé |
| `components/auth/FormButton.jsx` | `type, children, disabled, className` | Bouton formulaire |
| `components/auth/FormRow.jsx` | `children` | Ligne de formulaire |
| `components/shared/ErrorAlert.jsx` | `error, className` | Alerte erreur |
| `components/auth/AuthLink.jsx` | `href, children` | Lien auth |

### Composants Chat

| Chemin | Props | Description |
|--------|-------|-------------|
| `components/chat/Sidebar.jsx` | `currentPage, onNewConversation, userInfo, conversations, activeConversationId, isMobile, isCollapsed, onToggle, onClose, isLoading` | Sidebar avec animation largeur (w-64 ↔ w-12), fixed sur mobile, isLoading pour skeletons |
| `components/chat/SidebarCollapsed.jsx` | `currentPage, userInfo, onToggle, isLoading` | Contenu collapsed (3 carrés) avec animation icône, skeleton avatar si isLoading |
| `components/chat/NavigationSelector.jsx` | `currentPage, role` | Dropdown navigation (Broussaud AI, Boutique Maison Broussaud, Administration) - Administration visible uniquement pour ADMIN |
| `components/chat/NewConversationButton.jsx` | `onClick` | Bouton nouvelle conversation |
| `components/chat/ConversationList.jsx` | `conversations, activeConversationId, onSelectConversation, onDeleteConversation, onTogglePin, isLoading` | Liste conversations avec 3 skeletons si isLoading, sépare en sections "Épinglées" et "Historique" |
| `components/chat/ConversationItem.jsx` | `conversation, isActive, onClick, onDelete, onTogglePin` | Item conversation avec bouton pin (icône Pin, ambre-500 si épinglé) et bouton delete, boutons visibles au hover |
| `components/chat/UserProfile.jsx` | `userInfo, isLoading` | Profil utilisateur avec dropdown, fond rouge-500 pour ADMIN, skeleton si isLoading |
| `components/chat/ChatInput.jsx` | `input, onChange, onSubmit, isLoading` | Input chat avec texte de prévention |

| `components/chat/ChatHeader.jsx` | - | Header chat |
| `components/chat/MessageList.jsx` | `messages, isLoading, messagesEndRef, isAdminView, userEmail` | Liste messages avec scroll, masque désactivé si isAdminView=true |

| `components/chat/Message.jsx` | `message, userEmail` | Bulle message (user/IA) avec icône loupe, affiche userEmail au lieu de "Vous" si fourni |

| `components/chat/MessageMeta.jsx` | `label, subLabel` | Métadonnées message |
| `components/chat/ChatInput.jsx` | `input, onChange, onSubmit, isLoading` | Input chat |
| `components/chat/LoadingIndicator.jsx` | `className` | Indicateur de chargement animé |
| `components/chat/TagBadge.jsx` | `tag` | Badge tag |
| `components/chat/ChatHeader.jsx` | `title, isArchived` | Header chat avec support titre et icône archive |

### Composants Admin

| Chemin | Props | Description |
|--------|-------|-------------|
| `components/admin/AdminSidebar.jsx` | `userInfo, isMobile, isCollapsed, onToggle, onClose` | Sidebar admin avec NavigationSelector + AdminNavigation + UserProfile |
| `components/admin/AdminNavigation.jsx` | - | Navigation verticale admin (Dashboard, Membres, Conversations) |
| `components/admin/MiniChart.jsx` | `series, categories, color` | Graphique ApexCharts minimaliste non-interactif pour dashboard |
| `components/admin/SideCanvas.jsx` | `isOpen, onClose, title, children` | Panneau latéral glissant depuis la droite avec animation (translate-x) |
| `components/admin/UserForm.jsx` | `user, onSubmit, onCancel, loading` | Formulaire pour créer/modifier un utilisateur |
| `components/admin/DeleteModal.jsx` | `isOpen, onClose, onConfirm, title, message, itemName` | Modale de confirmation de suppression |
| `components/admin/RoleDropdown.jsx` | `value, onChange, className` | Dropdown custom pour sélection des rôles (USER/ADMIN) |
| `components/admin/DocumentUploadForm.jsx` | `onSubmit, onCancel, loading` | Formulaire upload multi-formats (PDF/TXT/JSON/CSV/XLSX) avec drag & drop, validation (50MB), barre de progression |

### Pages Admin

| Chemin | Description |
|--------|-------------|
| `app/admin/layout.jsx` | Layout admin avec AdminSidebar |
| `app/admin/page.jsx` | Redirection vers /admin/dashboard |
| `app/admin/dashboard/page.jsx` | Stats admin avec MiniChart pour conversations et messages |
| `app/admin/members/page.jsx` | CRUD membres avec pagination, SideCanvas (création/modification), DeleteModal (suppression) |
| `app/admin/conversations/page.jsx` | Liste conversations avec recherche + filtres label/sub_label/tag |
| `app/admin/conversations/[id]/page.jsx` | Détail conversation avec user_mail et MessageList (isAdminView=true, userEmail) |
| `app/admin/documents/page.jsx` | Gestion des embeddings de documents (liste regroupée par filename avec icônes par type, upload multi-formats, suppression) |
| `app/login/mfa/page.jsx` | Page MFA pour configuration (QR code) et vérification TOTP avec option skip |

### Pages Chat

| Chemin | Description |
|--------|-------------|
| `app/chat/layout.jsx` | Layout commun pour /chat/* avec Sidebar et gestion state |
| `app/chat/page.jsx` | Page principale du chat avec chargement messages historiques |
| `app/chat/archives/page.jsx` | Liste des conversations archivées (grille responsive, recherche, pagination) |
| `app/chat/archives/[id]/page.jsx` | Détail d'une conversation archivée (lecture seule) |
| `app/login/mfa/MFAClient.jsx` | Composant client pour la gestion MFA (QR code, vérification, skip) |

### Hooks

| Chemin | Retour | Description |
|--------|--------|-------------|
| `hooks/useChat.js` | `messages, input, setInput, isLoading, conversationId, currentPage, setCurrentPage, handleSend, messagesEndRef` | Gestion chat + extraction des `contexts` depuis l'API |
| `hooks/useUserInfo.js` | `userInfo, loading, error` | Infos utilisateur depuis JWT (inclut role) |
| `hooks/useClickOutside.js` | `ref, onClickOutside` | Détection clic extérieur |

### Services

| Chemin | Description | Utilisation |
|--------|-------------|-------------|
| `services/api.js` | Axios + interceptors JWT | `import { api } from '@/services/api'` |

### Layout

| Chemin | Props | Description |
|--------|-------|-------------|
| `components/layout/AnimatedBackground.jsx` | - | Fond animé canvas |

---

## API Routes Frontend

| Chemin | Méthode | Description |
|--------|---------|-------------|
| `/api/refresh` | POST | Rafraîchit access_token |
| `/api/user` | GET | Récupère infos user (inclut role) |

---

## Middleware Frontend

| Chemin | Description |
|--------|-------------|
| `proxy.js` | Protection route /admin (vérification JWT + rôle ADMIN requis) |

---

## Utils & Helpers

| Chemin | Fonction/Constante | Description |
|--------|-------------------|-------------|
| `app/actions/auth.js` | `loginAction, registerAction, logoutAction` | Server Actions auth - loginAction gère redirection vers /login/mfa si requires_mfa |
| `utils/formatText.js` | `formatResponseText(text)` | Formate le texte IA avec `%NL%` et `%BOLD%/%ENDBOLD%` |
| `utils/pageColors.js` | `PAGE_COLORS`, `getPageColor()` | Gestion centralisée des couleurs par page |
| `utils/messageFormatters.js` | `parseAPIResponse`, `createAIMessage`, `createUserMessage`, `createWelcomeMessage`, `createErrorMessage`, `formatHistoricalMessages` | Formatage centralisé des messages chat |
| `utils/userUtils.js` | `getRoleColor(role)` | Retourne classe Tailwind pour couleur de rôle (ADMIN=red-500, USER=violet-500) |
