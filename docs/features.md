# Features - Local Chatbot Broussaud

**Dernière mise à jour**: 16/06/2026

---

## 📋 Liste complète des Features

### 🔐 Authentification & Sécurité

| Feature | Description | Path | Composants/Fonctions utilisés |
|---------|-------------|------|--------------------------------|
| Authentification JWT | Système complet de login, register, logout avec tokens JWT (access: 5min, refresh: 7j) | `api/app/api/routes/auth.py`, `web/src/app/actions/auth.js` | `get_current_user`, `create_access_token`, `create_refresh_token`, `get_password_hash`, `verify_password` |
| Gestion des rôles | Système USER/ADMIN avec vérification côté backend et frontend | `api/app/api/routes/auth.py`, `web/src/hooks/useUserInfo.js` | `verify_admin()`, `getRoleColor()` |
| TOTP MFA | Authentification à deux facteurs avec Time-based One-Time Password | `api/app/api/routes/mfa.py`, `web/src/app/login/mfa/` | `enroll_mfa`, `verify_mfa`, `skip_mfa_setup`, `get_mfa_status`, `MFAClient.jsx` |
| Protection des routes | Middleware de vérification JWT + rôle pour /admin | `web/src/proxy.js` | - |

### 💬 Chat & RAG

| Feature | Description | Path | Composants/Fonctions utilisés |
|---------|-------------|------|--------------------------------|
| Chat RAG | Discussion avec IA spécialisée sur l'usine textile Broussaud, classification automatique | `api/app/services/agent_orchestrator.py`, `api/app/services/rag_service.py`, `web/src/app/chat/page.jsx` | `RAGAgentService`, `chat_with_agent`, `format_source_nodes`, `useChat.js` |
| Historique des conversations | Sauvegarde et chargement des messages historiques | `api/app/api/routes/conversations.py`, `web/src/app/chat/page.jsx` | `useConversations.js`, `ConversationList.jsx`, `ConversationItem.jsx` |
| Classification automatique | Labels, sous-labels et tags générés par l'IA | `api/app/services/utils.py`, `api/app/services/agent_orchestrator.py`, `web/src/components/chat/Message.jsx` | `extract_json_from_response`, `TagBadge.jsx` |
| Affichage des contexts | Visualisation des sources RAG utilisées pour les réponses | `web/src/components/chat/Message.jsx` | `formatText.js`, icône Search (loupe) |
| Formatage riche | Support de `%NL%` (sauts de ligne) et `%BOLD%/%ENDBOLD%` (gras) | `web/src/utils/formatText.js` | `formatResponseText()` |

### 📁 Gestion des Documents

| Feature | Description | Path | Composants/Fonctions utilisés |
|---------|-------------|------|--------------------------------|
| Upload multi-formats | Upload de documents PDF, TXT, JSON, CSV, XLSX, MD | `api/app/api/routes/ia.py`, `web/src/app/admin/documents/page.jsx` | `PDFReader`, `PandasReader`, `DocumentUploadForm.jsx` |
| Indexation vectorielle | Stockage dans Supabase Vector Store (documents_gemini) | `api/app/services/rag_service.py` | `SupabaseVectorStore`, `VectorStoreIndex` |
| Vérification des doublons | Empêcher l'upload de documents déjà indexés | `api/app/api/routes/ia.py` | Vérification via `metadata.filename` |
| Gestion des embeddings | Liste et suppression des documents indexés | `api/app/api/routes/admin.py` | `list_documents`, `delete_document` |

### 📊 Administration

| Feature | Description | Path | Composants/Fonctions utilisés |
|---------|-------------|------|--------------------------------|
| Dashboard Admin | Statistiques (utilisateurs, conversations, messages, vecteurs) avec timeline | `api/app/api/routes/admin.py`, `web/src/app/admin/dashboard/page.jsx` | `admin_dashboard`, `get_timeline_data`, `MiniChart.jsx` |
| CRUD Utilisateurs | Création, lecture, mise à jour, suppression des utilisateurs | `api/app/api/routes/admin.py`, `web/src/app/admin/members/page.jsx` | `list_users`, `create_user`, `update_user`, `delete_user`, `UserForm.jsx`, `SideCanvas.jsx`, `DeleteModal.jsx` |
| Gestion des rôles | Sélection des rôles via dropdown custom | `web/src/components/admin/RoleDropdown.jsx` | - |
| Liste des conversations | Vue de toutes les conversations avec filtres | `web/src/app/admin/conversations/page.jsx` | `AdminNavigation.jsx`, recherche + filtres label/sub_label/tag |
| Détail des conversations | Affichage complet avec user_mail et messages | `web/src/app/admin/conversations/[id]/page.jsx` | `MessageList.jsx` (isAdminView=true, userEmail) |

### 🗂️ Gestion des Conversations

