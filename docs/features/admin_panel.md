# Feature: Admin Panel
## Objectif : Fournir une interface d'administration sécurisée avec gestion des rôles et accès restreint aux utilisateurs ADMIN
## Composants modifiés : 
- [x] `api/app/core/supabase_init.py` (Ajout colonne rôle)
- [x] `api/app/api/routes/auth.py` (Inclusion rôle dans tokens JWT, rôle forcé à USER à l'inscription)
- [x] `api/app/api/routes/admin.py` (Routes admin : stats, users, conversations, conversations/{id})
- [x] `api/app/api/router.py` (Inclusion router admin)
- [x] `web/src/app/admin/layout.jsx` (Layout admin avec AdminSidebar)
- [x] `web/src/app/admin/page.jsx` (Redirection vers /admin/dashboard)
- [x] `web/src/app/admin/dashboard/page.jsx` (Stats admin)
- [x] `web/src/app/admin/members/page.jsx` (Liste membres avec pagination)
- [x] `web/src/app/admin/conversations/page.jsx` (Liste TOUTES conversations, redirection vers [id])
- [x] `web/src/app/admin/conversations/[id]/page.jsx` (Détail conversation avec MessageList)
- [x] `web/src/proxy.js` (Protection route /admin)
- [x] `web/src/app/api/user/route.js` (Retourne rôle)
- [x] `web/src/hooks/useUserInfo.js` (Gestion rôle)
- [x] `web/src/components/chat/NavigationSelector.jsx` (Navigation + Boutique Maison Broussaud, couleurs corrigées)
- [x] `web/src/components/chat/Sidebar.jsx` (Utilisation NavigationSelector + currentPage)
- [x] `web/src/components/chat/SidebarCollapsed.jsx` (Utilisation currentPage)
- [x] `web/src/components/admin/AdminSidebar.jsx` (Sidebar admin, affiche "Administration" dans NavigationSelector)
- [x] `web/src/components/admin/AdminNavigation.jsx` (Navigation verticale admin)
- [x] `web/src/components/chat/LoadingIndicator.jsx` (Chargement)
- [x] `web/src/components/shared/index.js` (Exports centralisés)
- [x] `web/src/hooks/useChat.js` (Renommage selectedMode → currentPage)

## Dépendances (Registry) : 
- [x] `api/routes/admin.py` (admin_dashboard, list_users, all_conversations, get_conversation_admin)
- [x] `api/routes/auth.py` (get_current_user avec rôle)
- [x] `components/chat/NavigationSelector.jsx` (Dropdown navigation avec gestion rôle)
- [x] `components/admin/AdminSidebar.jsx` (Sidebar admin)
- [x] `components/admin/AdminNavigation.jsx` (Navigation verticale)
- [x] `proxy.js` (Protection côté frontend)
- [x] useUserInfo hook

## Routes/API : 
- `GET /admin/` (Backend) - Dashboard admin avec stats (users_count, conversations_count, messages_count, vectors_count)
- `GET /admin/users` (Backend) - Liste utilisateurs
- `GET /admin/conversations` (Backend) - Liste TOUTES les conversations
- `GET /admin/conversations/{id}` (Backend) - Détail conversation + messages
- `GET /admin/dashboard` (Frontend) - Stats admin
- `GET /admin/members` (Frontend) - Liste membres avec pagination
- `GET /admin/conversations` (Frontend) - Liste toutes conversations, redirection vers [id]
- `GET /admin/conversations/{id}` (Frontend) - Détail conversation avec MessageList

## Logique technique : 
- Ajout colonne `role` (VARCHAR(50), DEFAULT 'USER') à la table users
- Tokens JWT contiennent le rôle de l'utilisateur
- Backend vérifie rôle ADMIN pour les endpoints /admin/*
- proxy.js redirige vers /chat si rôle != ADMIN
- NavigationSelector remplace ModeSelector : composant de navigation pure
- Bouton "Boutique Maison Broussaud" (bleu) toujours visible, lien externe vers https://maisonbroussaud.fr/
- Bouton "Administration" (rouge) visible uniquement si rôle = ADMIN
- **Sécurité** : Rôle forcé à "USER" à l'inscription (pas de paramètre role dans UserRegister)
- AdminSidebar : Sidebar dédiée avec NavigationSelector (affiche toujours "Administration") + AdminNavigation (vertical) + UserProfile
- AdminNavigation : Navigation verticale entre Dashboard/Membres/Conversations
- Conversations admin : affiche TOUTES les conversations (pas seulement celles de l'utilisateur)
- Clic sur conversation → redirection vers /admin/conversations/[id] (page de détail)
- Page détail conversation : utilise MessageList, MessageMeta, Message pour affichage cohérent
- Pagination côté client sur les listes membres et conversations
- Composants partagés : ErrorAlert, LoadingIndicator déplacés dans components/shared/

## État : [x] Terminée
