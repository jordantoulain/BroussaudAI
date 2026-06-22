# Features - Projet Broussaud AI (Stage BTS SIO)

**Projet Pédagogique BTS SIO - Option SLAM**
**Lycée Suzanne Valadon & Entreprise Broussaud**
**Dernière mise à jour**: 22/06/2026

---

## 📚 Introduction

Ce document présente l'ensemble des **fonctionnalités implémentées** dans le cadre du stage BTS SIO à l'entreprise Broussaud. Chaque feature est documentée avec:
- Une description technique et fonctionnelle
- Les chemins des fichiers concernés
- Les composants et fonctions utilisés
- Les compétences BTS SIO mobilisées
- Les apprentissages clés

**Objectif pédagogique**: Illustrer la diversité des compétences acquises et leur application concrète dans un projet professionnel.

---

## 🎯 Analyse par Compétences BTS SIO

| Compétence | Nombre de Features | Pourcentage | Domaines Principaux |
|------------|-------------------|-------------|---------------------|
| **C1.1** (Analyse) | 3 | 12% | Conception, Analyse des besoins |
| **C1.2** (Développement) | 15+ | 60% | Backend, Frontend, Composants |
| **C1.3** (Intégration) | 12+ | 48% | API, Services, Communication |
| **C1.4** (Administration) | 2 | 8% | Déploiement, Configuration |
| **C2.1** (Disponibilité) | 3 | 12% | Fiabilité, Gestion des erreurs |
| **C2.2** (Intégrité) | 8+ | 32% | Validation, Sécurité des données |
| **C2.3** (Protection) | 10+ | 40% | Authentification, RGPD, MFA |
| **C4.1** (Maintenance) | 5+ | 20% | Documentation, Tests, Évolution |

---

## 📋 Liste Complète des Features

### 🔐 Authentification & Sécurité (Compétences: C1.2, C2.2, C2.3)

**Apprentissage**: Implémentation complète d'un système d'authentification sécurisé pour une application professionnelle.

| Feature | Description | Path | Composants/Fonctions utilisés | Compétences | Complexité | Apprentissages |
|---------|-------------|------|--------------------------------|-------------|------------|---------------|
| **Authentification JWT** | Système complet de login, register, logout avec tokens JWT (access: 5min, refresh: 1j). Gestion des sessions sécurisées. | `api/app/api/routes/auth.py`, `web/src/app/actions/auth.js` | `get_current_user`, `create_access_token`, `create_refresh_token`, `get_password_hash`, `verify_password` | C1.2, C2.3 | ⭐⭐⭐⭐ | Authentification moderne, gestion des tokens |
| **Gestion des rôles** | Système USER/ADMIN avec vérification côté backend et frontend. Restriction d'accès basée sur les rôles. | `api/app/api/routes/auth.py`, `web/src/hooks/useUserInfo.js` | `verify_admin()`, `getRoleColor()`, `proxy.js` | C1.2, C2.3 | ⭐⭐⭐ | RBAC (Role-Based Access Control) |
| **TOTP MFA** | Authentification à deux facteurs avec Time-based One-Time Password. Génération de QR codes, vérification des codes, option de contournement. | `api/app/api/routes/mfa.py`, `web/src/app/login/mfa/` | `enroll_mfa`, `verify_mfa`, `skip_mfa_setup`, `get_mfa_status`, `MFAClient.jsx` | C2.3 | ⭐⭐⭐⭐ | Sécurité renforcée, expérience utilisateur |
| **Protection des routes** | Middleware de vérification JWT + rôle pour /admin. Protection côté frontend et backend. | `web/src/proxy.js`, `api/routes/admin.py` | `verify_admin()` | C1.2, C2.3 | ⭐⭐⭐ | Sécurité multi-couches |
| **Soft-delete utilisateurs** | Archivage des comptes utilisateurs avec conformité RGPD. Colonnes is_active, deleted_at, deleted_by. | `api/routes/auth.py`, `core/supabase_init.py` | `delete_user` | C2.2, C2.3 | ⭐⭐ | Conformité légale |
| **Sécurité des uploads** | Validation taille (10MB), extension et MIME type pour les uploads. Protection contre les fichiers malveillants. | `api/routes/ia.py`, `api/routes/admin.py` | Validation Pydantic | C2.2 | ⭐⭐⭐ | Protection des entrées |
| **Sanitization des entrées** | Nettoyage des entrées avec bleach contre XSS. Protection des données utilisateur. | `core/sanitize.py` | `bleach` | C2.2 | ⭐⭐⭐ | Sécurité web |
| **Chiffrement MFA** | Chiffrement Fernet des secrets MFA avant stockage. Protection des données sensibles. | `core/crypto_utils.py` | Fernet | C2.2, C2.3 | ⭐⭐⭐ | Cryptographie appliquée |

