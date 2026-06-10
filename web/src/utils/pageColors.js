/**
 * Utilitaires pour gérer les couleurs associées aux pages
 */

export const PAGE_COLORS = {
  'Broussaud AI': 'bg-orange-500',
  'Administration': 'bg-red-500',
  'Boutique Maison Broussaud': 'bg-blue-500'
}

/**
 * Retourne la classe de couleur pour une page donnée
 * @param {string} page - Nom de la page
 * @returns {string} Classe Tailwind pour la couleur de fond
 */
export function getPageColor(page) {
  return PAGE_COLORS[page] || 'bg-blue-500'
}

