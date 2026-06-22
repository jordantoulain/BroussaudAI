'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

/**
 * Composant pour afficher des graphiques ApexCharts complets dans les réponses IA
 * 
 * @param {Object} props
 * @param {Object} props.config - Configuration complète du graphique
 * @param {string} props.config.type - Type de graphique ('line', 'bar', 'pie', 'area', 'column', 'scatter', 'heatmap', 'candlestick', 'radar', 'donut')
 * @param {Array<Object>} props.config.series - Données des séries
 * @param {Object} props.config.options - Options du graphique
 * @param {string} [props.config.title] - Titre du graphique
 * @param {number} [props.config.height] - Hauteur du graphique (default: 400)
 * @param {string} [props.className] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export default function ApexChartComponent({ config, className = '' }) {
  const {
    type = 'line',
    series = [],
    options = {},
    title,
    height = 400
  } = config || {}

  // Palette de couleurs par défaut (couleurs Tailwind en hex)
  const defaultColors = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#06b6d4', '#84cc16', '#ec4899', '#14b8a6']

  // Configuration spécifique par type de graphique
  const typeSpecificConfig = useMemo(() => {
    const config = {}
    
    // Types où on désactive les outils de zoom
    const disableZoomTypes = ['pie', 'donut', 'heatmap', 'radar']
    
    // Configuration de base du chart
    config.chart = {
      type,
      id: `chart-${Math.random().toString(36).substr(2, 9)}`,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'transparent',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: !disableZoomTypes.includes(type),
          zoom: !disableZoomTypes.includes(type),
          zoomin: !disableZoomTypes.includes(type),
          zoomout: !disableZoomTypes.includes(type),
          pan: !disableZoomTypes.includes(type),
          reset: !disableZoomTypes.includes(type)
        }
      }
    }
    
    // Couleurs par défaut pour tous les types
    config.colors = defaultColors
    
    // Configuration du stroke
    config.stroke = {
      curve: 'smooth',
      width: 2,
      lineCap: 'round'
    }
    
    // Configuration du fill
    config.fill = {
      opacity: 0.1
    }
    
    // Légende
    config.legend = {
      position: ['pie', 'donut'].includes(type) ? 'right' : 'bottom',
      horizontalAlign: 'center',
      markers: {
        width: 12,
        height: 12,
        radius: 12
      }
    }
    
    // Configuration spécifique pour pie/donut
    if (type === 'pie' || type === 'donut') {
      config.stroke = {
        show: true,
        width: 2,
        colors: ['#fff']
      }
      config.fill = {
        type: 'solid',
        opacity: 1
      }
      config.plotOptions = {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: type === 'donut',
                label: 'Total'
              }
            }
          },
          expandOnClick: true,
          customScale: 1
        }
      }
      config.dataLabels = {
        enabled: true,
        style: {
          colors: ['#fff']
        },
        dropShadow: {
          enabled: true,
          opacity: 0.2
        }
      }
    }
    
    // Configuration spécifique pour heatmap
    if (type === 'heatmap') {
      config.fill = {
        type: 'solid'
      }
      config.plotOptions = {
        heatmap: {
          colorScale: {
            ranges: [
              { from: 0, to: 25, color: '#fef08a' },
              { from: 26, to: 50, color: '#facc15' },
              { from: 51, to: 75, color: '#f97316' },
              { from: 76, to: 100, color: '#ef4444' }
            ]
          },
          enableShades: true,
          shadeIntensity: 0.5
        }
      }
      config.dataLabels = {
        enabled: true,
        style: {
          colors: ['#000']
        }
      }
    }
    
    // Configuration spécifique pour radar
    if (type === 'radar') {
      config.stroke = {
        show: true,
        width: 2,
        colors: ['#fff']
      }
      config.fill = {
        opacity: 0.2
      }
      config.markers = {
        size: 4,
        colors: defaultColors,
        strokeColors: '#fff',
        strokeWidth: 2
      }
    }
    
    // Titre
    config.title = title ? {
      text: title,
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937'
      }
    } : options.title
    
    config.subtitle = options.subtitle || {
      text: '',
      align: 'center',
      style: {
        fontSize: '12px',
        color: '#6b7280'
      }
    }
    
    // Axes
    config.xaxis = options.xaxis || {
      categories: [],
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      },
      axisBorder: {
        show: true,
        color: '#d1d5db'
      },
      axisTicks: {
        show: true,
        color: '#d1d5db'
      }
    }
    
    config.yaxis = options.yaxis || {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      },
      min: options.yaxis?.min,
      max: options.yaxis?.max,
      forceNiceScale: true
    }
    
    // Tooltip
    config.tooltip = options.tooltip || {
      enabled: true,
      style: {
        fontSize: '12px'
      },
      marker: {
        show: true
      }
    }
    
    // Grid
    config.grid = options.grid || {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    }
    
    // Markers (par défaut)
    config.markers = options.markers || {
      size: 4,
      hover: {
        size: 6
      }
    }
    
    // Data labels (par défaut)
    config.dataLabels = options.dataLabels || {
      enabled: false
    }
    
    // No data
    config.noData = {
      text: 'Pas de données disponibles',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        color: '#6b7280',
        fontSize: '14px'
      }
    }
    
    // Labels
    config.labels = options.labels || []
    
    return config
  }, [type, title, options])

  // Appliquer les options utilisateur par-dessus la configuration par défaut
  const chartOptions = useMemo(() => ({
    ...typeSpecificConfig,
    ...options
  }), [typeSpecificConfig, options])

  // Transformer les séries pour pie/donut - ajouter les labels si absent
  const finalSeries = useMemo(() => {
    if ((type === 'pie' || type === 'donut') && series && series.length > 0) {
      return series.map(s => {
        // Si les données sont des valeurs simples, les convertir avec labels
        if (Array.isArray(s.data) && s.data.length > 0 && typeof s.data[0] === 'number') {
          return {
            ...s,
            data: s.data.map((value, index) => ({
              x: s.labels?.[index] || `Segment ${index + 1}`,
              y: value
            }))
          }
        }
        return s
      })
    }
    return series
  }, [type, series])

  return (
    <div className={`w-full bg-neutral-100 rounded-2xl p-4 ${className}`}>
      <Chart
        options={chartOptions}
        series={finalSeries}
        type={type}
        height={height}
        width="100%"
      />
    </div>
  )
}
