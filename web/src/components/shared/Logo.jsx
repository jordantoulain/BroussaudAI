'use client'

import Image from 'next/image'

/**
 * Composant partagé pour afficher le logo Broussaud
 * Utilisé dans : AuthCard, ChatHeader, etc.
 * 
 * @param {Object} props
 * @param {number} [props.width=200] - Largeur de l'image
 * @param {number} [props.height=200] - Hauteur de l'image
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @param {string} [props.src="/logo.png"] - Chemin de l'image
 * @param {string} [props.alt="Logo Broussaud"] - Texte alternatif
 * @returns {JSX.Element}
 */
export default function Logo({ 
  width = 200, 
  height = 200, 
  className = '', 
  src = "/logo.png",
  alt = "Logo Broussaud"
}) {
  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <Image
        src={src}
        width={width}
        height={height}
        alt={alt}
      />
    </div>
  )
}
