# Feature : Authentification

## Objectif
Permettre aux utilisateurs de s'authentifier, créer un compte, se connecter, se déconnecter et rafraîchir leur session.

## Composants / Fichiers
- [x] `api/app/api/routes/auth.py` (Routes JWT + sessions)
- [x] `web/src/app/login/page.jsx` (Page connexion)
- [x] `web/src/app/register/page.jsx` (Page inscription)
- [x] `web/src/app/logout/page.jsx` (Page déconnexion)
- [x] `web/src/app/actions/auth.js` (Server Actions)
- [x] `web/src/app/api/refresh/route.js` (Refresh token)
- [x] `web/src/app/api/user/route.js` (Infos user)
- [x] `web/src/services/api.js` (Interceptors Axios)
- [x] `web/src/components/auth/` (Formulaire components)

## Dépendances Internes
- [x] `core/supabase_client.py` (Client Supabase)
- [x] `core/supabase_init.py` (Tables users, sessions)

## Routes & API
- `POST /auth/register` : Inscription utilisateur
- `POST /auth/login` : Connexion + tokens
- `POST /auth/logout` : Déconnexion + suppression session
- `POST /auth/refresh` : Nouveau access_token
- `POST /api/refresh` : Frontend refresh (Next.js API Route)
- `GET /api/user` : Infos utilisateur depuis JWT

## Logique Technique
- **Register** : Vérification email unique → Hash bcrypt → Insert Supabase users
- **Login** : Vérification credentials → Création session Supabase → Génération JWT (access + refresh)
- **Logout** : Suppression session Supabase
- **Refresh** : Vérification refresh_token → Nouveau access_token (5 min)
- **Intercepteur Axios** : Détection 401 → Appel auto /api/refresh → Réessai requête
- **Cookies** : access_token (5 min), refresh_token (7 jours)

## État
[x] Terminée
