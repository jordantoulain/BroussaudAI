'use client'

import { useMemo } from 'react'
import ApexChartComponent from '@/components/chat/ApexChartComponent'

/**
 * Pattern regex pour détecter les graphiques dans le texte
 * Format: %CHART:{json_config}%ENDCHART%
 * où json_config est une chaîne JSON avec la configuration du graphique
 */
const CHART_PATTERN = /%CHART:(\{[\s\S]*?\})%ENDCHART%/g

/**
 * Parse une configuration de graphique à partir d'une chaîne JSON
 * @param {string} jsonString - Chaîne JSON avec la configuration
 * @returns {Object|null} - Configuration du graphique ou null
 */
function parseChartConfig(jsonString) {
  try {
    const config = JSON.parse(jsonString)
    
    // Validation basique
    if (!config || typeof config !== 'object') {
      return null
    }
    
    // S'assurer qu'on a au moins un type et des séries
    if (!config.type) {
      config.type = 'line'
    }
    
    if (!config.series || !Array.isArray(config.series)) {
      config.series = []
    }
    
    return config
  } catch (error) {
    console.error('Erreur de parsing de la configuration du graphique:', error)
    return null
  }
}

/**
 * Parse le texte et extrait les configurations de graphiques
 * Retourne un tableau d'objets avec les parties de texte et les graphiques
 * 
 * @param {string} text - Texte à parser
 * @returns {Array<Object>} - Tableau de { type: 'text'|'chart', content: string|Object }
 */
export function parseTextWithCharts(text) {
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', content: text || '' }]
  }

  const result = []
  let lastIndex = 0
  let match

  while ((match = CHART_PATTERN.exec(text)) !== null) {
    const chartJson = match[1]
    const chartStart = match.index
    const chartEnd = chartStart + match[0].length

    // Ajouter le texte avant le graphique
    if (chartStart > lastIndex) {
      const textBefore = text.slice(lastIndex, chartStart)
      if (textBefore) {
        result.push({ type: 'text', content: textBefore })
      }
    }

    // Parser la configuration du graphique
    const chartConfig = parseChartConfig(chartJson)
    if (chartConfig) {
      result.push({ type: 'chart', content: chartConfig })
    } else {
      // Si le parsing échoue, afficher le texte brut
      result.push({ type: 'text', content: match[0] })
    }

    lastIndex = chartEnd
  }

  // Ajouter le texte restant après le dernier graphique
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    if (remainingText) {
      result.push({ type: 'text', content: remainingText })
    }
  }

  // Si aucun graphique trouvé, retourner le texte complet
  if (result.length === 0) {
    result.push({ type: 'text', content: text })
  }

  return result
}

/**
 * Composant React qui affiche le texte avec les graphiques intégrés
 * 
 * @param {Object} props
 * @param {string} props.text - Texte contenant les graphiques
 * @returns {JSX.Element}
 */
export function TextWithCharts({ text }) {
  const parsedContent = useMemo(() => parseTextWithCharts(text), [text])

  return (
    <>
      {parsedContent.map((item, index) => {
        if (item.type === 'chart') {
          return <ApexChartComponent key={`chart-${index}`} config={item.content} className="my-4" />
        }
        return <span key={`text-${index}`}>{item.content}</span>
      })}
    </>
  )
}

/**
 * Vérifie si un texte contient des graphiques
 * @param {string} text - Texte à vérifier
 * @returns {boolean}
 */
export function hasCharts(text) {
  if (!text || typeof text !== 'string') {
    return false
  }
  return CHART_PATTERN.test(text)
}

/**
 * Extrait toutes les configurations de graphiques d'un texte
 * @param {string} text - Texte à analyser
 * @returns {Array<Object>} - Tableau de configurations de graphiques
 */
export function extractCharts(text) {
  if (!text || typeof text !== 'string') {
    return []
  }

  const charts = []
  let match
  const pattern = new RegExp(CHART_PATTERN)

  while ((match = pattern.exec(text)) !== null) {
    const chartConfig = parseChartConfig(match[1])
    if (chartConfig) {
      charts.push(chartConfig)
    }
  }

  return charts
}
