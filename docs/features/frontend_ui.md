# Feature : Interface Utilisateur Frontend

## Objectif
Fournir une interface moderne, réactive et intuitive pour le chatbot Broussaud avec authentification, chat avec IA, et gestion de profil.

## Composants / Fichiers
- [x] `web/src/app/layout.js` (Layout racine + AnimatedBackground)
- [x] `web/src/app/page.js` (Redirection intelligente)
- [x] `web/src/app/globals.css` (Styles globaux Tailwind)
- [x] `web/src/components/layout/AnimatedBackground.jsx` (Fond animé)

## Dépendances Internes
- [x] `web/src/services/api` (Service Axios + interceptors)
- [x] `web/src/app/actions/auth` (Server Actions)
- [x] `lucide-react` (Icônes)

## Routes & API
- `/` : Redirection `/chat` ou `/login`
- `/login` : Connexion
- `/register` : Inscription
- `/chat` : Interface chat
- `/logout` : Déconnexion

## Logique Technique

### Structure Layout
- RootLayout → AnimatedBackground (canvas) + main (bg-neutral-100/50)
- AnimatedBackground : Grille 30x30px, 8 patterns aléatoires, effets survol

### Redirection
- Vérification cookies (access_token ou refresh_token)
- Redirection `/chat` si authentifié, sinon `/login`

### Responsive Design

#### Sidebar Mobile (< 768px)
- Collapsée par défaut → 3 carrés (Mode, Menu, User)
- **Overlay** : Fond blanc transparent (`bg-white/50`), bouton fermeture pleine largeur

#### Messages
- **Mobile (< 768px)** :
  - Largeur : pleine largeur (`w-full`)
  - Alignement : centré (`mx-auto`)
  - Gap : `mb-2` entre messages
- **Desktop (>= 768px)** :
  - Largeur : auto en fonction du texte (`w-fit`)
  - Max largeur : `max-w-[85%]`
  - Alignement : droite (`self-end`) pour user, gauche (`self-start`) pour IA

#### Main Content
- Padding latéral : `px-4 md:px-20`

## Style et Design System

### Couleurs (Tailwind)
- Orange 400/500, Violet 500, Bleu 500 (Primaires)
- Neutres 100, 200, 300, 700, 800

### Typographie
- Police : Geist (Next.js default)
- Tailles : text-sm (14px), text-base (16px)
- Poids : font-light, font-normal, font-medium, font-bold

### Espacement
- Padding : p-4, p-6, py-2, px-3
- Marges : m-4, mt-6, mb-3
- Gaps : gap-2, gap-3.5, gap-4

### Bordures
- Rayon : rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)

### Animations
- Transitions : transition-colors, transition-all
- Effets : hover:bg-*, focus:ring-*

## État
[x] Terminée
