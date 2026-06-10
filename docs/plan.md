# Plan - Local Chatbot Broussaud

## Roadmap

### Features

| Statut | Priorité | Feature | Description |
|--------|----------|---------|-------------|
| ✅ | Haute | Authentification | Login, Register, Logout, Refresh Token |
| ✅ | Haute | Chat RAG | Chat avec IA, classification automatique |
| ✅ | Haute | Responsive Design | Sidebar mobile, messages pleine largeur |
| ✅ | Moyenne | Gestion conversations | CRUD conversations, historique |
| ✅ | Moyenne | Admin Panel | Interface administration avec protection par rôle |

### Tâches Techniques

| Statut | Priorité | Tâche | Description |
|--------|----------|-------|-------------|
| ✅ | Haute | Architecture backend | FastAPI + Supabase |
| ✅ | Haute | Architecture frontend | Next.js 16 + Tailwind 4 |
| ✅ | Moyenne | Refactoring responsive | Sidebar mobile, overlay |
| ✅ | Moyenne | Serveur MCP | FastMCP + Supabase (tools: stats, hello_world) |
| ✅ | Moyenne | Gestion archives | Fonctionnalités d'archivage des conversations utilisateur |
| ⬜ | Moyenne | Sécurité | Rate limiting, CSRF protection |
| ⬜ | Basse | Tests | Tests unitaires et d'intégration |

### To Do
- Ajouter rate limiting
- Tests frontend et backend

### In Progress


### Done
- Authentification complète avec système de rôles (USER/ADMIN)
- Implémenter CRUD conversations
- Chat RAG fonctionnel
- Responsive sidebar mobile
- Panneau admin avec Dashboard (stats), Membres (pagination), Conversations (pagination)
- Dashboard admin avec MiniChart pour conversations et messages
- Affichage user_mail au lieu de user_id dans les vues admin
- Rôle ADMIN visible via fond rouge dans UserProfile
- Désactivation du masque et affichage userEmail dans MessageList/Message pour les vues admin
- CRUD Membres complet avec SideCanvas (création/modification) et DeleteModal (suppression)
- Dropdown custom (RoleDropdown) pour la sélection des rôles
- Animation glissante du SideCanvas depuis la droite
- Correction import get_password_hash dans admin.py
- Serveur MCP (mcp/) avec FastMCP: hello_world, get_stat_by_name, get_stats_count, get_all_stats, get_stats_by_filter
- Endpoints conversations utilisateur non-admin (GET /conversations, GET /conversations/{id}, GET /conversations/archives, GET /conversations/archives/{id}, DELETE /conversations/{id})
- Layout chat commun avec sidebar persistante
- Pages archives : liste (grille) et détail (lecture seule)
- Navigation fixe "Broussaud AI" dans NavigationSelector
- Utilisation du titre RAG comme titre de conversation
