import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '../../api'
import { useAuth } from '../../contexts/AuthContext'

export default function OTPVerifyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const email = location.state?.email || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const refs = useRef([])

  useEffect(() => {
    if (!email) navigate('/signup')
    const t = setInterval(() => setCountdown(p => (p > 0 ? p - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  const handleChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    const next = Array(6).fill('')
    text.split('').forEach((c, i) => { next[i] = c })
    setOtp(next)
    refs.current[Math.min(text.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter all 6 digits')
    setLoading(true)
    try {
      const { data } = await authAPI.verifyOtp({ email, otp: code })
      await login(data.access_token, data.refresh_token)
      toast.success('Email verified! Welcome to Sky 🌤️')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setResending(true)
    try {
      await authAPI.resendOtp({ email })
      toast.success('New OTP sent!')
      setCountdown(60)
    } catch {
      toast.error('Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4">
      <div className="orb orb-1 top-20 left-10" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Verify Your Email</h1>
          <p className="text-white/40 text-sm">
            We sent a 6-digit code to<br />
            <span className="text-violet-400">{email}</span>
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                className="otp-input"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                id={`otp-${i}`}
                inputMode="numeric"
              />
            ))}
          </div>

          <button onClick={handleVerify} disabled={loading} className="btn-primary w-full py-3.5 mb-4">
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Verify & Continue'}
          </button>

          <div className="text-center">
            <span className="text-white/40 text-sm">Didn't receive it? </span>
            {countdown > 0
              ? <span className="text-white/30 text-sm">Resend in {countdown}s</span>
              : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                >
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
          </div>

          <p className="text-center text-white/30 text-xs mt-4">
            <Link to="/signup" className="hover:text-white/60">← Back to Signup</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
