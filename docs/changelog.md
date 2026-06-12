# Changelog

## 2026-06-11
- **Feature** : TOTP MFA - Backend: routes /mfa/enroll (generate secret + QR code), /mfa/verify (validate code + issue tokens), /mfa/skip (bypass MFA), /mfa/status/{user_id}
- **Feature** : TOTP MFA - Backend: api/requirements.txt - Added pyotp, qrcode libraries
- **Feature** : TOTP MFA - Backend: auth.py login - Check MFA status, return requires_mfa flag with user_id/has_mfa/mfa_verified
- **Feature** : TOTP MFA - Backend: router.py - Added mfa router
- **Feature** : TOTP MFA - Backend: Database - New table mfa_secrets (user_id, secret, is_verified, created_at)
- **Feature** : TOTP MFA - Frontend: /login/mfa/page.jsx - MFA setup and verification page with QR code display, code input, skip option
- **Feature** : TOTP MFA - Frontend: auth.js loginAction - Redirect to /login/mfa if requires_mfa is true
- **Feature** : TOTP MFA - Flow: Login → if no MFA or unverified MFA → redirect to /login/mfa → user can setup/verify or skip
- **Feature** : TOTP MFA - On successful verification/skip: issue access_token and refresh_token, redirect to /chat
- **Feature** : POST /ai/embedding - Support multi-formats : PDF (PDFReader), TXT (lecture directe), JSON/CSV/XLSX (PandasReader)
- **Feature** : api/requirements.txt - Ajout dépendances pandas et openpyxl pour PandasReader
- **Refactor** : Création composants ActionError et ActionSuccess réutilisables dans /shared/ActionAlert.jsx
- **Refactor** : Remplacement notifications inline par ActionError/ActionSuccess dans /admin/documents/page.jsx et /admin/members/page.jsx
- **Feature** : Ajout page /admin/documents pour gestion des embeddings de documents avec icônes colorées par type de fichier
- **Feature** : DocumentUploadForm.jsx - Upload multi-formats avec drag & drop et validation (PDF/TXT/JSON/CSV/XLSX, 50MB max)
- **Feature** : GET /admin/documents - Liste documents regroupés par filename depuis vecs.documents_gemini
- **Feature** : DELETE /admin/documents/{filename} - Suppression de toutes les lignes (chunks) d'un fichier
- **Feature** : POST /ai/embedding - Réservé aux ADMIN, vérifie doublons via metadata.filename
- **Feature** : AdminNavigation.jsx - Ajout lien "Documents"
- **Fix** : components/auth/index.js - Correction import ErrorAlert (`from '../shared'` au lieu de `from './ErrorAlert'`)

