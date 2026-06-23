'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AuthCard, FormButton, OTPInput } from '@/components/auth'
import { Logo, ErrorAlert } from '@/components/shared'
import LoadingIndicator2 from '@/components/chat/LoadingIndicator2'
import { verifyMFAAction, skipMFAAction, getMFAEnrollmentAction } from '@/app/actions/auth'

export default function MFAClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [setupMode, setSetupMode] = useState(false)
  const [verificationMode, setVerificationMode] = useState(false)
  const [userId, setUserId] = useState(null)
  const [hasMFA, setHasMFA] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [secret, setSecret] = useState(null)
  const [code, setCode] = useState('')
  const [showSkip, setShowSkip] = useState(false)
  const enrollCalled = useRef(false)

  useEffect(() => {
    const userIdParam = searchParams.get('user_id')
    const hasMFAParam = searchParams.get('has_mfa') === 'true'
    const mfaVerified = searchParams.get('mfa_verified') === 'true'

    if (!userIdParam) {
      router.push('/login')
      return
    }

    setUserId(userIdParam)
    setHasMFA(hasMFAParam)
    
    if (hasMFAParam && !mfaVerified) {
      setVerificationMode(true)
      setSetupMode(false)
      setShowSkip(false)
    } else if (!hasMFAParam) {
      setSetupMode(true)
      setVerificationMode(false)
      setShowSkip(true)
      if (!enrollCalled.current) {
        enrollCalled.current = true
        enrollMFA()
      }
    } else {
      router.push('/chat')
    }

    setLoading(false)
  }, [searchParams, router])

  const enrollMFA = async () => {
    try {
      const data = await getMFAEnrollmentAction()
      if (data.error) throw new Error(data.error)
      
      setQrCode(data.qr_code)
      setSecret(data.secret)
    } catch (error) {
      setError(error.message || "Erreur lors de l'inscription MFA")
    }
  }

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Le code doit contenir 6 chiffres')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('code', code)
    formData.append('userAgent', window.navigator.userAgent)

    const result = await verifyMFAAction(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    setError(null)
    const result = await skipMFAAction()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (loading && !qrCode) {
    return (
      <AuthCard>
        <Logo />
        <div className='w-full flex items-center justify-center text-orange-500'>
          <LoadingIndicator2/>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <Logo />
      
      <ErrorAlert error={error} />
      
      {setupMode && (
        <div className="text-center flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Configurer l'authentification à deux facteurs
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            Scannez ce code QR avec votre application d'authentification
          </p>
          
          {qrCode && (
            <div className="mb-4 w-fit flex justify-center rounded-2xl p-2 bg-white">
              <img 
                src={qrCode} 
                alt="Code QR TOTP"
                className="w-32 h-32"
              />
            </div>
          )}
          
          {secret && (
            <div className="mb-4 text-xs text-neutral-500 text-center">
              <p>Clé secrète: {secret}</p>
            </div>
          )}
          
          <OTPInput value={code} onChange={setCode} disabled={loading} />
          
          <FormButton 
            type="button" 
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="mt-6"
          >
            {loading ? 'Vérification...' : 'Vérifier et activer'}
          </FormButton>
          
          {showSkip && (
            <button
              type="button"
              onClick={handleSkip}
              className="cursor-pointer mt-4 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Passer l'authentification à deux facteurs
            </button>
          )}
        </div>
      )}
      
      {verificationMode && (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Vérification à deux facteurs
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            Entrez le code à 6 chiffres de votre application
          </p>
          
          <OTPInput value={code} onChange={setCode} disabled={loading} />
          
          <FormButton 
            type="button" 
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="mt-6"
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </FormButton>
        </div>
      )}
    </AuthCard>
  )
}