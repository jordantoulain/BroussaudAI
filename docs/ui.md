# UI/UX - Projet Broussaud AI (Stage BTS SIO)

**Design System pour l'application éducative**
**BTS SIO Option SLAM - Lycée Suzanne Valadon & Entreprise Broussaud**

---

## 🎨 Theme & Couleurs

### Contexte Pédagogique

**Apprentissage**: Compréhension des principes de design system, accessibilité, et expérience utilisateur. Ce guide UV/UX a été conçu dans le cadre du stage pour appliquer les bonnes pratiques du développement web moderne.

### Theme Principal (Light Theme)

**Concept**: Utilisation exclusive d'un thème clair pour une meilleure accessibilité et lisibilité, particulièrement adapté aux environnements professionnels.

| Élément | Classe Tailwind | Description | Compétences |
|---------|----------------|-------------|-------------|
| **Fond principal** | `bg-neutral-100` | Fond des pages principales | C1.2 |
| **Fond secondaire** | `bg-neutral-200` | Fond des sections secondaires | C1.2 |
| **Survol/Actif** | `bg-neutral-300` | États interactifs (hover, focus) | C1.2 |
| **Bordures visuelles** | `bg-neutral-400` | Séparations visuelles (remplace border) | C1.2 |

**Apprentissage**: Utilisation de la palette neutre pour créer des hiérarchies visuelles sans utiliser de bordures (respect de la contrainte technique).

### Couleurs d'Accentuation (Niveau 500)

**Concept**: Les couleurs d'accentuation sont utilisées au niveau 500 pour un contraste optimal avec le texte blanc, selon les bonnes pratiques d'accessibilité (WCAG).

| Couleur | Classe | Utilisation | Signification | Compétences |
|---------|--------|-------------|--------------|-------------|
| **Orange** | `orange-500` | Boutons principaux, Broussaud AI | Couleur de la marque | C1.2 |
| **Violet** | `violet-500` | Profil USER | Indicateur de rôle utilisateur | C1.2 |
| **Rouge** | `red-500` | Profil ADMIN, boutons dangereux | Indicateur de rôle administrateur | C1.2 |
| **Bleu** | `blue-500` | Boutons secondaires, liens | Actions neutres | C1.2 |
| **Ambre** | `amber-500` | Épinglage (pin) | État spécial | C1.2 |
| **Vert** | `green-500` | Succès (ActionSuccess) | Feedback positif | C1.2 |

**Règle d'or**: ✅ **Toujours utiliser `text-white` sur les fonds colorés au niveau 500** pour un contraste optimal (ratio de contraste WCAG AAA).

### Exemples d'Utilisation Concrets

| Élément | Classe Tailwind | Composant | Description | Compétences |
|---------|----------------|-----------|-------------|-------------|
| Bouton Broussaud AI | `bg-orange-500 text-white px-4 py-2 rounded-lg` | NavigationSelector | Bouton principal de l'application | C1.2 |
| Bouton Administration | `bg-red-500 text-white px-4 py-2 rounded-lg` | NavigationSelector | Accès à l'interface admin (ADMIN uniquement) | C1.2, C2.3 |
| Bouton Boutique | `bg-blue-500 text-white px-4 py-2 rounded-lg` | NavigationSelector | Lien vers le site Broussaud | C1.2 |
| Indicateur USER | `bg-violet-500 text-white px-2 py-1 rounded` | UserProfile | Badge de rôle pour utilisateur standard | C1.2 |
| Indicateur ADMIN | `bg-red-500 text-white px-2 py-1 rounded` | UserProfile | Badge de rôle pour administrateur | C1.2 |
| Bouton Épingler | `bg-amber-500 text-white` (si épinglé) | ConversationItem | Indicateur de conversation épinglée | C1.2 |
| Alerte Succès | `bg-green-500 text-white` | ActionSuccess | Feedback visuel positif | C1.2 |

---

## 📝 Typographie

**Apprentissage**: Gestion de la typographie pour une meilleure lisibilité et hiérarchie visuelle.

| Propriété | Valeur | Classe Tailwind | Utilisation | Compétences |
|-----------|--------|-----------------|-------------|-------------|
| **Police** | Geist (défaut Next.js 16) | - | Texte par défaut | C1.2 |
| **Taille base** | 16px | `text-base` | Texte principal | C1.2 |
| **Taille petite** | 14px | `text-sm` | Texte secondaire, labels | C1.2 |
| **Taille grande** | 20px | `text-xl` | Titres de section | C1.2 |
| **Taille très grande** | 24px | `text-2xl` | Titres principaux | C1.2 |
| **Poids léger** | - | `font-light` | Texte discret | C1.2 |
| **Poids normal** | - | `font-normal` | Texte standard | C1.2 |
| **Poids moyen** | - | `font-medium` | Emphase modérée | C1.2 |
| **Poids gras** | - | `font-bold` | Emphase forte | C1.2 |

