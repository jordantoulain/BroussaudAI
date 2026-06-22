'use client'

/**
 * Utilitaires pour le formatage des messages IA
 */

/**
 * Parse la réponse brute de l'API
 * - Gère les réponses string (JSON ou texte brut)
 * - Gère les réponses objet
 * - Ajoute les contexts et confidence si présents
 * 
 * @param {Object} responseData - Données brutes de la réponse API
 * @returns {Object} - Objet formaté avec answer, contexts, tags, confidence, etc.
 */
export function parseAPIResponse(responseData) {
  let rawData = responseData.response || responseData

  // Parsing JSON si la réponse est une string
  if (typeof rawData === 'string') {
    try {
      const cleanString = rawData.replace(/```json/gi, '').replace(/```/g, '').trim()
      rawData = JSON.parse(cleanString)
    } catch (e) {
      rawData = { answer: rawData }
    }
  }

  // Ajouter contexts depuis la racine si présent (fallback si parsing échoué)
  if (responseData.contexts !== undefined) {
    rawData.contexts = responseData.contexts
  }

  // Ajouter confidence depuis la racine si présent
  if (responseData.confidence !== undefined) {
    rawData.confidence = responseData.confidence
  }

  return rawData
}

/**
 * Formate un message IA
 * 
 * @param {Object} data - Données du message (answer, label, sub_label, tags, contexts, confidence)
 * @returns {Object} - Message formaté pour l'affichage
 */
export function createAIMessage(data) {
  return {
    id: Date.now() + 1,
    data: {
      label: data.label || 'SYSTÈME',
      sub_label: data.sub_label || 'ACCUEIL',
      tags: data.tags || [],
      contexts: data.contexts || [],
      confidence: data.confidence !== undefined ? data.confidence : 50,
      file: data.file || [],
      answer: data.answer || data
    },
    isClient: false
  }
}

/**
 * Formate un message utilisateur
 * 
 * @param {string} text - Texte du message
 * @returns {Object} - Message utilisateur formaté
 */
export function createUserMessage(text) {
  return {
    id: Date.now(),
    text: text,
    isClient: true
  }
}

/**
 * Formate le message de bienvenue par défaut
 * Utilise un ID fixe unique pour éviter les doublons
 * 
 * @returns {Object} - Message de bienvenue
 */
export function createWelcomeMessage() {
  return {
    id: 'welcome-message',
    data: {
      label: 'SYSTÈME',
      sub_label: 'ACCUEIL',
      tags: ['introduction', 'assistant'],
      answer: "Bonjour ! Je suis l'assistant de l'usine Broussaud. Comment puis-je t'aider aujourd'hui ?"
    },
    isClient: false
  }
}

/**
 * Formate un message d'erreur
 * 
 * @returns {Object} - Message d'erreur formaté
 */
export function createErrorMessage() {
  return {
    id: Date.now() + 1,
    data: {
      label: 'ERREUR',
      sub_label: 'SYSTÈME',
      tags: ['erreur', 'réseau'],
      answer: "Désolé, je n'ai pas pu joindre le serveur. Veuillez réessayer."
    },
    isClient: false
  }
}

/**
 * Formate les messages historiques depuis une conversation API
 * 
 * @param {Array} apiMessages - Messages bruts de l'API
 * @returns {Array} - Messages formatés (user + AI intercalés)
 */
export function formatHistoricalMessages(apiMessages) {
  // Formater les messages IA
  const formattedMessages = apiMessages.map((msg, index) => ({
    id: msg.id || index,
    data: {
      label: msg.label || 'SYSTÈME',
      sub_label: msg.sub_label || 'HISTORIQUE',
      tags: msg.tags || [],
      contexts: msg.contexts || [],
      confidence: msg.confidence !== undefined ? msg.confidence : 50,
      file: msg.file || [],
      answer: msg.response
    },
    isClient: false
  }))

  // Ajouter les messages utilisateurs
  const userMessages = apiMessages.map((msg, index) => ({
    id: `user-${msg.id || index}`,
    text: msg.question,
    isClient: true
  }))

  // Intercaler utilisateur + IA
  const interleaved = []
  for (let i = 0; i < formattedMessages.length; i++) {
    if (userMessages[i]) interleaved.push(userMessages[i])
    interleaved.push(formattedMessages[i])
  }

  return interleaved
}
