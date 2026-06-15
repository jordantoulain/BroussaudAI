'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import { api } from '@/services/api'

/**
 * Formulaire d'upload de document (PDF, TXT, JSON, CSV, XLSX, MD) dans un SideCanvas
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback pour soumettre le formulaire
 * @param {Function} props.onCancel - Callback pour annuler
 * @param {boolean} props.loading - Indique si un chargement est en cours
 * @returns {JSX.Element}
 */
export default function DocumentUploadForm({ onSubmit, onCancel, loading, accept }) {
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

  const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.json', '.csv', '.xlsx', '.md']

  const validateFile = useCallback((selectedFile) => {
    if (!selectedFile) {
      setFileError('Aucun fichier sélectionné')
      return false
    }

    // Vérifier l'extension
    const filename = selectedFile.name.toLowerCase()
    const isValidExtension = ALLOWED_EXTENSIONS.some(ext => filename.endsWith(ext))
    if (!isValidExtension) {
      setFileError(`Formats autorisés : PDF, TXT, JSON, CSV, XLSX, MD`)
      return false
    }

    // Vérifier la taille
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError(`La taille maximale autorisée est de 50MB. Votre fichier fait ${formatFileSize(selectedFile.size)}`)
      return false
    }

    setFileError(null)
    return true
  }, [])

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    }
  }, [validateFile])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer?.files?.[0]
    if (droppedFile) {
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
      }
    }
  }, [validateFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFileError(null)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    if (!file || fileError) {
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/ai/embedding', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        }
      })

      if (response.data) {
        await onSubmit()
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Erreur lors de l\'upload du document'
      setFileError(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [file, fileError, onSubmit])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sélection de fichier */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-neutral-700">
          Sélectionner un fichier
          <span className="text-red-500">*</span>
        </label>

        {/* Zone de drop ou bouton */}
        <div 
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-neutral-500 bg-neutral-50' : 'border-neutral-300 hover:border-neutral-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.json,.csv,.xlsx,.md"
            className="hidden"
            id="file-upload"
            disabled={loading || isUploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {file ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 mr-2 text-neutral-500 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-800 truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>
                </div>

                {!isUploading && !loading && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex-shrink-0 p-2 cursor-pointer text-neutral-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-neutral-400" />
                <div className="space-y-1">
                  <div className="font-medium text-neutral-800">
                    Glisser-déposer ou cliquer pour sélectionner
                  </div>
                  <div className="text-sm text-neutral-500">
                    PDF, TXT, JSON, CSV, XLSX, MD (max 50MB)
                  </div>
                </div>
              </div>
            )}
          </label>
        </div>

        {/* Erreur de fichier */}
        {fileError && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Progression de l'upload */}
        {isUploading && uploadProgress > 0 && (
          <div className="w-full">
            <div className="flex justify-between text-sm text-neutral-600 mb-1">
              <span>Envoi en cours...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || isUploading}
          className="px-4 py-2 cursor-pointer text-sm font-medium text-neutral-700 bg-neutral-200 rounded-xl hover:bg-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!file || fileError || loading || isUploading}
          className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Upload...
            </>
          ) : (
            'Envoyer le document'
          )}
        </button>
      </div>
    </form>
  )
}
