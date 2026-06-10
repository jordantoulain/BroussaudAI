# Feature : Sidebar Animation

## Objectif
Ajouter des animations fluides pour l'ouverture, la fermeture et les interactions de la sidebar sur mobile et desktop, avec padding dynamique sur le contenu principal.

## Composants / Fichiers
- [x] `app/chat/page.jsx` (Gestion état `isMobile`/`isSidebarCollapsed` + padding dynamique `pl-12`/`pl-64`)
- [x] `components/chat/Sidebar.jsx` (Animation principale : `w-64` ↔ `w-12`, toujours `fixed` sur mobile)
- [x] `components/chat/SidebarCollapsed.jsx` (Contenu collapsed avec animation icône hamburger)

## Dépendances Internes
- [x] Composants `Sidebar` et `SidebarCollapsed` du registry

## Logique Technique
- `<aside>` toujours en `fixed left-0 top-0 z-50` sur mobile pour éviter l'aplatissement du contenu
- `<main>` : `pl-12` constant sur mobile pour la sidebar collapsed
- Largeur animée : `w-64` (ouvert) ↔ `w-12` (collapsed) avec `transition-all duration-300 ease-in-out`
- `overflow-hidden` sur l'`<aside>` pour éviter le débordement
- Desktop : sidebar dans le flux normal, `isCollapsed` bascule la largeur
- `shrink-0` sur tous les éléments enfants pour éviter le rétrécissement pendant l'animation
- Icône hamburger : rotation fluide au hover (`group-hover:rotate-90`)
- Overlay : fond `bg-black/10 backdrop-blur-xs z-40` avec fade-in/out (`transition-opacity`)

## État
[x] Terminée