---

### 💬 Chat & RAG (Compétences: C1.2, C1.3)

**Apprentissage**: Développement d'un système de chat intelligent avec récupération de contexte (RAG).

| Feature | Description | Path | Composants/Fonctions utilisés | Compétences | Complexité | Apprentissages |
|---------|-------------|------|--------------------------------|-------------|------------|---------------|
| **Chat RAG** | Discussion avec IA spécialisée sur l'usine textile Broussaud, classification automatique des réponses. | `api/app/services/agent_orchestrator.py`, `api/app/services/rag_service.py`, `web/src/app/chat/page.jsx` | `RAGAgentService`, `chat_with_agent`, `format_source_nodes`, `useChat.js` | C1.2, C1.3 | ⭐⭐⭐⭐⭐ | IA conversationnelle, RAG |
| **Historique des conversations** | Sauvegarde et chargement des messages historiques. Gestion des conversations par utilisateur. | `api/app/api/routes/conversations.py`, `web/src/app/chat/page.jsx` | `useConversations.js`, `ConversationList.jsx`, `ConversationItem.jsx` | C1.2, C1.3 | ⭐⭐⭐ | Persistance des données |
| **Classification automatique** | Labels, sous-labels et tags générés par l'IA pour chaque réponse. Classification automatique du contenu. | `api/app/services/utils.py`, `api/app/services/agent_orchestrator.py`, `web/src/components/chat/Message.jsx` | `extract_json_from_response`, `TagBadge.jsx` | C1.2, C1.3 | ⭐⭐⭐⭐ | Traitement du langage naturel |
| **Affichage des contexts** | Visualisation des sources RAG utilisées pour les réponses. Tooltip avec détails des contexts. | `web/src/components/chat/Message.jsx` | `formatText.js`, icône Search (loupe) | C1.2 | ⭐⭐ | Transparence IA |
| **Formatage riche** | Support de `%NL%` (sauts de ligne) et `%BOLD%/%ENDBOLD%` (gras) dans les réponses IA. | `web/src/utils/formatText.js` | `formatResponseText()` | C1.2 | ⭐⭐ | Formatage personnalisé |
| **Statistiques IA** | Suivi des métriques IA (tokens utilisés, temps de réponse, avis). Table stats_ia pour le monitoring. | `api/app/api/routes/ia.py`, `api/app/api/routes/reviews.py`, `api/app/api/routes/admin.py` | `update_stats_ia`, `update_review_stats_ia` | C1.2, C1.3 | ⭐⭐⭐ | Analytics et monitoring |
| **Résumé de conversation** | Génération automatique de résumés structurés (sujet, points clés, décisions, actions). | `api/app/services/rag_service.py` | `get_summary_tool` | C1.2 | ⭐⭐⭐⭐ | Traitement automatique du contenu |

---

### 📁 Gestion des Documents (Compétences: C1.2, C1.3)

**Apprentissage**: Upload, indexation et gestion de documents multi-formats pour le RAG.

