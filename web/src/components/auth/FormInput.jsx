'use client'

/**
 * Composant d'input pour les formulaires d'authentification
 * 
 * @param {Object} props
 * @param {string} props.id - ID de l'input
 * @param {string} props.name - Nom de l'input
 * @param {string} [props.type='text'] - Type de l'input
 * @param {boolean} [props.required=false] - Si le champ est requis
 * @param {string} [props.placeholder=''] - Placeholder
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @param {Object} [props.rest] - Autres props à passer à l'input
 * @returns {JSX.Element}
 */
export default function FormInput({ id, name, type = 'text', required = false, placeholder = '', className = '', ...rest }) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      className={`appearance-none bg-white outline-none text-black w-full px-4 py-3 rounded-xl ${className}`}
      {...rest}
    />
  )
}
