# UI/UX - Local Chatbot Broussaud

---

## Theme & Couleurs

### Theme Principal
- **Theme**: Light theme uniquement
- **Fond**: Utiliser la palette `neutral` de 100 à 400
  - `bg-neutral-100`: Fond principal des pages
  - `bg-neutral-200`: Fond secondaire
  - `bg-neutral-300`: Survol, états actifs
  - `bg-neutral-400`: Bordures visuelles (remplace les vraies bordures)

### Couleurs d'accentuation
- **Niveau**: 500 pour toutes les couleurs d'accent
- **Texte**: Blanc (`text-white`) sur les fonds colorés
- **Couleurs primaires**:
  - Orange: `orange-500` (Broussaud AI)
  - Violet: `violet-500` (USER)
  - Rouge: `red-500` (ADMIN)
  - Bleu: `blue-500` (Boutique, liens)

### Exemples d'utilisation
| Elément | Classe | Description |
|---------|--------|-------------|
| Bouton Broussaud AI | `bg-orange-500 text-white` | Bouton principal |
| Bouton Administration | `bg-red-500 text-white` | Accès admin |
| Bouton Boutique | `bg-blue-500 text-white` | Lien externe |
| Profil USER | `bg-violet-500 text-white` | Indicateur de rôle |
| Profil ADMIN | `bg-red-500 text-white` | Indicateur de rôle |

---

## Typographie

| Propriété | Valeur | Classe Tailwind |
|-----------|--------|-----------------|
| Police | Geist (default Next.js) | - |
| Taille base | 16px | `text-base` |
| Taille petite | 14px | `text-sm` |
| Poids léger | - | `font-light` |
| Poids normal | - | `font-normal` |
| Poids moyen | - | `font-medium` |
| Poids gras | - | `font-bold` |

---

## Espacements

### Padding
| Usage | Classe |
|-------|--------|
| Conteneurs principaux | `p-4`, `p-6` |
| Eléments compacts | `p-2`, `py-2`, `px-3` |
| Large | `p-8` |

### Marges
| Usage | Classe |
|-------|--------|
| Espacement vertical | `m-4`, `mt-6`, `mb-3` |
| Espacement horizontal | `mx-auto` |
| Gaps | `gap-2`, `gap-3.5`, `gap-4` |

### Largeurs
| Usage | Classe |
|-------|--------|
| Sidebar | `w-64` (ouvert), `w-12` (collapsed) |
| Messages desktop | `max-w-[85%]` |
| Messages mobile | `w-full` |
| Padding latéral | `px-4 md:px-20` |

---

## Bordures et Ombres

### ⚠️ RESTRICTION CRITIQUE
**Les classes `border-*` et `shadow-*` sont STRICTEMENT INTERDITES** sauf demande explicite.

### Alternatives aux bordures
Utiliser des fonds contrastés pour créer des séparations visuelles:
- `bg-neutral-200` pour séparer des sections
- `bg-neutral-300` pour les états de survol
- `bg-neutral-100/50` pour les overlays

---

## Animations & Transitions

### Transitions
| Usage | Classe |
|-------|--------|
| Changement de couleur | `transition-colors` |
| Toutes propriétés | `transition-all` |
| Durée | `duration-300` |
| Easing | `ease-in-out` |

### Animations
| Usage | Classe |
|-------|--------|
| Opacité | `animate-fade-in`, `animate-fade-out` |
| Pulse (skeletons) | `animate-pulse` |
| Rotation | `group-hover:rotate-90` |
| Translation | `translate-x-full`, `translate-x-0` |

### Exemples
```jsx
// Sidebar animation
<aside className="transition-all duration-300 ease-in-out w-64">

// Icône hamburger rotation
<div className="group-hover:rotate-90 transition-transform duration-200">

// Overlay fade
<div className="transition-opacity duration-200">

// Skeleton pulse
<div className="animate-pulse bg-neutral-200">
```

---

## Composants Réutilisables

### Structure des cartes
- Fond: `bg-neutral-100` ou `bg-white`
- Bordure visuelle: `border-0` (interdit) → utiliser `bg-neutral-200` pour séparer
- Ombre: `shadow-none` (interdit)
- Rayon: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px)

### Boutons
- Base: `px-4 py-2 rounded-lg font-medium transition-colors`
- Primaire: `bg-orange-500 text-white hover:bg-orange-600`
- Secondaire: `bg-neutral-200 text-neutral-800 hover:bg-neutral-300`
- Danger: `bg-red-500 text-white hover:bg-red-600`

---

## Responsive Design

### Breakpoints
| Taille | Classe | Usage |
|--------|--------|-------|
| Mobile | `< 768px` | `md:` |
| Tablette | `768px - 1024px` | `lg:` |
| Desktop | `>= 1024px` | `xl:` |

### Sidebar Mobile
- Collapsée par défaut: `w-12`
- Overlay: `fixed inset-0 bg-white/50 backdrop-blur-xs z-40`
- Bouton fermeture: Pleine largeur en mobile

### Messages
- **Mobile**: `w-full mx-auto` (pleine largeur, centré)
- **Desktop**: `w-fit max-w-[85%]` + alignement (`self-end` user, `self-start` IA)

---

## États de chargement

### Skeletons
Utiliser les composants de `components/shared/Skeleton.jsx`:
- `AvatarSkeleton`: `w-8 h-8`
- `TextSkeleton`: `h-3`
- `StatsCardSkeleton`: Pour les cartes de stats
- `TableRowSkeleton`: Avec prop `cells` pour le nombre de cellules
- `ConversationCardSkeleton`: Pour les cartes de conversation

### Indicateur de chargement
- Composant: `LoadingIndicator.jsx`
- Usage: `isLoading && <LoadingIndicator />`

---

## Couleurs par page

Géré par `utils/pageColors.js`:

| Page | Couleur | Classe |
|------|---------|--------|
| Broussaud AI | Orange | `orange-500` |
| Administration | Rouge | `red-500` |
| Boutique | Bleu | `blue-500` |

---

## Règles strictes

1. ✅ **Pure Tailwind**: Utility classes uniquement, pas de CSS custom sauf exception
2. ✅ **Light theme**: `neutral-100` à `neutral-400` pour les fonds
3. ✅ **Couleurs 500**: Pour les accents avec texte blanc
4. ❌ **Pas de `border-*`**: Utiliser des fonds contrastés à la place
5. ❌ **Pas de `shadow-*`**: Interdit sauf demande explicite
6. ✅ **Animations**: `transition-*` et `animate-*` autorisés
7. ✅ **Responsive**: `md:`, `lg:`, `xl:` pour adapter le layout