| Feature | Description | Path | Composants/Fonctions utilisés | Compétences | Complexité | Apprentissages |
|---------|-------------|------|--------------------------------|-------------|------------|---------------|
| **Upload multi-formats** | Upload de documents PDF, TXT, JSON, CSV, XLSX, Markdown. Traitement adapté à chaque format. | `api/app/api/routes/ia.py`, `web/src/app/admin/documents/page.jsx` | `PDFReader`, `PandasReader`, `DocumentUploadForm.jsx` | C1.2, C1.3 | ⭐⭐⭐⭐ | Gestion de fichiers multi-formats |
| **Indexation vectorielle** | Stockage des embeddings dans Supabase Vector Store (documents_gemini). Recherche vectorielle rapide. | `api/app/services/rag_service.py` | `SupabaseVectorStore`, `VectorStoreIndex` | C1.2, C1.3 | ⭐⭐⭐⭐ | Vector Store, embeddings |
| **Vérification des doublons** | Empêcher l'upload de documents déjà indexés via metadata.filename. | `api/app/api/routes/ia.py` | Vérification Supabase | C1.2 | ⭐⭐ | Optimisation du stockage |
| **Gestion des embeddings** | Liste et suppression des documents indexés. Interface d'administration complète. | `api/app/api/routes/admin.py` | `list_documents`, `delete_document` | C1.2 | ⭐⭐⭐ | CRUD complet |
| **Génération PDF** | Export des conversations au format PDF. Upload dans Supabase Storage. | `api/app/services/pdf_generator.py`, `api/app/services/agent.py` | `PDFGenerator`, `generate_conversation_pdf_link`, `upload_to_supabase_storage` | C1.2 | ⭐⭐⭐ | Génération de documents |

---

### 📊 Administration (Compétences: C1.2, C1.3, C2.3)

**Apprentissage**: Développement d'un panneau d'administration sécurisé et complet.

| Feature | Description | Path | Composants/Fonctions utilisés | Compétences | Complexité | Apprentissages |
|---------|-------------|------|--------------------------------|-------------|------------|---------------|
| **Dashboard Admin** | Statistiques complètes (utilisateurs, conversations, messages, vecteurs) avec timeline sur 10 jours. | `api/app/api/routes/admin.py`, `web/src/app/admin/dashboard/page.jsx` | `admin_dashboard`, `get_timeline_data`, `MiniChart.jsx` | C1.2, C1.3 | ⭐⭐⭐⭐ | Visualisation de données, analytics |
| **CRUD Utilisateurs** | Création, lecture, mise à jour, suppression des utilisateurs. Gestion complète des comptes. | `api/app/api/routes/admin.py`, `web/src/app/admin/members/page.jsx` | `list_users`, `create_user`, `update_user`, `delete_user`, `UserForm.jsx`, `SideCanvas.jsx`, `DeleteModal.jsx` | C1.2, C2.3 | ⭐⭐⭐⭐ | Gestion des utilisateurs |
| **Gestion des rôles** | Sélection des rôles via dropdown custom (USER/ADMIN). Restriction des accès. | `web/src/components/admin/RoleDropdown.jsx` | - | C1.2, C2.3 | ⭐⭐⭐ | UI de gestion des permissions |
| **Liste des conversations** | Vue de toutes les conversations avec filtres (label, sub_label, tag). Recherche globale. | `web/src/app/admin/conversations/page.jsx` | `AdminNavigation.jsx`, recherche + filtres | C1.2 | ⭐⭐⭐ | Filtrage et recherche |
| **Détail des conversations** | Affichage complet des conversations avec user_mail et messages. Vue admin spécialisée. | `web/src/app/admin/conversations/[id]/page.jsx` | `MessageList.jsx` (isAdminView=true, userEmail) | C1.2 | ⭐⭐⭐ | Visualisation des données |
| **Audit de sécurité** | Correction de 10+ vulnérabilités identifiées. Protection contre XSS, Brute Force, etc. | `api/app/...` (multiples fichiers) | Security headers, rate limiting, validation | C2.1, C2.2, C2.3 | ⭐⭐⭐⭐ | Sécurité avancée |

---

### 🗂️ Gestion des Conversations (Compétences: C1.2, C1.3, C2.2)

**Apprentissage**: Implémentation complète d'un système de gestion des conversations utilisateur.

