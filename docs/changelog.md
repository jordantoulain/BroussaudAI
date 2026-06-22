# Changelog - Projet Broussaud AI (Stage BTS SIO)

**Projet pédagogique - Lycée Suzanne Valadon & Entreprise Broussaud**
**BTS SIO Option SLAM - Année 2025-2026**

---

## 📅 Historique des Modifications

### Format des entrées
- `[type]`: feat (nouvelle fonctionnalité), fix (correction), docs (documentation), chore (maintenance), refactor (refactorisation), perf (optimisation), security (sécurité)
- **Compétences associées**: Indication des compétences BTS SIO mobilisées
- **Apprentissages**: Points clés appris lors de l'implémentation

---

## 19/06/2026 - Semaine 14 (Sécurité et Audit)

### 🔒 Corrections de Sécurité (Compétences: C2.2, C2.3)

| Type | Description | Vulnérabilité | Statut | Compétences |
|------|-------------|---------------|--------|-------------|
| [fix] | V-003: Validation taille (10MB), extension et MIME type pour uploads | Upload de fichiers malveillants | ✅ Corrige | C2.2, C2.3 |
| [fix] | V-004: Validation UUID4 parametres, masquage mfa_secret | Fuites d'informations sensibles | ✅ Corrige | C2.3 |
| [fix] | V-005: Chiffrement Fernet des secrets MFA (core/crypto_utils.py) | Stockage non sécurisé | ✅ Corrige | C2.3 |
| [fix] | V-011: Middleware security headers + configuration CORS | Attaques XSS, Clickjacking | ✅ Corrige | C2.2, C2.3 |
| [fix] | V-013: Rate limiting middleware (/auth/login: 5/min, /auth/register: 3/min) | Brute Force | ✅ Corrige | C2.2 |
| [fix] | V-014: Validation Pydantic complète (sanitize_name, validate_email_domain, validate_password_strength) | Données invalides | ✅ Corrige | C2.2 |
| [fix] | V-016: Centralisation gestion connexions (core/database.py) | Gestion des ressources | ⚠️ Partiellement corrige | C1.4 |
| [fix] | V-020: Réduction durée refresh_token (7j → 1j) | Risques de compromission | ✅ Corrige | C2.3 |
| [fix] | V-021: Soft delete utilisateurs (is_active, deleted_at, deleted_by) | RGPD, réversibilité | ✅ Corrige | C2.3, SA4 |
| [fix] | V-025: Sanitization des entrées avec bleach (core/sanitize.py) | XSS | ✅ Corrige | C2.2, C2.3 |

### 📝 Documentation
- [docs] - Mise à jour rapport_securite.md avec statuts pour 10 vulnérabilités corrigées + 1 partiellement

### 🔧 Maintenance
- [chore] - Ajout bleach à requirements.txt

**Apprentissages clés**:
- ✅ Gestion avancée de la sécurité des applications web
- ✅ Protection contre les attaques courantes (XSS, CSRF, Brute Force)
- ✅ Bonnes pratiques de validation des données
- ✅ Chiffrement des données sensibles
- ✅ Conformité RGPD dans le développement

---

## 18/06/2026 - Semaine 13 (Statistiques et Dashboard)

### 📊 Nouvelles Fonctionnalités (Compétences: C1.2, C1.3)

- [feat] - Ajout outil generate_conversation_summary dans rag_service.py pour résumer une conversation complète
- [feat] - Ajout table stats_ia dans supabase_init.py pour le suivi des statistiques IA par jour
- [feat] - Backend: admin.py étendu avec stats_ia (conversations, messages, temps moyen de réponse, tokens, avis positifs/négatifs) par jour/semaine/total + timeline
- [feat] - Backend: ia.py - update_stats_ia() pour tracer conversations, messages, tokens, temps de réponse
- [feat] - Backend: reviews.py - update_review_stats_ia() pour tracer les avis
- [feat] - Frontend: dashboard admin avec charts IA sur 7 jours (conversations, messages, tokens, avis, temps de réponse)
- [feat] - Frontend: MiniChart.jsx support height prop pour graphs de différentes tailles