**Exemple d'utilisation**:
```jsx
// Titre de page
h1 className="text-2xl font-bold text-neutral-800"
// Sous-titre
h2 className="text-xl font-medium text-neutral-700"
// Texte principal
p className="text-base font-normal text-neutral-800"
// Label
span className="text-sm font-medium text-neutral-600"
```

---

## 📏 Espacements

### Padding

**Apprentissage**: Utilisation cohérente des espacements pour une interface harmonieuse.

| Usage | Classe | Description | Exemple |
|-------|--------|-------------|----------|
| **Conteneurs principaux** | `p-4`, `p-6` | Espace intérieur des conteneurs | Cards, panels |
| **Éléments compacts** | `p-2`, `py-2`, `px-3` | Boutons, badges | Boutons d'action |
| **Large** | `p-8` | Espace généreux | Modales, sections |
| **Horizontal** | `px-4`, `px-6` | Padding latéral | Conteneurs principaux |
| **Vertical** | `py-2`, `py-4` | Padding vertical | Séparateurs |

### Marges

| Usage | Classe | Description | Exemple |
|-------|--------|-------------|----------|
| **Espacement vertical** | `m-4`, `mt-6`, `mb-3` | Espace entre éléments | Listes, formulaires |
| **Espacement horizontal** | `mx-auto` | Centrage horizontal | Conteneurs |
| **Gaps** | `gap-2`, `gap-3.5`, `gap-4` | Espace entre éléments flex/grid | Listes, grilles |

### Largeurs

| Usage | Classe | Description | Compétences |
|-------|--------|-------------|-------------|
| **Sidebar ouverte** | `w-64` | Largeur standard sidebar | C1.2 |
| **Sidebar fermée** | `w-12` | Largeur compacte sidebar | C1.2 |
| **Messages desktop** | `max-w-[85%]` | Largeur maximale des messages | C1.2 |
| **Messages mobile** | `w-full` | Pleine largeur en mobile | C1.3 |
| **Padding latéral** | `px-4 md:px-20` | Padding responsive | C1.3 |

---

## 🚫 Bordures et Ombres

### ⚠️ RESTRICTION CRITIQUE (Apprentissage: Respect des contraintes techniques)

**Les classes `border-*` et `shadow-*` sont STRICTEMENT INTERDITES** sauf demande explicite.

**Pourquoi cette contrainte ?**:
- Uniformisation du design selon les standards de l'entreprise Broussaud
- Simplification de la maintenance CSS
- Apprentissage des alternatives aux bordures traditionnelles

### Alternatives aux Bordures

**Apprentissage**: Utiliser des fonds contrastés pour créer des séparations visuelles.

| Usage | Alternative | Classe Tailwind | Description |
|-------|------------|-----------------|-------------|
| Séparer des sections | Fond contrasté | `bg-neutral-200` | Ligne de séparation visuelle |
| État de survol | Changement de fond | `bg-neutral-300` | Hover state |
| Overlay | Fond transparent | `bg-white/50`, `backdrop-blur-xs` | Overlay de sidebar |
| Carte | Fond élevé | `bg-white` | Cartes de contenu |

**Exemple concret**:
```jsx
// Séparation entre sections
<div className="h-px bg-neutral-300" />

// Carte avec "bordure" visuelle
<div className="bg-white rounded-lg" />

// Bouton avec effet de bordure au survol
<button className="bg-neutral-200 hover:bg-neutral-300 transition-colors" />
```

---

## ✨ Animations & Transitions

**Apprentissage**: Ajout d'animations fluides pour une meilleure expérience utilisateur.

### Transitions

| Usage | Classe | Description | Durée recommandée |
|-------|--------|-------------|-------------------|
| Changement de couleur | `transition-colors` | Animation des couleurs | `duration-300` |
| Toutes propriétés | `transition-all` | Animation de toutes les propriétés | `duration-300` |
| Opacité | `transition-opacity` | Animation de l'opacité | `duration-200` |
| Transformation | `transition-transform` | Rotation, translation | `duration-200` |

### Animations

| Usage | Classe | Description | Exemple |
|-------|--------|-------------|----------|
| **Opacité** | `animate-fade-in`, `animate-fade-out` | Fondu d'apparition/disparition | Overlays |
| **Pulse** | `animate-pulse` | Animation de chargement | Skeletons |
| **Rotation** | `group-hover:rotate-90` | Rotation au survol | Icônes |
| **Translation** | `translate-x-full`, `translate-x-0` | Déplacement horizontal | SideCanvas |
| **Spin** | `animate-spin` | Rotation continue | Loaders |

