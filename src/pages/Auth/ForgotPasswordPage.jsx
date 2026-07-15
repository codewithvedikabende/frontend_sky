import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '../../api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      toast.success('Reset code sent to your email!')
      setStep(2)
    } catch { toast.error('Failed to send reset code') }
    finally { setLoading(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!otp || !newPassword) return toast.error('Fill all fields')
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      await authAPI.resetPassword({ email, otp, new_password: newPassword })
      toast.success('Password reset! Please sign in.')
      navigate('/login')
    } catch (err) { toast.error(err.response?.data?.detail || 'Reset failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4">
      <div className="orb orb-1 top-10 right-10" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{step === 1 ? '🔑' : '🔒'}</div>
          <h1 className="font-display font-bold text-2xl text-white mb-2">
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h1>
          <p className="text-white/40 text-sm">
            {step === 1 ? "No worries! We'll send you a reset code." : `Enter the code sent to ${email}`}
          </p>
        </div>

        <div className="glass-card p-8">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Email Address</label>
                <input type="email" placeholder="you@example.com" className="input-field"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Reset Code (6 digits)</label>
                <input placeholder="123456" className="input-field" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">New Password</label>
                <input type="password" placeholder="Min. 8 characters" className="input-field"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-white/40 text-sm mt-6">
            <Link to="/login" className="text-violet-400 hover:text-violet-300">← Back to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