| Feature | Description | Path | Composants/Fonctions utilisés | Compétences | Complexité | Apprentissages |
|---------|-------------|------|--------------------------------|-------------|------------|---------------|
| **CRUD Conversations** | Création, liste, chargement, suppression (soft-delete) des conversations utilisateur. | `api/app/api/routes/conversations.py`, `web/src/app/chat/` | `useConversations.js`, `ConversationItem.jsx` | C1.2, C2.2 | ⭐⭐⭐ | Gestion du cycle de vie |
| **Soft Delete** | Archivage via champ `is_active`. Réversibilité possible. Conformité RGPD. | `api/app/api/routes/conversations.py` | - | C2.2 | ⭐⭐ | Gestion des données |
| **Épinglage conversations** | Toggle pin via bouton, affichage section "Épinglées" au-dessus de "Historique". Persistance en base de données. | `api/app/api/routes/conversations.py`, `web/src/components/chat/ConversationItem.jsx` | `Pin` icône, `pinned` champ DB, `PATCH /conversations/{id}/pin` | C1.2 | ⭐⭐⭐ | UX améliorée |
| **Titre automatique** | Premier prompt utilisateur comme titre de conversation. Extraction depuis rag_result.title. | `api/app/api/routes/ia.py` | Extraction du titre | C1.2 | ⭐⭐ | Expérience utilisateur |
| **Pages d'archives** | Liste et détail des conversations archivées (lecture seule). Grille responsive avec recherche et pagination. | `web/src/app/chat/archives/` | `ConversationList.jsx`, `ChatHeader.jsx` (isArchived) | C1.2, C1.3 | ⭐⭐⭐ | Gestion des archives |

---

### 🎨 Interface Utilisateur (Compétences: C1.2, C1.3)

**Apprentissage**: Développement d'une interface utilisateur moderne, responsive et intuitive.

| Feature | Description | Path | Composants/Fonctions utilisés | Compétences | Complexité | Apprentissages |
|---------|-------------|------|--------------------------------|-------------|------------|---------------|
| **Animated Background** | Fond animé avec canvas (CPU→GPU optimisé). Animation fluide sans impact sur les performances. | `web/src/components/layout/AnimatedBackground.jsx` | - | C1.2 | ⭐⭐⭐⭐ | Optimisation des performances |
| **Sidebar Responsive** | Navigation latérale avec animation fluide. Overlay mobile, gestion des états. | `web/src/components/chat/Sidebar.jsx`, `web/src/components/chat/SidebarCollapsed.jsx` | `NavigationSelector.jsx`, `UserProfile.jsx`, `NewConversationButton.jsx` | C1.2, C1.3 | ⭐⭐⭐⭐ | Design responsive |
| **Navigation** | Sélecteur de page avec gestion des rôles. Navigation cohérente sur toute l'application. | `web/src/components/chat/NavigationSelector.jsx` | `getPageColor()`, `pageColors.js` | C1.2 | ⭐⭐⭐ | UX cohérente |
| **Animations** | Transitions fluides pour sidebar, overlays, icônes. Animations CSS modernes. | Tous les composants | `transition-all`, `duration-300`, `ease-in-out` | C1.2 | ⭐⭐ | Expérience utilisateur |
| **Skeletons** | Indicateurs de chargement animés. Composants Skeleton pour toutes les situations. | `web/src/components/shared/Skeleton.jsx` | `AvatarSkeleton`, `TextSkeleton`, `StatsCardSkeleton`, `TableRowSkeleton`, `ConversationCardSkeleton` | C1.2 | ⭐⭐⭐ | UX améliorée |
| **Notifications** | Alertes réutilisables pour erreurs et succès. Feedback visuel clair. | `web/src/components/shared/ActionAlert.jsx` | `ActionError`, `ActionSuccess` | C1.2 | ⭐⭐ | Feedback utilisateur |
| **Thème couleur** | Gestion centralisée des couleurs par page. Cohérence visuelle garantie. | `web/src/utils/pageColors.js` | `PAGE_COLORS`, `getPageColor()` | C1.2 | ⭐⭐ | Design system |
| **Responsive Design** | Adaptation pour mobile (< 768px), tablette, desktop. Mobile-first approach. | Tous les composants | Breakpoints `md:`, `lg:`, `xl:` | C1.2, C1.3 | ⭐⭐⭐⭐ | Développement mobile |

---

### 🔌 Serveur MCP (Compétences: C1.2, C1.3)

