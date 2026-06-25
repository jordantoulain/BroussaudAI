'use client'

import { useMemo } from 'react'
import ApexChartComponent from '@/components/chat/ApexChartComponent'

/**
 * Pattern regex pour détecter les graphiques dans le texte
 * Format: %CHART:{json_config}%ENDCHART%
 */
const CHART_PATTERN = /%CHART:(\{[\s\S]*?\})%ENDCHART%/g

/**
 * Parse une configuration de graphique à partir d'une chaîne JSON et normalise les données
 * @param {string} jsonString - Chaîne JSON avec la configuration
 * @returns {Object|null} - Configuration du graphique ou null
 */
function parseChartConfig(jsonString) {
  try {
    const config = JSON.parse(jsonString)
    if (!config || typeof config !== 'object') {
      return null
    }

    // 1. Détection et forçage du type partout
    let chartType = 'line'
    if (typeof config.type === 'string') chartType = config.type
    else if (config.chart && config.chart.type) chartType = config.chart.type
    else if (config.options && config.options.chart && config.options.chart.type) chartType = config.options.chart.type
    
    chartType = chartType.toLowerCase()
    
    // Corrections des erreurs courantes de l'IA
    if (chartType === 'doughnut') chartType = 'donut'
    if (chartType === 'column') chartType = 'bar' // Correction cruciale pour ApexCharts

    const isNonAxis = ['pie', 'donut', 'radialbar', 'polararea'].includes(chartType)

    // 2. Base propre
    const cleanConfig = {
      ...config,
      type: chartType,
      chart: { ...(config.chart || {}), type: chartType },
      series: []
    }

    // 3. Extraction de la série brute envoyée par l'IA
    let rawSeries = []
    if (Array.isArray(config.series)) {
      rawSeries = config.series
    } else if (config.options && Array.isArray(config.options.series)) {
      rawSeries = config.options.series
    }

    // 4. Traitement différencié
    if (isNonAxis) {
      // --- GRAPHIQUES CIRCULAIRES ---
      let newSeries = []
      let labels = Array.isArray(config.labels) ? config.labels : (config.options?.labels || [])

      // Si l'IA a fait l'erreur classique : [{ data: [10, 20] }]
      if (rawSeries.length === 1 && rawSeries[0] && Array.isArray(rawSeries[0].data)) {
        newSeries = rawSeries[0].data.map(v => Number(v)).filter(n => !isNaN(n))
        // Récupération des labels s'ils traînaient dans l'axe X
        if (labels.length === 0 && config.xaxis && Array.isArray(config.xaxis.categories)) {
          labels = config.xaxis.categories
        }
      } else {
        // Extraction mixte
        rawSeries.forEach((item, i) => {
          if (typeof item === 'number') newSeries.push(item)
          else if (typeof item === 'string' && !isNaN(Number(item))) newSeries.push(Number(item))
          else if (item && typeof item === 'object') {
            if (Array.isArray(item.data)) {
              newSeries.push(Number(item.data[0] || 0))
              if (item.name && !labels[i]) labels[i] = String(item.name)
            } else {
              const val = item.value ?? item.y ?? item.data
              if (typeof val === 'number') {
                newSeries.push(val)
                const labelName = item.name || item.x || item.label
                if (labelName && !labels[i]) labels[i] = String(labelName)
              }
            }
          }
        })
      }

      // SÉCURITÉ 1 : Pas de tableau vide qui fait crasher le render
      cleanConfig.series = newSeries.length > 0 ? newSeries : [1]
      if (labels.length > 0) cleanConfig.labels = labels

      // SÉCURITÉ 2 : Destruction totale des axes pour éviter le crash
      delete cleanConfig.xaxis
      delete cleanConfig.yaxis
      if (cleanConfig.options) {
        delete cleanConfig.options.xaxis
        delete cleanConfig.options.yaxis
      }

    } else {
      // --- GRAPHIQUES AVEC AXES (Line, Bar...) ---
      let newSeries = []
      
      rawSeries.forEach(item => {
        if (item && typeof item === 'object' && Array.isArray(item.data)) {
          newSeries.push({
            name: String(item.name || 'Série'),
            data: item.data.map(v => typeof v === 'object' ? v : (Number(v) || 0))
          })
        } else if (typeof item === 'number' || typeof item === 'string') {
          if (newSeries.length === 0) newSeries.push({ name: 'Données', data: [] })
          const num = Number(item)
          if (!isNaN(num)) newSeries[0].data.push(num)
        }
      })

      // SÉCURITÉ : Assurer une structure valide par défaut
      cleanConfig.series = newSeries.length > 0 ? newSeries : [{ name: 'Données', data: [0] }]
    }

    return cleanConfig
  } catch (error) {
    console.error('Erreur de parsing de la configuration du graphique:', error)
    return null
  }
}

/**
 * Parse le texte et extrait les configurations de graphiques
 * @param {string} text - Texte à parser
 * @returns {Array<Object>}
 */
export function parseTextWithCharts(text) {
  if (!text || typeof text !== 'string') return [{ type: 'text', content: text || '' }]

  const result = []
  let lastIndex = 0
  let match

  while ((match = CHART_PATTERN.exec(text)) !== null) {
    const chartJson = match[1]
    const chartStart = match.index
    const chartEnd = chartStart + match[0].length

    if (chartStart > lastIndex) {
      const textBefore = text.slice(lastIndex, chartStart)
      if (textBefore) result.push({ type: 'text', content: textBefore })
    }

    const chartConfig = parseChartConfig(chartJson)
    if (chartConfig) {
      result.push({ type: 'chart', content: chartConfig })
    } else {
      result.push({ type: 'text', content: match[0] })
    }
    
    lastIndex = chartEnd
  }

  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    if (remainingText) result.push({ type: 'text', content: remainingText })
  }

  if (result.length === 0) result.push({ type: 'text', content: text })
  return result
}

/**
 * Composant React qui affiche le texte avec les graphiques intégrés
 */
export function TextWithCharts({ text }) {
  const parsedContent = useMemo(() => parseTextWithCharts(text), [text])

  return (
    <>
      {parsedContent.map((item, index) => {
        if (item.type === 'chart') {
          // --- CHANGEMENT CRITIQUE ICI ---
          // Empêche le crash lors d'une transition à la volée entre deux types de graphiques
          const uniqueKey = `chart-${index}-${item.content.type}`
          return <ApexChartComponent key={uniqueKey} config={item.content} className="my-4" />
        }
        return <span key={`text-${index}`}>{item.content}</span>
      })}
    </>
  )
}

/**
 * Vérifie si un texte contient des graphiques
 */
export function hasCharts(text) {
  if (!text || typeof text !== 'string') return false
  return CHART_PATTERN.test(text)
}

/**
 * Extrait toutes les configurations de graphiques d'un texte
 */
export function extractCharts(text) {
  if (!text || typeof text !== 'string') return []
  
  const charts = []
  let match
  const pattern = new RegExp(CHART_PATTERN)
  
  while ((match = pattern.exec(text)) !== null) {
    const chartConfig = parseChartConfig(match[1])
    if (chartConfig) charts.push(chartConfig)
  }
  
  return charts
}