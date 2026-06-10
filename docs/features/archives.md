# Feature: Gestion des archives

## Objectif
Permettre aux utilisateurs de consulter leurs conversations supprimées (archivées) en lecture seule, avec même interface que la liste des conversations actives.

## Composants modifiés
- [x] `api/app/api/routes/conversations.py` - Endpoints backend pour archives
- [x] `web/src/app/chat/layout.jsx` - Layout commun pour toutes les pages chat
- [x] `web/src/app/chat/page.jsx` - Page principale du chat
- [x] `web/src/app/chat/archives/page.jsx` - Liste des conversations archivées
- [x] `web/src/app/chat/archives/[id]/page.jsx` - Affichage d'une archive
- [x] `web/src/components/chat/Sidebar.jsx` - Bouton "Mes archives"
- [x] `web/src/components/chat/NavigationSelector.jsx` - Navigation fixe
- [x] `web/src/components/chat/ChatHeader.jsx` - Support titre et icône archive

## Dépendances (Registry)
- [x] Composant Layout partagé (`web/src/app/chat/layout.jsx`)
- [x] Composant Sidebar (`web/src/components/chat/Sidebar.jsx`)
- [x] Composant ConversationList (`web/src/components/chat/ConversationList.jsx`)
- [x] Composant ConversationCardSkeleton (`web/src/components/shared`)
- [x] Hook useUserInfo (`web/src/hooks/useUserInfo.js`)

## Routes/API
- `GET /conversations` - Liste des conversations actives de l'utilisateur
- `GET /conversations/{id}` - Détails d'une conversation active
- `GET /conversations/archives` - Liste des conversations archivées
- `GET /conversations/archives/{id}` - Détails d'une conversation archivée
- `DELETE /conversations/{id}` - Soft delete d'une conversation

## Logique technique
- **Soft Delete** : Utilisation du champ `is_active` (booléen) au lieu de `deleted_at`
- **Ordre des routes** : `/archives` et `/archives/{id}` définis AVANT `/{id}` pour éviter les conflits de matching
- **Synchronisation** : Le layout gère la sidebar et fetch les conversations actives
- **Chargement historique** : La page chat charge les messages historiques via `/conversations/{id}` quand `conversationId` change
- **Lecture seule** : Les archives sont affichées sans possibilité de suppression ou d'envoi de messages
- **Affichage** : Grille responsive (1 colonne mobile, 2 colonnes desktop) avec pagination et recherche

## État
- [x] À faire
- [x] En cours
- [x] Terminée