| Feature | Description | Path | Composants/Fonctions utilisés |
|---------|-------------|------|--------------------------------|
| CRUD Conversations | Création, liste, chargement, suppression (soft-delete) | `api/app/api/routes/conversations.py`, `web/src/app/chat/` | `useConversations.js`, `ConversationItem.jsx` |
| Soft Delete | Archivage via champ `is_active` | `api/app/api/routes/conversations.py` | - |
| Titre automatique | Premier prompt utilisateur comme titre | `api/app/api/routes/ia.py` | Extraction depuis `rag_result.title` |
| Pages d'archives | Liste et détail des conversations archivées (lecture seule) | `web/src/app/chat/archives/` | `ConversationList.jsx`, `ChatHeader.jsx` (isArchived) |

### 🎨 Interface Utilisateur

| Feature | Description | Path | Composants/Fonctions utilisés |
|---------|-------------|------|--------------------------------|
| Animated Background | Fond animé avec canvas (CPU→GPU optimisé) | `web/src/components/layout/AnimatedBackground.jsx` | - |
| Sidebar Responsive | Navigation latérale avec animation fluide | `web/src/components/chat/Sidebar.jsx`, `web/src/components/chat/SidebarCollapsed.jsx` | `NavigationSelector.jsx`, `UserProfile.jsx`, `NewConversationButton.jsx` |
| Navigation | Sélecteur de page avec gestion des rôles | `web/src/components/chat/NavigationSelector.jsx` | `getPageColor()`, `pageColors.js` |
| Animations | Transitions fluides pour sidebar, overlays, icônes | Tous les composants | `transition-all`, `duration-300`, `ease-in-out` |
| Skeletons | Indicateurs de chargement animés | `web/src/components/shared/Skeleton.jsx` | `AvatarSkeleton`, `TextSkeleton`, `StatsCardSkeleton`, `TableRowSkeleton`, `ConversationCardSkeleton` |
| Notifications | Alertes réutilisables pour erreurs et succès | `web/src/components/shared/ActionAlert.jsx` | `ActionError`, `ActionSuccess` |
| Thème couleur | Gestion centralisée des couleurs par page | `web/src/utils/pageColors.js` | `PAGE_COLORS`, `getPageColor()` |

### 🔌 Serveur MCP

| Feature | Description | Path | Composants/Fonctions utilisés |
|---------|-------------|------|--------------------------------|
| Serveur FastMCP | Interface MCP pour accès aux statistiques | `mcp/app/server.py` | `FastMCP`, `uvicorn` |
| Outils de statistiques | Accès à la table stats de Supabase | `mcp/app/tools/` | `hello_world`, `get_stat_by_name`, `get_stats_count`, `get_all_stats`, `get_stats_by_filter` |
| Client Supabase MCP | Connexion dédiée pour le serveur MCP | `mcp/app/core/supabase_client.py` | - |

### 📱 Responsive Design

| Feature | Description | Path | Composants/Fonctions utilisés |
|---------|-------------|------|--------------------------------|
| Mobile First | Adaptation pour mobile (< 768px) | Tous les composants | Breakpoints `md:`, `lg:`, `xl:` |
| Sidebar Mobile | Overlay avec bouton fermeture pleine largeur | `web/src/components/chat/Sidebar.jsx` | `fixed inset-0`, `bg-white/50`, `backdrop-blur-xs` |
| Messages Responsive | Pleine largeur sur mobile, alignement sur desktop | `web/src/components/chat/Message.jsx` | `w-full mx-auto` (mobile), `w-fit max-w-[85%]` (desktop) |

---

## 🏷️ Catégorisation par domaine

### Backend (FastAPI)
- Authentification JWT avec rôles
- RAG avec LlamaIndex + Google GenAI
- CRUD Conversations
- CRUD Utilisateurs (Admin)
- Gestion des documents (embedding)
- Serveur MCP (FastMCP)
- Logger Phoenix (debug)

### Frontend (Next.js 16)
- Interface chat complète
- Panneau d'administration
- Gestion des archives
- Responsive design
- Animations fluides
- Système de notifications

### Base de données (Supabase)
- Table users (avec rôle)
- Table conversations (avec is_active, title)
- Table messages (avec contexts JSONB)
- Table sessions
- Vector Store: vecs.documents_gemini (3072 dimensions)
- Table mfa_secrets (pour TOTP MFA)

---

## 🎯 Roadmap des Features

### ✅ Implémentées
- [x] Authentification complète avec MFA TOTP
- [x] Chat RAG avec classification automatique
- [x] Panneau d'administration sécurisé
- [x] Gestion des conversations (CRUD + archives)
- [x] Gestion des documents (upload multi-formats)
- [x] Serveur MCP avec outils statistiques
- [x] Responsive design complet
- [x] Animations fluides
- [x] Système de notifications réutilisables

### 🚧 En développement
- [ ] Rate limiting
- [ ] Tests unitaires et d'intégration
- [ ] CSRF protection

---

## 📊 Statistiques

- **Total Features**: 25+
- **Backend Routes**: 30+
- **Frontend Pages**: 15+
- **Composants Réutilisables**: 40+
- **Hooks**: 5
- **Services**: 7