**Apprentissage**: Intégration avec Model Context Protocol pour l'accès aux données de production.

| Feature | Description | Path | Composants/Fonctions utilisés | Compétences | Complexité | Apprentissages |
|---------|-------------|------|--------------------------------|-------------|------------|---------------|
| **Serveur FastMCP** | Interface MCP pour accès aux statistiques de production. Architecture modulaire. | `mcp/app/server.py` | `FastMCP`, `uvicorn` | C1.2, C1.3 | ⭐⭐⭐ | MCP moderne |
| **Outils de statistiques** | Accès à la table stats de Supabase. 9 outils dédiés aux statistiques de production textile. | `mcp/app/tools/` | `hello_world`, `get_stat_by_name`, `get_stats_count`, `get_all_stats`, `get_stats_by_filter` | C1.2 | ⭐⭐⭐ | Intégration de données |
| **Client Supabase MCP** | Connexion dédiée pour le serveur MCP. Séparation des responsabilités. | `mcp/app/core/supabase_client.py` | - | C1.3 | ⭐⭐ | Architecture propre |

---

### 📱 Responsive Design (Compétences: C1.2, C1.3)

**Apprentissage**: Adaptation de l'interface pour tous les types de devices.

| Feature | Description | Path | Composants/Fonctions utilisés | Compétences | Complexité | Apprentissages |
|---------|-------------|------|--------------------------------|-------------|------------|---------------|
| **Mobile First** | Adaptation pour mobile (< 768px) en priorité. Progressive enhancement. | Tous les composants | Breakpoints `md:`, `lg:`, `xl:` | C1.2, C1.3 | ⭐⭐⭐ | Méthodologie moderne |
| **Sidebar Mobile** | Overlay avec bouton fermeture pleine largeur. Animation fluide. | `web/src/components/chat/Sidebar.jsx` | `fixed inset-0`, `bg-white/50`, `backdrop-blur-xs` | C1.3 | ⭐⭐⭐ | UX mobile |
| **Messages Responsive** | Pleine largeur sur mobile, alignement sur desktop. Adaptation dynamique. | `web/src/components/chat/Message.jsx` | `w-full mx-auto` (mobile), `w-fit max-w-[85%]` (desktop) | C1.3 | ⭐⭐⭐ | Layout adaptatif |

---

## 🏷️ Catégorisation par Domaine

### Backend (FastAPI + Python)
- ✅ Authentification JWT avec rôles
- ✅ RAG avec LlamaIndex + Google GenAI
- ✅ CRUD Conversations
- ✅ CRUD Utilisateurs (Admin)
- ✅ Gestion des documents (embedding)
- ✅ Serveur MCP (FastMCP)
- ✅ Logger Phoenix (debug)
- ✅ Système MFA (TOTP)
- ✅ Audit de sécurité complet

### Frontend (Next.js 16 + React)
- ✅ Interface chat complète
- ✅ Panneau d'administration
- ✅ Gestion des archives
- ✅ Responsive design complet
- ✅ Animations fluides
- ✅ Système de notifications
- ✅ Composants réutilisables (40+)

### Base de Données (Supabase)
- ✅ Table users (avec rôle, soft-delete)
- ✅ Table conversations (avec is_active, title, **pinned**)
- ✅ Table messages (avec contexts JSONB)
- ✅ Table sessions
- ✅ Table mfa_secrets (pour TOTP MFA)
- ✅ Vector Store: vecs.documents_gemini (3072 dimensions)
- ✅ Table stats_ia (pour le suivi des métriques)
- ✅ Table reviews (pour les avis utilisateurs)

### Sécurité
- ✅ Authentification JWT sécurisée (HS256)
- ✅ Authentification à deux facteurs (MFA TOTP)
- ✅ Protection contre les injections (SQL via Pydantic, XSS via bleach)
- ✅ Validation des entrées utilisateur
- ✅ Gestion des erreurs et logging
- ✅ Audit de sécurité complet
- ✅ Chiffrement des secrets (Fernet)
- ✅ Soft-delete pour la conformité RGPD

---

## 🎯 Roadmap des Features (Post-Stage)