## 2026-06-10
- **Fix** : chat/page.jsx - L'URL devient la source de vérité unique du conversation_id (router.replace à la création + sync effect piloté par le param URL) : corrige la création d'une nouvelle conversation à chaque réponse
- **Refactor DRY** : Creation utils/messageFormatters.js avec parseAPIResponse, createAIMessage, createUserMessage, createWelcomeMessage, createErrorMessage, formatHistoricalMessages
- **Refactor DRY** : Creation utils/userUtils.js avec getRoleColor pour centraliser la logique de couleur par rôle
- **Refactor DRY** : useChat.js utilise désormais messageFormatters pour parseAPIResponse et createAIMessage/createErrorMessage
- **Refactor DRY** : chat/page.jsx utilise désormais messageFormatters pour parseAPIResponse, createAIMessage, createUserMessage, createWelcomeMessage, formatHistoricalMessages
- **Refactor DRY** : chat/archives/[id]/page.jsx utilise désormais formatHistoricalMessages
- **Refactor DRY** : SidebarCollapsed.jsx et UserProfile.jsx utilisent désormais getRoleColor au lieu de conditions dupliquées
- **Refactor DRY** : Suppression de isPageOrange/isPageRed dans pageColors.js (non utilisés)
- **Refactor** : Déplacement ErrorAlert.jsx de components/auth/ vers components/shared/
- **Refactor** : chat/layout.jsx - Initialisation currentPage à 'Broussaud AI' au lieu de 'chat', suppression useEffect redondant
- **Docs** : Mise à jour registry.md avec nouveaux utilitaires
- **Fix** : chat/page.jsx - Corrected useSearchParams() Suspense boundary by extracting to ChatPageContent component
- **Fix** : chat/layout.jsx - Created ConversationsContext to share fetchConversations with children
- **Fix** : chat/layout.jsx - Removed useSearchParams dependency, using Context to refresh sidebar after new conversation
- **Fix** : chat/page.jsx - Using ConversationsContext to call fetchConversations after new conversation creation
- **Fix** : chat/archives/page.jsx - Added Suspense boundary by extracting to ArchivesContent component
- **Fix** : chat/archives/[id]/page.jsx - Added Suspense boundary for useParams() hook by extracting to ArchiveConversationContent component
- **Frontend** : chat/layout.jsx - Removed Suspense wrapper and React.cloneElement injection (replaced by Context)
- **Backend** : conversations.py - Nouveaux endpoints non-admin : GET /conversations, GET /conversations/{id}, GET /conversations/archives, GET /conversations/archives/{id}, DELETE /conversations/{id}
- **Backend** : conversations.py - Réorganisation de l'ordre des routes pour éviter conflit avec /archives
- **Backend** : ia.py - Utilisation du champ title du rag_result comme titre de conversation
- **Frontend** : chat/layout.jsx - Nouveau layout commun pour /chat/* avec sidebar gérée
- **Frontend** : chat/page.jsx - Refactor avec chargement des messages historiques via /conversations/{id}
- **Frontend** : chat/archives/page.jsx - Page liste des archives (grille 1/2 colonnes, recherche, pagination)
- **Frontend** : chat/archives/[id]/page.jsx - Page affichage archive en lecture seule
- **Frontend** : Sidebar.jsx - Ajout bouton "Mes archives" au-dessus de "Nouvelle conversation"
- **Frontend** : NavigationSelector.jsx - Affichage fixe "Broussaud AI" quel que soit le sous-route
- **Frontend** : ChatHeader.jsx - Support props title et isArchived
- **Frontend** : ConversationList.jsx/ConversationItem.jsx - Adaptation à nouveau format de données

## 2026-06-09
- **Backend** : Remplacement `api/app/services/rag.py` par `api/app/services/agent.py` - Refactor complète avec RAGConfig, PromptManager, RAGAgentService, intégration MCP, intercepteur Gemini, FunctionAgent LlamaIndex
- **Frontend** : Skeleton.jsx - Nouveau composant Skeleton avec AvatarSkeleton, TextSkeleton, StatsCardSkeleton, TableRowSkeleton, ConversationCardSkeleton
- **Frontend** : UserProfile.jsx - Ajout prop isLoading pour afficher skeleton profil
- **Frontend** : ConversationList.jsx - Ajout prop isLoading pour afficher 3 skeletons d'historique
- **Frontend** : Sidebar.jsx - Ajout prop isLoading passé à ConversationList et UserProfile
- **Frontend** : SidebarCollapsed.jsx - Ajout prop isLoading pour afficher skeleton avatar
- **Frontend** : shared/index.js - Export tous les composants Skeleton
- **Frontend** : chat/index.js - Export SidebarCollapsed
- **Frontend** : ChatInput.jsx - Ajout texte de prévention au-dessus de l'input
- **Frontend** : chat/page.jsx - Gestion isSidebarLoading (isUserLoading || isConversationsLoading) pour skeletons sidebar
- **Frontend** : admin/dashboard/page.jsx - Remplacement LoadingIndicator par 4 StatsCardSkeleton
- **Frontend** : admin/members/page.jsx - Remplacement LoadingIndicator par skeleton tableau (5 lignes)
- **Frontend** : admin/conversations/page.jsx - Remplacement LoadingIndicator par 5 ConversationCardSkeleton
- **Hooks** : useUserInfo.js - Déstructuration loading pour isSidebarLoading

## 2026-06-08
- **Serveur MCP** : Ajout serveur MCP (mcp/) avec FastMCP, outils: hello_world, get_stat_by_name, get_stats_count, get_all_stats, get_stats_by_filter
- **Backend** : admin.py - Ajout endpoints CRUD utilisateurs (POST /admin/users, PUT /admin/users/{id}, DELETE /admin/users/{id})
- **Backend** : admin.py - Fix import get_password_hash depuis auth.py pour hashage des mots de passe
- **Frontend** : AdminMembersPage - Ajout SideCanvas pour création/modification utilisateurs
- **Frontend** : SideCanvas.jsx - Animation d'apparition glissante depuis la droite (translate-x-full → translate-x-0)
- **Frontend** : SideCanvas.jsx - Overlay avec fade synchronisé (opacity-0 → opacity-100)
- **Frontend** : UserForm.jsx - Nouveau composant formulaire utilisateur (nom, prénom, mail, mdp, rôle)
- **Frontend** : DeleteModal.jsx - Nouveau composant modale de confirmation de suppression
- **Frontend** : RoleDropdown.jsx - Nouveau composant dropdown custom pour sélection des rôles (USER/ADMIN)
- **Frontend** : UserForm.jsx - Remplacement select natif par RoleDropdown pour choix des rôles
- **Frontend** : AdminConversationsPage - Recherche globale + filtres par label/sub_label/tag avec dropdown
- **Frontend** : MiniChart.jsx - Nouveau composant ApexCharts pour dashboard
- **Frontend** : UserProfile.jsx - Fond rouge-500 pour ADMIN
- **Frontend** : MessageList.jsx - Props isAdminView (désactive masque) et userEmail
- **Frontend** : Message.jsx - Prop userEmail pour afficher mail au lieu de "Vous"
- **Frontend** : admin/conversations/* - Affichage user_mail au lieu de user_id UUID
- **Frontend** : admin/dashboard/page.jsx - MiniChart pour conversations et messages
- **Backend** : admin.py - Ajout user_mail via join, get_timeline_data()
- **Backend** : admin.py - GET /admin/ retourne stats + timeline, GET /admin/messages pour métadonnées
- **Docs** : Mise à jour architecture.md, registry.md, references.md

## 2026-06-05
- **Frontend** : MiniChart.jsx - Nouveau composant ApexCharts minimaliste pour dashboard admin
- **Frontend** : MessageList.jsx - Ajout props `isAdminView` (désactive masque) et `userEmail` (remplace "Vous")
- **Frontend** : Message.jsx - Ajout prop `userEmail` pour afficher mail au lieu de "Vous"
- **Frontend** : admin/conversations/page.jsx - Affichage user_mail au lieu de user_id UUID
- **Frontend** : admin/conversations/[id]/page.jsx - Affichage user_mail, passage isAdminView=true et userEmail à MessageList
- **Frontend** : admin/dashboard/page.jsx - Ajout MiniChart pour conversations et messages avec données timeline
- **Backend** : admin.py - Ajout `user_mail` via join dans /admin/all-conversations et /admin/conversations/{id}
- **Backend** : admin.py - Fonction `get_timeline_data()` pour générer timeline 10 jours
- **Backend** : admin.py - GET /admin/ retourne maintenant stats + timeline
- **Docs** : Mise à jour architecture.md, registry.md, references.md

## 2026-06-05
- **Backend** : Refactor admin.py - Extraction `verify_admin()` pour éviter duplication vérification rôle ADMIN (4 endpoints)
- **Backend** : Refactor conversations.py - Extraction `verify_conversation_owner()` pour éviter duplication vérification propriétaire
- **Frontend** : Création utils/pageColors.js - Centralisation des couleurs par page (PAGE_COLORS, getPageColor, isPageOrange, isPageRed)
- **Frontend** : NavigationSelector.jsx + SidebarCollapsed.jsx - Utilisation de getPageColor() au lieu de conditions dupliquées
- **Docs** : Mise à jour registry.md - Nettoyage doublons, correction middleware.js → proxy.js, ajout utils/pageColors.js
- **Frontend** : Renommage ModeSelector.jsx → NavigationSelector.jsx (composant de navigation pure, pas de gestion de mode)
- **Frontend** : NavigationSelector - Ajout bouton bleu "Boutique Maison Broussaud" (lien externe https://maisonbroussaud.fr/) avec icône ExternalLink
- **Frontend** : NavigationSelector - Bouton "Administration" (rouge) visible uniquement si rôle = ADMIN, redirection vers /admin
- **Frontend** : NavigationSelector - Bouton "Broussaud AI" (orange) redirige vers /chat
- **Frontend** : NavigationSelector - Corrections couleurs : Broussaud AI=orange, Administration=rouge, Boutique=bleu
- **Backend** : Ajout colonne `role` (VARCHAR(50), DEFAULT 'USER') à la table users (supabase_init.py)
- **Backend** : auth.py - UserRegister : retrait champ role, rôle forcé à "USER" à l'inscription (sécurité)
- **Backend** : auth.py - login/refresh/tokens : incluent rôle dans payload JWT
- **Backend** : auth.py - get_current_user : retourne le rôle de l'utilisateur
- **Frontend** : useUserInfo.js - Gestion du rôle utilisateur depuis le JWT
- **Frontend** : /api/user/route.js - Retourne le rôle dans les infos utilisateur
- **Frontend** : Sidebar.jsx + SidebarCollapsed.jsx - Utilisation de currentPage au lieu de selectedMode
- **Frontend** : useChat.js - Renommage selectedMode → currentPage
- **Frontend** : proxy.js - Ajout protection route /admin (vérification JWT + rôle ADMIN requis)
- **Frontend** : admin/page.jsx - Page panneau d'administration (accès réservé aux ADMIN)
- **Backend** : admin.py - Route GET /admin/ retourne stats (users_count, conversations_count, messages_count, vectors_count)
- **Backend** : admin.py - Route GET /admin/users liste utilisateurs (ADMIN seulement)
- **Backend** : router.py - Inclusion du router admin
- **Frontend** : Ajout label "Vous" dans la bulle des messages utilisateur (Message.jsx)
- **Frontend** : Suppression middleware.js (remplacé par proxy.js dans Next.js 16)
- **Frontend** : components/shared/index.js - Export ErrorAlert, LoadingIndicator, Logo
- **Frontend** : AdminSidebar.jsx - Sidebar admin avec NavigationSelector + AdminNavigation (vertical) + UserProfile, affiche toujours "Administration" dans NavigationSelector
- **Frontend** : AdminNavigation.jsx - Navigation verticale (Dashboard, Membres, Conversations) avec indicateurs actifs
- **Frontend** : admin/layout.jsx - Layout admin avec AdminSidebar
- **Frontend** : admin/dashboard/page.jsx - Stats (users, conversations, messages, vecteurs)
- **Frontend** : admin/members/page.jsx - Liste membres avec pagination
- **Frontend** : admin/conversations/page.jsx - Liste toutes les conversations (admin), clic → redirection vers /admin/conversations/[id]
- **Frontend** : admin/conversations/[id]/page.jsx - Détail conversation avec MessageList, MessageMeta, Message
- **Backend** : admin.py - Route GET /admin/all-conversations (toutes les conversations)
- **Backend** : admin.py - Route GET /admin/conversations/{id} (détail conversation)
- **Frontend** : Correction scroll automatique vers le bas - suppression div flex-1 poussant les messages, ajout délai setTimeout(50ms) pour scroll après rendu DOM
- **Frontend** : `chat/page.jsx` - Ajout des `contexts` dans le formatage des messages historiques pour affichage de l'icône loupe
- **Frontend** : Implémentation formatage réponses IA avec `%NL%` (saut de ligne) et `%BOLD%/%ENDBOLD%` (gras) via formatText.js
- **Frontend** : Intégration formatResponseText dans Message.jsx pour les réponses IA
- **Frontend** : Ajout icône loupe (Search) dans Message.jsx avec tooltip affichant les `contexts` utilisés
- **Frontend** : useChat.js - extraction des `contexts` depuis le JSON de l'IA
- **Backend** : `api/app/api/routes/ia.py` - POST /embedding conserve `filename` dans les métadonnées des documents et nodes
- **Backend** : `api/app/api/routes/ia.py` - POST /ai/chat extrait `contexts` du JSON de l'IA, l'ajoute à la réponse et le sauvegarde en DB
- **Backend** : `core/supabase_init.py` - Ajout champ `contexts` (JSONB) à la table messages
- **Docs** : Mise à jour architecture.md (schéma DB) et registry.md avec utilitaire formatText.js
- **Backend** : Fix DELETE /conversations/{id} - suppression JSONResponse pour respect HTTP 204 No Content

## 2026-06-04
- **Backend** : Ajout routes conversations (GET /conversations, GET /conversations/{id}, DELETE /conversations/{id})
- **Backend** : Soft-delete conversations (is_active flag)
- **Backend** : Titre de conversation = premier prompt utilisateur (50 premiers caractères)
- **Backend** : Mise à jour schéma DB conversations (ajout title TEXT, is_active BOOLEAN)
- **Frontend** : useConversations hook pour gérer listing/chargement/suppression conversations
- **Frontend** : ConversationItem avec highlight neutral-300 pour conversation active
- **Frontend** : ConversationItem avec bouton suppression (Trash2 icon, visible au hover)
- **Frontend** : ConversationList avec chargement et affichage des conversations utilisateur
- **Frontend** : Chat page avec sélection/chargement/suppression conversations
- **Frontend** : Animation sidebar (ouverture/fermeture fluide, transition overlay, rotation icône hamburger)
- **Frontend** : Implémentation responsive sidebar mobile (SidebarCollapsed.jsx)
- **Frontend** : Messages responsive (mobile: pleine largeur centrée / desktop: largeur auto + alignement gauche/droite)
- **Frontend** : Overlay sidebar avec fond blanc transparent et bouton fermeture pleine largeur
- **Frontend** : Mode non cliquable en version mobile

## 2026-06-03
- **Frontend** : Création components chat (Sidebar, Message, MessageList, ChatInput, ChatHeader, UserProfile, ModeSelector)
- **Frontend** : Hooks useChat, useUserInfo, useClickOutside
- **Frontend** : Service api.js avec interceptors JWT
- **Frontend** : Pages login, register, logout, chat
- **Frontend** : Layout avec AnimatedBackground

## 2026-06-02
- **Backend** : Routes auth (register, login, logout, refresh)
- **Backend** : Routes IA (chat, embedding)
- **Backend** : Configuration LLM (Google GenAI gemini-3.1-flash-lite)
- **Backend** : Supabase client et initialisation DB
- **Backend** : Service RAG avec LlamaIndex
- **Backend** : Main FastAPI avec CORS et lifespan

## 2026-06-01
- **Infrastructure** : Structure projet (api/ + web/)
- **Backend** : Docker Compose et requirements.txt
- **Frontend** : Next.js 16 avec Tailwind CSS 4