### Exemples Concrets

```jsx
// 🎨 Sidebar animation (ouverture/fermeture)
<aside className="transition-all duration-300 ease-in-out w-64">

// 🔄 Icône hamburger rotation au survol
<div className="group-hover:rotate-90 transition-transform duration-200">
  <Menu Icon />
</div>

// 🌫️ Overlay fade pour sidebar mobile
<div className="transition-opacity duration-200 opacity-0 group-data-[open]:opacity-100">

// ❤️ Skeleton pulse pour chargement
<div className="animate-pulse bg-neutral-200">

// ➡️ SideCanvas animation (glissante)
<div className="transition-transform duration-300 ease-in-out translate-x-full group-data-[open]:translate-x-0">
```

---

## 🧩 Composants Réutilisables

### Structure des Cartes

**Apprentissage**: Création de composants cohérents et réutilisables.

| Propriété | Classe | Description |
|-----------|--------|-------------|
| Fond | `bg-neutral-100` ou `bg-white` | Fond de la carte |
| Bordure visuelle | ❌ `border-*` (interdit) | Remplacé par ombres ou fonds |
| Ombre | ❌ `shadow-*` (interdit) | Interdit par les contraintes |
| Rayon | `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px) | Coins arrondis |

**Exemple**:
```jsx
// Carte de base
<div className="bg-white rounded-lg p-4">
  {/* Contenu */}
</div>

// Carte avec "bordure" visuelle
<div className="bg-neutral-100 rounded-lg p-4">
  <div className="bg-white rounded-md p-3">
    {/* Contenu */}
  </div>
</div>
```

### Boutons

**Apprentissage**: Création de boutons cohérents avec feedback visuel.

| Type | Classe Base | Description | Exemple |
|------|-------------|-------------|----------|
| **Primaire** | `px-4 py-2 rounded-lg font-medium transition-colors` + `bg-orange-500 text-white hover:bg-orange-600` | Action principale | Bouton Broussaud AI |
| **Secondaire** | `px-4 py-2 rounded-lg font-medium transition-colors` + `bg-neutral-200 text-neutral-800 hover:bg-neutral-300` | Action secondaire | Bouton Annuler |
| **Danger** | `px-4 py-2 rounded-lg font-medium transition-colors` + `bg-red-500 text-white hover:bg-red-600` | Action destructive | Bouton Supprimer |
| **Ghost** | `px-4 py-2 rounded-lg font-medium transition-colors` + `hover:bg-neutral-100` | Action discrète | Boutons d'icônes |

**Exemple complet**:
```jsx
<button className="px-4 py-2 rounded-lg font-medium transition-colors bg-orange-500 text-white hover:bg-orange-600">
  Broussaud AI
</button>
```

---

## 📱 Responsive Design

**Apprentissage**: Adaptation de l'interface pour différents devices (mobile-first approach).

### Breakpoints

| Taille | Classe | Usage | Competences |
|--------|--------|-------|-------------|
| **Mobile** | `< 768px` | `md:` | Adaptation mobile | C1.3 |
| **Tablette** | `768px - 1024px` | `lg:` | Adaptation tablette | C1.3 |
| **Desktop** | `>= 1024px` | `xl:` | Adaptation desktop | C1.3 |

### Sidebar Mobile

**Apprentissage**: Gestion de la navigation mobile avec des patterns modernes.

| Élément | Classe | Description | Comportement |
|---------|--------|-------------|--------------|
| **Conteneur** | `fixed inset-0 bg-white/50 backdrop-blur-xs z-40` | Overlay complet | Appears on menu click |
| **Largeur** | `w-64` (ouvert), `w-12` (collapsed) | Largeur variable | Animation fluide |
| **Bouton fermeture** | `w-full` | Pleine largeur | Facile à toucher |

**Exemple**:
```jsx
// Sidebar responsive
<aside className="fixed md:relative z-50 h-full bg-neutral-100 transition-all duration-300 ease-in-out w-12 md:w-64">
  {/* Contenu */}
</aside>

// Overlay mobile
<div className="fixed inset-0 bg-white/50 backdrop-blur-xs z-40 md:hidden" />
```

### Messages Responsive

**Apprentissage**: Adaptation du layout des messages selon le device.

| Device | Classe | Layout | Alignement |
|--------|--------|--------|------------|
| **Mobile** | `w-full mx-auto` | Pleine largeur, centré | Centré |
| **Desktop** | `w-fit max-w-[85%]` | Largeur auto, max 85% | Gauche (user) / Droite (IA) |

**Exemple**:
```jsx
// Message utilisateur (desktop)
<div className="w-fit max-w-[85%] self-end bg-violet-500 text-white rounded-lg p-4">
  {/* Contenu */}
