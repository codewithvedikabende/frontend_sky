import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiEyeLine, RiEyeOffLine, RiGoogleFill, RiCheckLine } from 'react-icons/ri'
import toast from 'react-hot-toast'
import { authAPI } from '../../api'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = [
    { label: 'Uppercase', ok: /[A-Z]/.test(form.password) },
    { label: 'Number', ok: /[0-9]/.test(form.password) },
    { label: '8+ chars', ok: form.password.length >= 8 },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name || !form.username || !form.email || !form.password) {
      return toast.error('Please fill all fields')
    }
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      await authAPI.signup(form)
      toast.success('Account created! Check your email for the OTP. 📧')
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4 py-8">
      <div className="orb orb-1 top-10 left-10" />
      <div className="orb orb-2 bottom-10 right-10" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-4xl">🌤️</span>
            <span className="font-display font-black text-2xl text-white">Sky</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Create Your Account</h1>
          <p className="text-white/40 text-sm">Start your English learning journey with Sky</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Full Name</label>
              <input
                placeholder="John Smith"
                className="input-field"
                value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Username</label>
              <input
                placeholder="johnsmith"
                className="input-field"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input-field"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="input-field pr-12"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPw ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
                </button>
              </div>

              {/* Password strength */}
              {form.password && (
                <div className="flex gap-4 mt-2">
                  {strength.map(({ label, ok }) => (
                    <div key={label} className={`flex items-center gap-1 text-xs ${ok ? 'text-green-400' : 'text-white/30'}`}>
                      <RiCheckLine className="w-3 h-3" /> {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button onClick={() => authAPI.googleLogin()} className="btn-secondary w-full py-3 flex items-center justify-center gap-3">
            <RiGoogleFill className="w-5 h-5 text-red-400" />
            <span>Sign up with Google</span>
          </button>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