**Apprentissages clés**:
- ✅ Implémentation de métriques et analytics
- ✅ Visualisation de données avec ApexCharts
- ✅ Gestion des statistiques en temps réel
- ✅ Optimisation des performances du monitoring

---

## 17/06/2026 - Semaine 12 (Gestion des Conversations)

### 🗂️ Fonctionnalités de Gestion (Compétences: C1.2, C1.3)

- [feat] - Ajout feature épingler/désépingler conversations : colonne pinned dans conversations, endpoint PATCH /conversations/{id}/pin, tri par pinned DESC
- [feat] - Frontend : bouton toggle pin dans ConversationItem.jsx (icône Pin, ambre-500 si épinglé), affichage conversations épinglées en section "Épinglées" au-dessus de "Historique"
- [feat] - UX : boutons d'action (pin/delete) masqués par défaut, visibles uniquement au hover sur ConversationItem (group-hover:opacity-100)

### 🏗️ Refactoring (Compétences: C1.2, C4.1)

- [refactor] - Séparation de api/app/services/agent.py en modules modulaire pour améliorer maintenabilité
- [refactor] - Création config.py : RAGConfig pour la configuration
- [refactor] - Création prompts.py : PromptManager pour la gestion des prompts
- [refactor] - Création utils.py : extract_json_from_response + patch Gemini
- [refactor] - Création pdf_generator.py : PDFGenerator + fonctions de génération et upload
- [refactor] - Création rag_service.py : RAGAgentService + outils RAG/PDF
- [refactor] - Création agent_orchestrator.py : chat_with_agent + orchestration
- [refactor] - agent.py devient un point d'entrée propre avec backward compatibility
- [docs] - Mise à jour registry.md avec la nouvelle architecture modulaire

**Apprentissages clés**:
- ✅ Bonnes pratiques de refactoring
- ✅ Séparation des responsabilités (Single Responsibility Principle)
- ✅ Architecture modulaire et maintenable
- ✅ Gestion de la dette technique

---

## 16/06/2026 - Semaine 11 (Optimisation et Build)

### ⚡ Optimisations (Compétences: C1.2, C1.3)

- [perf] - Optimisation du background : passage CPU vers GPU, retrait du suivi de la souris (AnimatedBackground.jsx)
- [feat] - Refactor pour build Next.js : extraction de MFAClient.jsx depuis login/mfa/page.jsx
- [refactor] - web/src/app/layout.js : mise à jour pour optimisation background

### 📁 Gestion des Documents
- [feat] - Ajout outil de génération PDF des conversations (agent.py, requirements.txt)

**Apprentissages clés**:
- ✅ Optimisation des performances frontend (GPU vs CPU)
- ✅ Configuration de build Next.js
- ✅ Génération de documents PDF programmatique

---

## 15/06/2026 - Semaine 10 (UI/UX et Cleanup)

### 🎨 Améliorations UI (Compétences: C1.2)

- [refactor] - Changement couleurs pages (pageColors.js)
- [chore] - Remove : Route non utilisée (api/app/api/routes/data.py supprimé)
- [chore] - Debug: Ajout logger Phoenix (main.py, requirements.txt, docker-compose.yml)
- [refactor] - Modification du system prompt (system_prompt.txt)
- [fix] - Retrait label + tags pour garder uniquement tags

### 📁 Support Multi-formats
- [feat] - Ajout support des documents .md (Markdown) pour l'embedding
- [feat] - Gestion stats utilisateur + intégration MCP renforcée
- [chore] - Remove : Retrait de fichiers non utilisés

**Apprentissages clés**:
- ✅ Gestion des couleurs et du thème
- ✅ Debugging avancé avec Phoenix
- ✅ Support de multiples formats de documents
- ✅ Nettoyage de code (clean code)

---

## 11/06/2026 - Semaine 9 (MFA et Documents)

### 🔐 Authentification à Deux Facteurs (Compétences: C2.3, C1.2)

