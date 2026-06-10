'use client'

/**
 * Composant atomique pour afficher un indicateur de chargement animé
 * 
 * @param {Object} props
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export default function LoadingIndicator({ className = '' }) {
  return (
    <div className={`self-start py-2 text-sm italic animate-pulse ${className}`}>
      <svg 
        className='w-7 h-7' 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 200 200"
      >
        <rect 
          fill="#ff6900" 
          stroke="#ff6900" 
          strokeWidth="6" 
          width="30" 
          height="30" 
          x="25" 
          y="50"
        >
          <animate 
            attributeName="y" 
            calcMode="spline" 
            dur="2" 
            values="50;120;50;" 
            keySplines=".5 0 .5 1;.5 0 .5 1" 
            repeatCount="indefinite" 
            begin=".4"
          />
        </rect>
        <rect 
          fill="#ff8904" 
          stroke="#ff8904" 
          strokeWidth="6" 
          width="30" 
          height="30" 
          x="85" 
          y="50"
        >
          <animate 
            attributeName="y" 
            calcMode="spline" 
            dur="2" 
            values="50;120;50;" 
            keySplines=".5 0 .5 1;.5 0 .5 1" 
            repeatCount="indefinite" 
            begin=".2"
          />
        </rect>
        <rect 
          fill="#ffb86a" 
          stroke="#ffb86a" 
          strokeWidth="6" 
          width="30" 
          height="30" 
          x="145" 
          y="50"
        >
          <animate 
            attributeName="y" 
            calcMode="spline" 
            dur="2" 
            values="50;120;50;" 
            keySplines=".5 0 .5 1;.5 0 .5 1" 
            repeatCount="indefinite" 
            begin="0"
          />
        </rect>
      </svg>
    </div>
  )
}
