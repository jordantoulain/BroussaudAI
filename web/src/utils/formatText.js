'use client'

import { Tag } from '../components/shared/Tag'

/**
 * Parse une partie de texte et gère les patterns spéciaux
 * - %SHOW_TYPE% ou %SHOW_TYPE_label% : badge avec icône
 * - %BOLD%...%ENDBOLD% : texte en gras
 * 
 * @param {string} text - Texte à parser
 * @returns {Array<import('react').ReactNode>} - Tableau de nœuds React
 */
function parseTextPart(text) {
  const result = []
  let i = 0
  
  while (i < text.length) {
    // Gérer les tags %SHOW_TYPE% ou %SHOW_TYPE_label%
    if (text.slice(i, i + 6) === '%SHOW_') {
      const tagEnd = text.indexOf('%', i + 6)
      if (tagEnd !== -1) {
        const tagContent = text.slice(i + 6, tagEnd)
        const underscoreIndex = tagContent.indexOf('_')
        
        if (underscoreIndex === -1) {
          // Format: %SHOW_TYPE%
          result.push(
            <Tag key={`tag-${i}`} type={tagContent} />
          )
        } else {
          // Format: %SHOW_TYPE_label%
          const tagType = tagContent.slice(0, underscoreIndex)
          const tagLabel = tagContent.slice(underscoreIndex + 1)
          result.push(
            <Tag key={`tag-${i}`} type={tagType} label={tagLabel} />
          )
        }
        
        i = tagEnd + 1
        continue
      }
    }
    
    // Gérer le gras %BOLD%...%ENDBOLD%
    if (text.slice(i, i + 6) === '%BOLD%') {
      const boldEnd = text.indexOf('%ENDBOLD%', i + 6)
      if (boldEnd !== -1) {
        result.push(
          <span key={`bold-${i}`} className="font-medium text-orange-400">
            {parseTextPart(text.slice(i + 6, boldEnd))}
          </span>
        )
        i = boldEnd + 9
        continue
      }
    }
    
    // Caractère normal
    result.push(text[i])
    i++
  }
  
  return result
}

/**
 * Formate le texte des réponses IA avec les tags spéciaux
 * - %NL% : saut de ligne
 * - %SHOW_TYPE% ou %SHOW_TYPE_label% : badge avec icône (ex: %SHOW_TERMINE%, %SHOW_EN_COURS_En cours%)
 * - %BOLD%...%ENDBOLD% : texte en gras
 * 
 * @param {string} text - Texte à formater
 * @returns {import('react').ReactNode} - Texte formaté en éléments React
 */
export function formatResponseText(text) {
  if (!text || typeof text !== 'string') {
    return text
  }

  // Diviser par %NL% pour gérer les paragraphes
  const parts = text.split('%NL%')
  
  // Traiter chaque partie
  const formattedParts = parts.map((part, index) => {
    if (!part) return null
    
    const parsed = parseTextPart(part)
    
    // Si un seul élément textuel, retourner directement
    if (parsed.length === 1 && typeof parsed[0] === 'string') {
      return parsed[0]
    }
    
    return parsed
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