- [feat] - **TOTP MFA** - Backend: routes /mfa/enroll (generate secret + QR code), /mfa/verify (validate code + issue tokens), /mfa/skip (bypass MFA), /mfa/status/{user_id}
- [feat] - **TOTP MFA** - Backend: api/requirements.txt - Added pyotp, qrcode libraries
- [feat] - **TOTP MFA** - Backend: auth.py login - Check MFA status, return requires_mfa flag with user_id/has_mfa/mfa_verified
- [feat] - **TOTP MFA** - Backend: router.py - Added mfa router
- [feat] - **TOTP MFA** - Backend: Database - New table mfa_secrets (user_id, secret, is_verified, created_at)
- [feat] - **TOTP MFA** - Frontend: /login/mfa/page.jsx - MFA setup and verification page with QR code display, code input, skip option
- [feat] - **TOTP MFA** - Frontend: auth.js loginAction - Redirect to /login/mfa if requires_mfa is true
- [feat] - **TOTP MFA** - Flow: Login → if no MFA or unverified MFA → redirect to /login/mfa → user can setup/verify or skip
- [feat] - **TOTP MFA** - On successful verification/skip: issue access_token and refresh_token, redirect to /chat

### 📁 Gestion des Documents Multi-formats (Compétences: C1.2, C1.3)

- [feat] - POST /ai/embedding - Support multi-formats : PDF (PDFReader), TXT (lecture directe), JSON/CSV/XLSX (PandasReader)
- [feat] - api/requirements.txt - Ajout dépendances pandas et openpyxl pour PandasReader
- [refactor] - Création composants ActionError et ActionSuccess réutilisables dans /shared/ActionAlert.jsx
- [refactor] - Remplacement notifications inline par ActionError/ActionSuccess dans /admin/documents/page.jsx et /admin/members/page.jsx
- [feat] - Ajout page /admin/documents pour gestion des embeddings de documents avec icônes colorées par type de fichier
- [feat] - DocumentUploadForm.jsx - Upload multi-formats avec drag & drop et validation (PDF/TXT/JSON/CSV/XLSX, 50MB max)
- [feat] - GET /admin/documents - Liste documents regroupés par filename depuis vecs.documents_gemini
- [feat] - DELETE /admin/documents/{filename} - Suppression de toutes les lignes (chunks) d'un fichier
- [feat] - POST /ai/embedding - Réservé aux ADMIN, vérifie doublons via metadata.filename

### 🐛 Corrections
- [fix] - components/auth/index.js - Correction import ErrorAlert (`from '../shared'` au lieu de `from './ErrorAlert'`)

**Apprentissages clés**:
- ✅ Implémentation complète de l'authentification à deux facteurs (MFA/TOTP)
- ✅ Génération et vérification de codes TOTP avec PyOTP
- ✅ Génération de QR codes pour l'enrôlement MFA
- ✅ Upload et traitement de multiples formats de fichiers
- ✅ Gestion des dépendances Python
- ✅ Composants React réutilisables

---

## 10/06/2026 - Semaine 8 (Conversations et Refactoring)

### 💬 Gestion des Conversations (Compétences: C1.2, C1.3)

- [fix] - chat/page.jsx - L'URL devient la source de vérité unique du conversation_id (router.replace à la création + sync effect piloté par le param URL) : corrige la création d'une nouvelle conversation à chaque réponse

### 🏗️ Refactoring DRY (Compétences: C1.2, C4.1)

- [refactor DRY] - Creation utils/messageFormatters.js avec parseAPIResponse, createAIMessage, createUserMessage, createWelcomeMessage, createErrorMessage, formatHistoricalMessages
- [refactor DRY] - Creation utils/userUtils.js avec getRoleColor pour centraliser la logique de couleur par rôle
- [refactor DRY] - useChat.js utilise désormais messageFormatters pour parseAPIResponse et createAIMessage/createErrorMessage
- [refactor DRY] - chat/page.jsx utilise désormais messageFormatters pour parseAPIResponse, createAIMessage, createUserMessage, createWelcomeMessage, formatHistoricalMessages
- [refactor DRY] - chat/archives/[id]/page.jsx utilise désormais formatHistoricalMessages
- [refactor DRY] - SidebarCollapsed.jsx et UserProfile.jsx utilisent désormais getRoleColor au lieu de conditions dupliquées
- [refactor DRY] - Suppression de isPageOrange/isPageRed dans pageColors.js (non utilisés)

