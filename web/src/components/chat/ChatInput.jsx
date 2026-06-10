'use client'

import { Forward } from 'lucide-react'

/**
 * Composant molécule pour l'input de chat avec bouton d'envoi
 * 
 * @param {Object} props
 * @param {string} props.input - Valeur actuelle de l'input
 * @param {function} props.onChange - Handler pour le changement de valeur
 * @param {function} props.onSubmit - Handler pour la soumission du formulaire
 * @param {boolean} props.isLoading - Si vrai, désactive l'input et le bouton
 * @returns {JSX.Element}
 */
export default function ChatInput({ input, onChange, onSubmit, isLoading }) {
  const isDisabled = !input.trim() || isLoading
  
  return (
    <>
      <p className="text-xs font-light tracking-widest select-none text-neutral-500 text-center mb-2">Vérifiez les informations importantes, Broussaud AI peut se tromper.</p>
      <form 
        onSubmit={onSubmit} 
        className={`flex items-center bg-neutral-200 border-2 border-neutral-100 rounded-2xl p-1.5 w-full max-w-2xl mx-auto transition-all duration-300 ease-in-out focus-within:max-w-3xl ${input ? 'ring-2 ring-orange-400' : 'ring-2 ring-neutral-300'}`}
      >
        <input
          type="text"
          value={input}
          onChange={onChange}
          placeholder="Écrivez votre message..."
          disabled={isLoading}
          className="flex-1 font-light [caret-shape:underscore] appearance-none bg-transparent outline-none text-neutral-900 px-4 py-2 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isDisabled}
          className="flex px-3 py-2 mr-1 group text-sm font-bold rounded-xl text-neutral-900/50 bg-neutral-300 hover:bg-orange-400 hover:text-white disabled:opacity-0 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 ease-in-out"
        >
          <Forward className="w-5 h-5" />
        </button>
      </form>
    </>
  )
}
