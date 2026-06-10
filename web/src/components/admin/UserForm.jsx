'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye, EyeOff, User, Mail, Key, BookUser } from 'lucide-react'
import RoleDropdown from './RoleDropdown'

/**
 * Composant de formulaire pour créer/modifier un utilisateur
 * 
 * @param {Object} props
 * @param {Object} props.user - Utilisateur à modifier (null pour création)
 * @param {Function} props.onSubmit - Callback au soumission du formulaire
 * @param {Function} props.onCancel - Callback pour annuler
 * @param {boolean} [props.loading] - État de chargement
 * @returns {JSX.Element}
 */
export default function UserForm({ user, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    mail: '',
    mdp: '',
    role: 'USER'
  })
  const [showPassword, setShowPassword] = useState(false)

  // Initialiser avec les données de l'utilisateur si modification
  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        mail: user.mail || '',
        mdp: '',
        role: user.role || 'USER'
      })
    } else {
      // Réinitialiser pour création
      setFormData({
        nom: '',
        prenom: '',
        mail: '',
        mdp: '',
        role: 'USER'
      })
    }
  }, [user])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    onSubmit(formData)
  }, [formData, onSubmit])

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nom */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <BookUser className="w-5 h-5 text-neutral-400" />
        </div>
        <input
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          placeholder="Nom"
          required
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 text-neutral-800 placeholder-neutral-500 outline-none transition-colors"
        />
      </div>

      {/* Prénom */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <User className="w-5 h-5 text-neutral-400" />
        </div>
        <input
          type="text"
          name="prenom"
          value={formData.prenom}
          onChange={handleChange}
          placeholder="Prénom"
          required
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 text-neutral-800 placeholder-neutral-500 outline-none transition-colors"
        />
      </div>

      {/* Email */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="w-5 h-5 text-neutral-400" />
        </div>
        <input
          type="email"
          name="mail"
          value={formData.mail}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 text-neutral-800 placeholder-neutral-500 outline-none transition-colors"
        />
      </div>

      {/* Mot de passe */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Key className="w-5 h-5 text-neutral-400" />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          name="mdp"
          value={formData.mdp}
          onChange={handleChange}
          placeholder={user ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50 text-neutral-800 placeholder-neutral-500 outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5 text-neutral-400 hover:text-neutral-500 transition-colors" />
          ) : (
            <Eye className="w-5 h-5 text-neutral-400 hover:text-neutral-500 transition-colors" />
          )}
        </button>
      </div>

      {/* Rôle */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Rôle</label>
        <RoleDropdown
          value={formData.role}
          onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2.5 cursor-pointer bg-neutral-100 rounded-xl text-neutral-700 hover:bg-neutral-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 cursor-pointer bg-green-500 text-white rounded-xl hover:bg-green-400 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'En cours...' : user ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  )
}
