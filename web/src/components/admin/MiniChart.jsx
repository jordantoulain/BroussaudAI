'use client'

import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

/**
 * Composant de graphique minimaliste pour le dashboard admin
 * Affiche une courbe basée sur les dates fournies, sans valeurs ni interactions
 * 
 * @param {Object} props
 * @param {Array<number>} props.series - Valeurs de la série (counts)
 * @param {Array<string>} props.categories - Catégories (dates formatées)
 * @param {string} [props.color] - Couleur de la ligne (default: violet-500)
 * @returns {JSX.Element}
 */
export default function MiniChart({ series, categories, color = '#000000', height = 16 }) {
  const options = {
    chart: {
      type: 'line',
      sparkline: {
        enabled: true
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    colors: [color],
    stroke: {
      width: 2,
      curve: 'smooth',
      lineCap: 'round'
    },
    markers: {
      size: 0
    },
    fill: {
      type: 'solid',
      opacity: 0.1
    },
    xaxis: {
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: false
      },
      min: 0
    },
    tooltip: {
      enabled: false
    },
    grid: {
      show: false
    },
    legend: {
      show: false
    }
  }

  const heightClass = height === 16 ? 'h-16' : height === 20 ? 'h-20' : `h-[${height}px]`

  return (
    <div className={`w-full ${heightClass}`}>
      <Chart
        options={options}
        series={[{ data: series }]}
        type="line"
        height="100%"
        width="100%"
      />
    </div>
  )
}
