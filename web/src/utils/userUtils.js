'use client'

/**
 * Utilitaires pour les informations utilisateur
 */

/**
 * Retourne la classe de couleur Tailwind pour un rôle donné
 * @param {string} role - Rôle de l'utilisateur (ADMIN, USER)
 * @returns {string} - Classe Tailwind pour la couleur de fond
 */
export function getRoleColor(role) {
  const roleColors = {
    ADMIN: 'bg-red-500',
    USER: 'bg-violet-500'
  }
  return roleColors[role] || 'bg-violet-500'
}
