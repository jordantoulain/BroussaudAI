'use client'

import { useRef, useEffect } from 'react'

/**
 * Composant d'entrée de code OTP/TOTP à 6 chiffres
 * Chaque chiffre a son propre input, avec gestion automatique du focus
 *
 * @param {Object} props
 * @param {string} props.value - Code actuel (6 caractères)
 * @param {function} props.onChange - Callback (code: string)
 * @param {boolean} [props.disabled=false] - Désactive les inputs
 * @returns {JSX.Element}
 */
export default function OTPInput({ value = '', onChange, disabled = false }) {
  const inputRefs = useRef([])

  // Initialiser le tableau de refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  // Se concentrer sur le premier input vide au montage
  useEffect(() => {
    if (inputRefs.current[0] && !value) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index, inputValue) => {
    // Only allow single digit
    const sanitizedValue = inputValue.replace(/\D/g, '').slice(-1)
    
    // Update the value
    const newValue = value.split('')
    newValue[index] = sanitizedValue
    const updatedValue = newValue.join('').slice(0, 6)
    onChange(updatedValue)

    // Move to next input if a digit was entered
    if (sanitizedValue && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newValue = value.split('')
      
      if (newValue[index]) {
        // Clear current digit
        newValue[index] = ''
        onChange(newValue.join(''))
      } else if (index > 0) {
        // Move to previous input and clear it
        newValue[index - 1] = ''
        onChange(newValue.join(''))
        inputRefs.current[index - 1].focus()
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (index > 0) {
        inputRefs.current[index - 1].focus()
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (index < 5) {
        inputRefs.current[index + 1].focus()
      }
    } else if (e.key === 'Paste') {
      e.preventDefault()
      // Handle paste - get clipboard data
      const pastedData = e.clipboardData.getData('text/plain')
      const pasteValue = pastedData.replace(/\D/g, '').slice(0, 6)
      if (pasteValue) {
        onChange(pasteValue)
        // Focus the appropriate input
        const focusIndex = Math.min(pasteValue.length, 5)
        inputRefs.current[focusIndex].focus()
      }
    }
  }

  const handleFocus = (e) => {
    e.target.select()
  }

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={handleFocus}
          disabled={disabled}
          className="w-10 h-12 text-center text-xl font-mono border border-neutral-300 rounded-lg bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  )
}
