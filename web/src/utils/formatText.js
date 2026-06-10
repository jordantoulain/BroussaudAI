'use client'

/**
 * Formate le texte des réponses IA avec les tags spéciaux
 * - %NL% : saut de ligne
 * - %BOLD%...%ENDBOLD% : texte en gras
 * 
 * @param {string} text - Texte à formater
 * @returns {import('react').ReactNode} - Texte formaté en éléments React
 */
export function formatResponseText(text) {
  if (!text || typeof text !== 'string') {
    return text
  }

  // Remplacer les sauts de ligne %NL% par des <br />
  // Diviser d'abord par %NL% pour gérer les paragraphes
  const parts = text.split('%NL%')
  
  // Traiter chaque partie pour le gras
  const formattedParts = parts.map((part, index) => {
    if (!part) return null
    
    // Gérer le gras %BOLD%...%ENDBOLD%
    const boldRegex = /%BOLD%(.*?)%ENDBOLD%/g
    const boldMatches = []
    let lastIndex = 0
    let match
    
    while ((match = boldRegex.exec(part)) !== null) {
      // Texte avant le gras
      if (match.index > lastIndex) {
        boldMatches.push(part.substring(lastIndex, match.index))
      }
      
      // Texte en gras
      boldMatches.push(
        <span key={`bold-${match.index}-${match[0].length}`} className="font-medium text-orange-400">
          {match[1]}
        </span>
      )
      
      lastIndex = match.index + match[0].length
    }
    
    // Texte restant après le dernier match
    if (lastIndex < part.length) {
      boldMatches.push(part.substring(lastIndex))
    }
    
    // Si aucun gras trouvé, retourner la partie telle quelle
    if (boldMatches.length === 0) {
      return part
    }
    
    // Si un seul élément et que c'est une string (pas de gras), retourner la string
    if (boldMatches.length === 1 && typeof boldMatches[0] === 'string') {
      return boldMatches[0]
    }
    
    return boldMatches
  })
  
  // Construire le résultat final avec les sauts de ligne
  const result = []
  formattedParts.forEach((part, index) => {
    if (part === null) {
      result.push(<br key={`br-${index}`} />)
    } else if (Array.isArray(part)) {
      result.push(
        <span key={`part-${index}`}>
          {part}
        </span>
      )
    } else if (typeof part === 'string') {
      result.push(
        <span key={`part-${index}`}>
          {part}
        </span>
      )
    } else {
      result.push(part)
    }
    
    // Ajouter un br après chaque partie sauf la dernière
    if (index < formattedParts.length - 1 && formattedParts[index + 1] !== null) {
      result.push(<br key={`br-end-${index}`} />)
    }
  })
  
  return result
}
