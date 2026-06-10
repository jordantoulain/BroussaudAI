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
export default function MiniChart({ series, categories, color = '#000000' }) {
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

  return (
    <div className="w-full h-16">
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