### 🗑️ Réorganisation
- [refactor] - Déplacement ErrorAlert.jsx de components/auth/ vers components/shared/
- [refactor] - chat/layout.jsx - Initialisation currentPage à 'Broussaud AI' au lieu de 'chat', suppression useEffect redondant

### 📝 Documentation
- [docs] - Mise à jour registry.md avec nouveaux utilitaires

### 🐛 Corrections
- [fix] - chat/page.jsx - Corrected useSearchParams() Suspense boundary by extracting to ChatPageContent component
- [fix] - chat/layout.jsx - Created ConversationsContext to share fetchConversations with children
- [fix] - chat/layout.jsx - Removed useSearchParams dependency, using Context to refresh sidebar after new conversation
- [fix] - chat/page.jsx - Using ConversationsContext to call fetchConversations after new conversation creation
- [fix] - chat/archives/page.jsx - Added Suspense boundary by extracting to ArchivesContent component
- [fix] - chat/archives/[id]/page.jsx - Added Suspense boundary for useParams() hook by extracting to ArchiveConversationContent component
- [frontend] - chat/layout.jsx - Removed Suspense wrapper and React.cloneElement injection (replaced by Context)

### 🔌 Backend Conversations
- [backend] - conversations.py - Nouveaux endpoints non-admin : GET /conversations, GET /conversations/{id}, GET /conversations/archives, GET /conversations/archives/{id}, DELETE /conversations/{id}
- [backend] - conversations.py - Réorganisation de l'ordre des routes pour éviter conflit avec /archives
- [backend] - ia.py - Utilisation du champ title du rag_result comme titre de conversation

