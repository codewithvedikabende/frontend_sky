import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const access = searchParams.get('access_token')
    const refresh = searchParams.get('refresh_token')
    if (access && refresh) {
      login(access, refresh).then(() => {
        toast.success('Signed in with Google! 🌤️')
        navigate('/dashboard')
      })
    } else {
      toast.error('Authentication failed')
      navigate('/login')
    }
  }, [])

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🌤️</div>
        <p className="text-white/60">Signing you in...</p>
      </div>
    </div>
  )
}