### ✅ Implémentées (100% des objectifs initiaux)
- [x] Authentification complète avec MFA TOTP
- [x] Chat RAG avec classification automatique
- [x] Panneau d'administration sécurisé
- [x] Gestion des conversations (CRUD + archives)
- [x] Gestion des documents (upload multi-formats)
- [x] Serveur MCP avec outils statistiques
- [x] Responsive design complet
- [x] Animations fluides
- [x] Système de notifications réutilisables
- [x] Audit de sécurité complet
- [x] Documentation technique complète

### 🚧 En développement (Améliorations possibles)
- [ ] **Rate limiting** - Protection contre les attaques par brute force (partiellement implémenté)
- [ ] **Tests unitaires** - Tests backend et frontend (0% de couverture actuelle, objectif: 80%)
- [ ] **CSRF protection** - Protection contre les attaques CSRF
- [ ] **Déploiement en production** - Mise en ligne complète de l'application
- [ ] **Monitoring** - Suivi des performances en production

### 💡 Backlog (Fonctionnalités avancées)
- [ ] **Recherche avancée** - Recherche vectorielle améliorée
- [ ] **Support de plus de formats** - DOCX, PPTX, etc.
- [ ] **Internationalisation** - Support multilingue
- [ ] **Notifications push** - Notifications en temps réel
- [ ] **Chat vocal** - Intégration speech-to-text
- [ ] **Export avancé** - Export des données en différents formats
- [ ] **Collaboration en temps réel** - Chat collaboratif

---

## 📊 Statistiques

- **Total Features**: 35+ features documentées
- **Backend Routes**: 30+ endpoints API
- **Frontend Pages**: 15+ pages et layouts
- **Composants Réutilisables**: 40+ composants
- **Hooks**: 5+ hooks personnalisés
- **Services**: 7+ services backend
- **Tables de Base de Données**: 8+ tables principales
- **Outils MCP**: 9+ outils de statistiques
- **Tests**: 0% (à améliorer - objectif: 80%)

---

## 🎓 Bilan Pédagogique

### Compétences Développées par Feature

| Feature | C1.1 | C1.2 | C1.3 | C1.4 | C2.1 | C2.2 | C2.3 | C4.1 |
|---------|------|------|------|------|------|------|------|------|
| Authentification & Sécurité | - | ✅✅✅ | ✅ | - | - | ✅✅✅ | ✅✅✅ | - |
| Chat & RAG | ✅ | ✅✅✅✅ | ✅✅✅ | - | - | ✅✅ | ✅ | - |
| Gestion des Documents | - | ✅✅✅✅ | ✅✅✅ | - | - | ✅✅ | ✅ | - |
| Administration | - | ✅✅✅ | ✅✅✅ | - | ✅ | ✅✅ | ✅✅✅ | - |
| Gestion des Conversations | - | ✅✅ | ✅✅✅ | - | - | ✅✅ | ✅ | - |
| Interface Utilisateur | - | ✅✅✅✅ | ✅✅✅✅ | - | ✅ | ✅ | ✅ | - |
| Serveur MCP | - | ✅✅ | ✅✅ | - | - | ✅ | ✅ | - |
| Responsive Design | - | ✅✅ | ✅✅✅ | - | - | - | - | - |

**Légende**: ✅ = Compétence mobilisée, Nombre d'étoiles = Niveau de complexité/maîtrise

---

## 📚 Conclusion

Ce projet pédagogique a permis de développer **35+ features complètes** couvrant l'ensemble des compétences du référentiel BTS SIO option SLAM. Chaque feature a été conçue, implémentée et documentée selon les bonnes pratiques professionnelles.

**Points forts**:
- ✅ Application full-stack moderne et complète
- ✅ Architecture scalable et maintenable
- ✅ Système d'authentification sécurisé avec MFA
- ✅ Chat IA intelligent avec RAG
- ✅ Interface utilisateur responsive et intuitive
- ✅ Documentation technique complète
- ✅ Respect des contraintes professionnelles

---

*Documentation Features maintenue dans le cadre du stage BTS SIO*
*Projet Broussaud AI - Lycée Suzanne Valadon & Entreprise Broussaud*
*© 2026 - Tous droits réservés*