### 🎨 Frontend Conversations
- [frontend] - chat/layout.jsx - Nouveau layout commun pour /chat/* avec sidebar gérée
- [frontend] - chat/page.jsx - Refactor avec chargement des messages historiques via /conversations/{id}
- [frontend] - chat/archives/page.jsx - Page liste des archives (grille 1/2 colonnes, recherche, pagination)
- [frontend] - chat/archives/[id]/page.jsx - Page affichage archive en lecture seule
- [frontend] - Sidebar.jsx - Ajout bouton "Mes archives" au-dessus de "Nouvelle conversation"
- [frontend] - NavigationSelector.jsx - Affichage fixe "Broussaud AI" quel que soit le sous-route
- [frontend] - ChatHeader.jsx - Support props title et isArchived
- [frontend] - ConversationList.jsx/ConversationItem.jsx - Adaptation à nouveau format de données

**Apprentissages clés**:
- ✅ Principe DRY (Don't Repeat Yourself)
- ✅ Utilisation de Context API pour le partage d'état
- ✅ Gestion des paramètres URL avec Next.js
- ✅ Refactoring de code existant
- ✅ Gestion des conversations et archives
- ✅ Optimisation des performances React

---

## 09/06/2026 - Semaine 7 (Agent RAG et Skeletons)

### 🤖 Refactoring Agent RAG (Compétences: C1.2, C1.3)

- [backend] - Remplacement `api/app/services/rag.py` par `api/app/services/agent.py` - Refactor complète avec RAGConfig, PromptManager, RAGAgentService, intégration MCP, intercepteur Gemini, FunctionAgent LlamaIndex

### 🎨 Composants Skeleton (Compétences: C1.2)

- [frontend] - Skeleton.jsx - Nouveau composant Skeleton avec AvatarSkeleton, TextSkeleton, StatsCardSkeleton, TableRowSkeleton, ConversationCardSkeleton
- [frontend] - UserProfile.jsx - Ajout prop isLoading pour afficher skeleton profil
- [frontend] - ConversationList.jsx - Ajout prop isLoading pour afficher 3 skeletons d'historique
- [frontend] - Sidebar.jsx - Ajout prop isLoading passé à ConversationList et UserProfile
- [frontend] - SidebarCollapsed.jsx - Ajout prop isLoading pour afficher skeleton avatar
- [frontend] - shared/index.js - Export tous les composants Skeleton
- [frontend] - chat/index.js - Export SidebarCollapsed
- [frontend] - ChatInput.jsx - Ajout texte de prévention au-dessus de l'input
- [frontend] - chat/page.jsx - Gestion isSidebarLoading (isUserLoading \|\| isConversationsLoading) pour skeletons sidebar
- [frontend] - admin/dashboard/page.jsx - Remplacement LoadingIndicator par 4 StatsCardSkeleton
- [frontend] - admin/members/page.jsx - Remplacement LoadingIndicator par skeleton tableau (5 lignes)
- [frontend] - admin/conversations/page.jsx - Remplacement LoadingIndicator par 5 ConversationCardSkeleton

### 🎯 Hooks
- [hooks] - useUserInfo.js - Déstructuration loading pour isSidebarLoading

**Apprentissages clés**:
- ✅ Architecture modulaire des services
- ✅ Intégration MCP (Model Context Protocol)
- ✅ Utilisation de LlamaIndex pour le RAG
- ✅ Gestion des états de chargement
- ✅ Créations de composants Skeleton pour UX
- ✅ Hooks React personnalisés

---

## 08/06/2026 - Semaine 6 (Admin et MCP)

### 🔌 Serveur MCP (Compétences: C1.2, C1.3)

- [feat] - Ajout serveur MCP (mcp/) avec FastMCP
- [feat] - Outils: hello_world, get_stat_by_name, get_stats_count, get_all_stats, get_stats_by_filter

### 📊 Administration (Compétences: C1.2, C2.3)

- [backend] - admin.py - Ajout endpoints CRUD utilisateurs (POST /admin/users, PUT /admin/users/{id}, DELETE /admin/users/{id})
- [backend] - admin.py - Fix import get_password_hash depuis auth.py pour hashage des mots de passe

### 🎨 Frontend Admin
- [frontend] - AdminMembersPage - Ajout SideCanvas pour création/modification utilisateurs
- [frontend] - SideCanvas.jsx - Animation d'apparition glissante depuis la droite (translate-x-full → translate-x-0)
- [frontend] - SideCanvas.jsx - Overlay avec fade synchronisé (opacity-0 → opacity-100)
- [frontend] - UserForm.jsx - Nouveau composant formulaire utilisateur (nom, prénom, mail, mdp, rôle)
- [frontend] - DeleteModal.jsx - Nouveau composant modale de confirmation de suppression
- [frontend] - RoleDropdown.jsx - Nouveau composant dropdown custom pour sélection des rôles (USER/ADMIN)
- [frontend] - UserForm.jsx - Remplacement select natif par RoleDropdown pour choix des rôles
- [frontend] - AdminConversationsPage - Recherche globale + filtres par label/sub_label/tag avec dropdown
- [frontend] - MiniChart.jsx - Nouveau composant ApexCharts pour dashboard
- [frontend] - UserProfile.jsx - Fond rouge-500 pour ADMIN
- [frontend] - MessageList.jsx - Props isAdminView (désactive masque) et userEmail
- [frontend] - Message.jsx - Prop userEmail pour afficher mail au lieu de "Vous"
- [frontend] - admin/conversations/* - Affichage user_mail au lieu de user_id UUID

### 🔍 Backend Admin
- [backend] - admin.py - Ajout user_mail via join, get_timeline_data()
- [backend] - admin.py - GET /admin/ retourne stats + timeline
- [backend] - admin.py - GET /admin/messages pour métadonnées

### 📝 Documentation
- [docs] - Mise à jour architecture.md, registry.md, references.md

**Apprentissages clés**:
- ✅ Développement d'un serveur MCP avec FastMCP
- ✅ Architecture d'un panneau d'administration
- ✅ CRUD complet avec gestion des rôles
- ✅ Composants React avancés (SideCanvas, Modal, Dropdown)
- ✅ Visualisation de données avec ApexCharts
- ✅ Gestion des autorisations par rôle

---

## 05/06/2026 - Semaine 5 (MiniChart et Rôles)

### 📊 Visualisation (Compétences: C1.2, C1.3)

- [frontend] - MiniChart.jsx - Nouveau composant ApexCharts minimaliste pour dashboard admin
- [frontend] - MessageList.jsx - Ajout props `isAdminView` (désactive masque) et `userEmail` (remplace "Vous")
- [frontend] - Message.jsx - Ajout prop `userEmail` pour afficher mail au lieu de "Vous"
- [frontend] - admin/conversations/page.jsx - Affichage user_mail au lieu de user_id UUID
- [frontend] - admin/conversations/[id]/page.jsx - Affichage user_mail, passage isAdminView=true et userEmail à MessageList
- [frontend] - admin/dashboard/page.jsx - Ajout MiniChart pour conversations et messages avec données timeline

### 🔐 Gestion des Rôles (Compétences: C2.3)

- [backend] - admin.py - Ajout `user_mail` via join dans /admin/all-conversations et /admin/conversations/{id}
- [backend] - admin.py - Fonction `get_timeline_data()` pour générer timeline 10 jours
- [backend] - admin.py - GET /admin/ retourne maintenant stats + timeline

### 📝 Documentation
- [docs] - Mise à jour architecture.md, registry.md, references.md

---

## 05/06/2026 - Backend Admin (Compétences: C1.2, C2.3)

### 🔐 Administration Backend
- [backend] - Refactor admin.py - Extraction `verify_admin()` pour éviter duplication vérification rôle ADMIN (4 endpoints)
- [backend] - Refactor conversations.py - Extraction `verify_conversation_owner()` pour éviter duplication vérification propriétaire

### 🎨 Frontend Colors
- [frontend] - Création utils/pageColors.js - Centralisation des couleurs par page (PAGE_COLORS, getPageColor, isPageOrange, isPageRed)
- [frontend] - NavigationSelector.jsx + SidebarCollapsed.jsx - Utilisation de getPageColor() au lieu de conditions dupliquées

### 📝 Documentation
- [docs] - Mise à jour registry.md - Nettoyage doublons, correction middleware.js → proxy.js, ajout utils/pageColors.js
- [frontend] - Renommage ModeSelector.jsx → NavigationSelector.jsx (composant de navigation pure, pas de gestion de mode)
- [frontend] - NavigationSelector - Ajout bouton bleu "Boutique Maison Broussaud" (lien externe https://maisonbroussaud.fr/) avec icône ExternalLink
- [frontend] - NavigationSelector - Bouton "Administration" (rouge) visible uniquement si rôle = ADMIN, redirection vers /admin
- [frontend] - NavigationSelector - Bouton "Broussaud AI" (orange) redirige vers /chat
- [frontend] - NavigationSelector - Corrections couleurs : Broussaud AI=orange, Administration=rouge, Boutique=bleu
- [backend] - Ajout colonne `role` (VARCHAR(50), DEFAULT 'USER') à la table users (supabase_init.py)
- [backend] - auth.py - UserRegister : retrait champ role, rôle forcé à "USER" à l'inscription (sécurité)
- [backend] - auth.py - login/refresh/tokens : incluent rôle dans payload JWT
- [backend] - auth.py - get_current_user : retourne le rôle de l'utilisateur
- [frontend] - useUserInfo.js - Gestion du rôle utilisateur depuis le JWT
- [frontend] - /api/user/route.js - Retourne le rôle dans les infos utilisateur
- [frontend] - Sidebar.jsx + SidebarCollapsed.jsx - Utilisation de currentPage au lieu de selectedMode
- [frontend] - useChat.js - Renommage selectedMode → currentPage
- [frontend] - proxy.js - Ajout protection route /admin (vérification JWT + rôle ADMIN requis)
- [frontend] - admin/page.jsx - Page panneau d'administration (accès réservé aux ADMIN)
- [backend] - admin.py - Route GET /admin/ retourne stats (users_count, conversations_count, messages_count, vectors_count)
- [backend] - admin.py - Route GET /admin/users liste utilisateurs (ADMIN seulement)
- [backend] - router.py - Inclusion du router admin
- [frontend] - Ajout label "Vous" dans la bulle des messages utilisateur (Message.jsx)
- [frontend] - Suppression middleware.js (remplacé par proxy.js dans Next.js 16)
- [frontend] - components/shared/index.js - Export ErrorAlert, LoadingIndicator, Logo
- [frontend] - AdminSidebar.jsx - Sidebar admin avec NavigationSelector + AdminNavigation (vertical) + UserProfile, affiche toujours "Administration" dans NavigationSelector
- [frontend] - AdminNavigation.jsx - Navigation verticale (Dashboard, Membres, Conversations) avec indicateurs actifs
- [frontend] - admin/layout.jsx - Layout admin avec AdminSidebar
- [frontend] - admin/dashboard/page.jsx - Stats (users, conversations, messages, vecteurs)
- [frontend] - admin/members/page.jsx - Liste membres avec pagination
- [frontend] - admin/conversations/page.jsx - Liste toutes les conversations (admin), clic → redirection vers /admin/conversations/[id]
- [frontend] - admin/conversations/[id]/page.jsx - Détail conversation avec MessageList, MessageMeta, Message
- [backend] - admin.py - Route GET /admin/all-conversations (toutes les conversations)
- [backend] - admin.py - Route GET /admin/conversations/{id} (détail conversation)
- [frontend] - Correction scroll automatique vers le bas - suppression div flex-1 poussant les messages, ajout délai setTimeout(50ms) pour scroll après rendu DOM
- [frontend] - `chat/page.jsx` - Ajout des `contexts` dans le formatage des messages historiques pour affichage de l'icône loupe
- [frontend] - Implémentation formatage réponses IA avec `%NL%` (saut de ligne) et `%BOLD%/%ENDBOLD%` (gras) via formatText.js
- [frontend] - Intégration formatResponseText dans Message.jsx pour les réponses IA
- [frontend] - Ajout icône loupe (Search) dans Message.jsx avec tooltip affichant les `contexts` utilisés
- [frontend] - useChat.js - extraction des `contexts` depuis le JSON de l'IA
- [backend] - `api/app/api/routes/ia.py` - POST /embedding conserve `filename` dans les métadonnées des documents et nodes
- [backend] - `api/app/api/routes/ia.py` - POST /ai/chat extrait `contexts` du JSON de l'IA, l'ajoute à la réponse et le sauvegarde en DB
- [backend] - `core/supabase_init.py` - Ajout champ `contexts` (JSONB) à la table messages

**Apprentissages clés**:
- ✅ Extraction et réutilisation de code (DRY)
- ✅ Gestion centralisée des couleurs
- ✅ Implémentation complète d'un système de rôles
- ✅ Protection des routes par autorisation
- ✅ Création de layouts administratifs
- ✅ Développement d'interfaces de gestion

---

## 04/06/2026 - Semaine 4 (Conversations et Soft Delete)

### 💬 Conversations Backend (Compétences: C1.2, C2.2)

- [backend] - Ajout routes conversations (GET /conversations, GET /conversations/{id}, DELETE /conversations/{id})
- [backend] - Soft-delete conversations (is_active flag)
- [backend] - Titre de conversation = premier prompt utilisateur (50 premiers caractères)
- [backend] - Mise à jour schéma DB conversations (ajout title TEXT, is_active BOOLEAN)

### 🎨 Conversations Frontend (Compétences: C1.2, C1.3)

- [frontend] - useConversations hook pour gérer listing/chargement/suppression conversations
- [frontend] - ConversationItem avec highlight neutral-300 pour conversation active
- [frontend] - ConversationItem avec bouton suppression (Trash2 icon, visible au hover)
- [frontend] - ConversationList avec chargement et affichage des conversations utilisateur
- [frontend] - Chat page avec sélection/chargement/suppression conversations
- [frontend] - Animation sidebar (ouverture/fermeture fluide, transition overlay, rotation icône hamburger)
- [frontend] - Implémentation responsive sidebar mobile (SidebarCollapsed.jsx)
- [frontend] - Messages responsive (mobile: pleine largeur centrée / desktop: largeur auto + alignement gauche/droite)
- [frontend] - Overlay sidebar avec fond blanc transparent et bouton fermeture pleine largeur
- [frontend] - Mode non cliquable en version mobile

**Apprentissages clés**:
- ✅ Implémentation de Soft Delete (RGPD compliant)
- ✅ Gestion des conversations avec historique
- ✅ Hooks React personnalisés (useConversations)
- ✅ Design responsive pour mobile
- ✅ Animations CSS fluides
- ✅ Gestion des états UI

---

## 03/06/2026 - Semaine 3 (Composants Chat)

### 🎨 Composants Chat Frontend (Compétences: C1.2)

- [frontend] - Création components chat (Sidebar, Message, MessageList, ChatInput, ChatHeader, UserProfile, ModeSelector)
- [frontend] - Hooks useChat, useUserInfo, useClickOutside
- [frontend] - Service api.js avec interceptors JWT
- [frontend] - Pages login, register, logout, chat
- [frontend] - Layout avec AnimatedBackground

**Apprentissages clés**:
- ✅ Création de composants React réutilisables
- ✅ Gestion d'état avec hooks personnalisés
- ✅ Intercepteurs Axios pour l'authentification
- ✅ Routing Next.js App Router
- ✅ Animations CSS avec canvas

---

## 02/06/2026 - Semaine 2 (Backend de Base)

### 🏗️ Backend Core (Compétences: C1.2, C1.3)

- [backend] - Routes auth (register, login, logout, refresh)
- [backend] - Routes IA (chat, embedding)
- [backend] - Configuration LLM (Google GenAI gemini-3.1-flash-lite)
- [backend] - Supabase client et initialisation DB
- [backend] - Service RAG avec LlamaIndex
- [backend] - Main FastAPI avec CORS et lifespan

**Apprentissages clés**:
- ✅ Configuration FastAPI
- ✅ Intégration Supabase
- ✅ Configuration CORS
- ✅ Développement d'API RESTful
- ✅ Intégration LlamaIndex pour le RAG

---

## 01/06/2026 - Semaine 1 (Initialisation)

### 🏗️ Infrastructure (Compétences: C1.1, C1.4)

- [feat] - Infrastructure : Structure projet (api/ + web/)
- [feat] - Backend : Docker Compose et requirements.txt
- [feat] - Frontend : Next.js 16 avec Tailwind CSS 4

**Apprentissages clés**:
- ✅ Architecture full-stack
- ✅ Configuration Docker
- ✅ Initialisation Next.js 16
- ✅ Configuration Tailwind CSS 4

---

## 📊 Statistiques Global

| Type | Total |
|------|-------|
| **Commits** | 244+ |
| **Fichiers modifiés** | 100+ |
| **Lignes de code ajoutées** | ~15,000+ |
| **Routes API** | 30+ |
| **Composants React** | 40+ |
| **Tables de base de données** | 6+ |
| **Hooks personnalisés** | 5+ |
| **Services backend** | 7+ |

---

## 🎯 Compétences Développées par Phase

### Phase 1: Initialisation (Semaines 1-2)
- **C1.1**: Analyse des besoins et conception de solutions
- **C1.2**: Développement d'applications (Python, FastAPI)
- **C1.3**: Intégration de solutions
- **C1.4**: Administration des systèmes

### Phase 2: Développement Backend (Semaines 3-7)
- **C1.2**: Développement avancé (API, RAG, Authentification)
- **C2.2**: Garantir l'intégrité des données
- **C2.3**: Protéger les données à caractère personnel

### Phase 3: Développement Frontend (Semaines 8-10)
- **C1.2**: Développement d'interfaces utilisateur
- **C1.3**: Intégration frontend-backend

### Phase 4: Finalisation (Semaines 11-15)
- **C1.3**: Intégration et tests
- **C2.1**: Assurer la disponibilité des services
- **C4.1**: Maintenance et évolution

---

## 📚 Ressources Utilisées

### Documentations
- Documentation FastAPI
- Documentation Next.js 16
- Documentation Supabase
- Documentation LlamaIndex
- Documentation Tailwind CSS 4

### Outils
- Visual Studio Code
- Git / GitHub
- Docker Desktop
- Postman
- Supabase Dashboard

### Bibliothèques
- Python: FastAPI, Uvicorn, Supabase, LlamaIndex, PyJWT, Bcrypt, PyOTP
- JavaScript: Next.js, React, Tailwind CSS, Axios, ApexCharts

---

*Changelog maintenu dans le cadre du stage BTS SIO*
*Projet Broussaud AI - Lycée Suzanne Valadon & Entreprise Broussaud*
*© 2026 - Tous droits réservés*