</div>

// Message IA (desktop)
<div className="w-fit max-w-[85%] self-start bg-neutral-200 text-neutral-800 rounded-lg p-4">
  {/* Contenu */}
</div>

// Message mobile
<div className="w-full mx-auto bg-neutral-200 text-neutral-800 rounded-lg p-4">
  {/* Contenu */}
</div>
```

---

## ⏳ États de Chargement

**Apprentissage**: Gestion des états de chargement pour une meilleure UX.

### Skeletons

**Apprentissage**: Utilisation de skeletons pour indiquer le chargement.

| Composant | Classe | Description | Usage |
|-----------|--------|-------------|-------|
| **AvatarSkeleton** | `w-8 h-8 bg-neutral-200 rounded-full animate-pulse` | Skeleton pour avatar | UserProfile |
| **TextSkeleton** | `h-3 bg-neutral-200 rounded animate-pulse` | Skeleton pour ligne de texte | Messages |
| **StatsCardSkeleton** | - | Skeleton pour carte de stats | Dashboard |
| **TableRowSkeleton** | - | Skeleton pour ligne de tableau (param: cells) | Listes |
| **ConversationCardSkeleton** | - | Skeleton pour carte de conversation | Historique |

**Exemple**:
```jsx
// Utilisation des skeletons
{isLoading ? (
  <div className="space-y-4">
    <div className="h-3 bg-neutral-200 rounded animate-pulse w-3/4" />
    <div className="h-3 bg-neutral-200 rounded animate-pulse w-1/2" />
  </div>
) : (
  // Contenu réel
)}
```

### Indicateur de Chargement

**Apprentissage**: Création d'indicateurs de chargement personnalisés.

| Composant | Description | Usage |
|-----------|-------------|-------|
| **LoadingIndicator** | Animation de points ou spinner | Actions asynchrones |
| **Spinning Loader** | Icône en rotation | Chargement de page |
| **Progress Bar** | Barre de progression | Upload de fichiers |

---

## 🎨 Couleurs par Page

**Apprentissage**: Gestion centralisée des couleurs pour une cohérence visuelle.

**Fichier**: `utils/pageColors.js`

| Page | Couleur | Classe Tailwind | Usage | Compétences |
|------|---------|-----------------|-------|-------------|
| **Broussaud AI** | Orange | `orange-500` | Couleur principale de l'application | C1.2 |
| **Administration** | Rouge | `red-500` | Couleur du panneau d'administration | C1.2, C2.3 |
| **Boutique** | Bleu | `blue-500` | Lien vers la boutique Broussaud | C1.2 |

**Utilisation**:
```javascript
// Dans pageColors.js
export const PAGE_COLORS = {
  'Broussaud AI': 'orange-500',
  'Administration': 'red-500',
  'Boutique': 'blue-500',
};

export const getPageColor = (page) => PAGE_COLORS[page] || 'neutral-500';

// Dans les composants
const color = getPageColor(currentPage);
<div className={`bg-${color} text-white px-4 py-2 rounded-lg`}>
  {currentPage}
</div>
```

---

## ✅ Règles Strictes

### Bonnes Pratiques Apprises

1. ✅ **Pure Tailwind**: Utility classes uniquement, pas de CSS custom (sauf exception justifiée)
2. ✅ **Light theme**: Utilisation de `neutral-100` à `neutral-400` pour les fonds
3. ✅ **Couleurs 500**: Pour les accents avec texte blanc (contraste optimal)
4. ❌ **Pas de `border-*`**: Utiliser des fonds contrastés à la place
5. ❌ **Pas de `shadow-*`**: Interdit sauf demande explicite
6. ✅ **Animations**: `transition-*` et `animate-*` autorisés pour l'UX
7. ✅ **Responsive**: `md:`, `lg:`, `xl:` pour adapter le layout
8. ✅ **Accessibilité**: Respect des contrastes WCAG
9. ✅ **Consistance**: Utilisation cohérente des espacements et couleurs

### Checklist de Validation UI/UX

- [ ] Tous les composants sont responsives
- [ ] Les contrastes respectent WCAG (AA minimum)
- [ ] Aucune bordure ou ombre non autorisée
- [ ] Les animations sont fluides (300ms typique)
- [ ] Les états de chargement sont gérés
- [ ] Les erreurs sont affichées clairement
- [ ] Le thème est cohérent sur toute l'application

---

*Documentation UI/UX maintenue dans le cadre du stage BTS SIO*
*Projet Broussaud AI - Lycée Suzanne Valadon & Entreprise Broussaud*
*© 2026 - Tous droits réservés*