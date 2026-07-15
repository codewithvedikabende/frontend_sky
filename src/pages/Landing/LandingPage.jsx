import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  RiMicLine, RiChat3Line, RiTrophyLine, RiBarChartLine,
  RiCheckLine, RiArrowRightLine, RiPlayCircleLine,
  RiStarFill, RiShieldCheckLine, RiGlobalLine
} from 'react-icons/ri'

const features = [
  { icon: '🎙️', title: 'Voice Conversations', desc: 'Speak naturally with Sky and get real-time feedback on your pronunciation and fluency.' },
  { icon: '✏️', title: 'Grammar Correction', desc: 'Sky politely corrects your mistakes and explains the grammar rules behind them.' },
  { icon: '📚', title: 'Vocabulary Builder', desc: 'Learn 5 new words daily with meanings, examples, synonyms, and quizzes.' },
  { icon: '🎯', title: 'Speaking Challenges', desc: 'Test yourself with timed speaking challenges on random topics and get AI evaluations.' },
  { icon: '💼', title: 'Mock Interviews', desc: 'Practice job interviews with Sky acting as different types of HR interviewers.' },
  { icon: '🌍', title: 'Real-Life Scenarios', desc: 'Simulate airport, hotel, restaurant conversations with Sky playing the character.' },
  { icon: '🏆', title: 'Gamification', desc: 'Earn XP, coins, badges, and climb the leaderboard while you learn.' },
  { icon: '📊', title: 'Progress Analytics', desc: 'Track your speaking, grammar, vocabulary, and pronunciation scores over time.' },
]

const testimonials = [
  { name: 'Rahul Sharma', role: 'Software Engineer', flag: '🇮🇳', rating: 5, text: 'Sky helped me prepare for my job interview in just 2 weeks. My confidence skyrocketed!' },
  { name: 'Maria Santos', role: 'Nursing Student', flag: '🇵🇭', rating: 5, text: 'The pronunciation analysis is incredible. I can finally hear exactly where I go wrong.' },
  { name: 'Ahmed Hassan', role: 'Business Analyst', flag: '🇪🇬', rating: 5, text: 'The grammar corrections are so polite and educational. I learned more in 1 month than 1 year of classes.' },
  { name: 'Li Wei', role: 'Graduate Student', flag: '🇨🇳', rating: 5, text: 'The real-life scenarios for airports and hospitals are exactly what I needed for my move abroad.' },
]

const stats = [
  { value: '50K+', label: 'Active Learners' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '4.9★', label: 'App Rating' },
  { value: '120+', label: 'Countries' },
]

const pricing = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: 'from-gray-500/20 to-gray-600/10',
    features: ['5 AI chats per day', 'Basic grammar correction', '3 vocabulary words daily', 'Voice transcription (5 min/day)'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    color: 'from-violet-600/30 to-blue-600/20',
    features: ['Unlimited AI conversations', 'Advanced grammar analysis', 'Daily vocabulary (unlimited)', 'Voice & pronunciation analysis', 'Speaking challenges', 'Mock interviews', 'Real-life scenarios', 'Progress analytics'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '$19',
    period: 'per month',
    color: 'from-yellow-600/20 to-orange-600/15',
    features: ['Everything in Pro', 'Personalized study plan', 'AI writing assistant', '1-on-1 lesson scheduling', 'Certificate of completion', 'Priority support'],
    cta: 'Go Premium',
    highlight: false,
  },
]

const faqs = [
  { q: 'Is Sky suitable for complete beginners?', a: 'Absolutely! Sky adapts to your level – from complete beginners who can barely form sentences to advanced speakers looking to polish their English.' },
  { q: 'How is Sky different from other language apps?', a: 'Sky uses GPT-4o for truly intelligent conversations. It corrects your grammar naturally during conversations, evaluates your pronunciation with Whisper AI, and provides personalized feedback – not just scripted exercises.' },
  { q: 'Can I practice speaking in Sky?', a: 'Yes! You can use your microphone to speak directly to Sky. Your voice is transcribed, Sky responds, and you can even receive audio responses from Sky.' },
  { q: 'Do I need an internet connection?', a: 'Yes, Sky requires an internet connection as it uses advanced AI models to process your speech and generate responses in real time.' },
  { q: 'Is my data secure?', a: 'Absolutely. All data is encrypted in transit and at rest. We never sell your personal data to third parties.' },
]

function Counter({ end, duration = 2 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const num = parseInt(end.replace(/[^0-9]/g, ''))
    const step = num / (duration * 60)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= num) { setCount(num); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [end])
  return <>{count}{end.replace(/[0-9]/g, '')}</>
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="animated-bg min-h-screen font-sans">
      {/* Ambient orbs */}
      <div className="orb orb-1 fixed top-20 -left-20" />
      <div className="orb orb-2 fixed top-1/3 right-0" />
      <div className="orb orb-3 fixed bottom-20 left-1/3" />

      {/* ── NAVBAR ─────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 px-6 py-4 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌤️</span>
            <span className="font-display font-bold text-xl text-white">Sky</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/signup" className="btn-primary text-sm py-2 px-5">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────── */}
      <section className="min-h-screen flex items-center pt-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center w-full">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="section-badge mb-6">
              ✨ AI-Powered English Learning
            </div>
            <h1 className="font-display font-black text-5xl lg:text-7xl text-white leading-tight mb-6">
              Speak English<br />
              <span className="gradient-text">Confidently</span><br />
              with Sky 🌤️
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed max-w-lg">
              Your personal AI English tutor available 24/7. Practice conversations, get grammar corrections, improve pronunciation, and track your progress with gamified learning.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary text-base py-3.5 px-8">
                Start Learning Free <RiArrowRightLine className="w-5 h-5" />
              </Link>
              <button className="btn-secondary text-base py-3.5 px-8">
                <RiPlayCircleLine className="w-5 h-5" /> Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-6 mt-8">
              {['No credit card', 'Free forever plan', '5 min setup'].map(t => (
                <div key={t} className="flex items-center gap-2 text-white/50 text-sm">
                  <RiCheckLine className="w-4 h-4 text-green-400" /> {t}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sky Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 blur-3xl animate-pulse-glow" />
              
              {/* Main avatar circle */}
              <div className="relative w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-gradient-primary glow-violet animate-float flex items-center justify-center">
                <div className="w-60 h-60 lg:w-80 lg:h-80 rounded-full glass flex items-center justify-center text-9xl">
                  🌤️
                </div>
              </div>

              {/* Floating bubbles */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 glass-card p-3 flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-lg">✓</div>
                <div>
                  <p className="text-white text-xs font-semibold">Grammar Fixed!</p>
                  <p className="text-white/40 text-xs">+10 XP earned</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 glass-card p-3 flex items-center gap-2"
              >
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-white text-xs font-semibold">Streak: 7 days</p>
                  <p className="text-white/40 text-xs">Keep it up! 🔥</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [3, -3, 3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-1/2 -right-12 glass-card p-3 flex items-center gap-2"
              >
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-white text-xs font-semibold">Score: 87/100</p>
                  <p className="text-white/40 text-xs">Pronunciation</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card text-center py-6"
            >
              <p className="font-display font-black text-3xl gradient-text-blue mb-1">{value}</p>
              <p className="text-white/50 text-sm">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="section-badge inline-flex">🚀 Everything You Need</div>
            <h2 className="font-display font-black text-4xl lg:text-5xl text-white mt-4 mb-4">
              Learn English the <span className="gradient-text">Smart Way</span>
            </h2>
            <p className="text-white/50 max-w-lg mx-auto">
              Sky combines the latest AI with proven language teaching methods to make learning English natural and effective.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card glass-card-hover p-6"
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────── */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="section-badge inline-flex">💬 What Learners Say</div>
            <h2 className="font-display font-black text-4xl text-white mt-4">
              Real <span className="gradient-text">Results</span>, Real People
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {testimonials.map(({ name, role, flag, rating, text }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, j) => <RiStarFill key={j} className="w-4 h-4 text-yellow-400" />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg">{flag}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-white/40 text-xs">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────── */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="section-badge inline-flex">💳 Simple Pricing</div>
            <h2 className="font-display font-black text-4xl text-white mt-4">
              Choose Your <span className="gradient-text">Plan</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map(({ name, price, period, color, features: fs, cta, highlight }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-6 bg-gradient-to-b ${color} relative ${highlight ? 'border-violet-500/40 scale-105' : ''}`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-white font-bold text-lg mb-2">{name}</h3>
                <div className="mb-4">
                  <span className="font-display font-black text-4xl text-white">{price}</span>
                  <span className="text-white/40 text-sm">/{period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {fs.map(f => (
                    <li key={f} className="flex items-center gap-2 text-white/70 text-sm">
                      <RiCheckLine className="w-4 h-4 text-green-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    highlight ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────── */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="section-badge inline-flex">❓ FAQ</div>
            <h2 className="font-display font-black text-4xl text-white mt-4">
              Got <span className="gradient-text">Questions?</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <motion.div
                key={q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-card overflow-hidden"
              >
                <button
                  className="w-full text-left p-5 flex justify-between items-center gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-white font-medium text-sm">{q}</span>
                  <span className={`text-white/40 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    className="px-5 pb-5"
                  >
                    <p className="text-white/50 text-sm leading-relaxed">{a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="glass-card p-12 bg-gradient-to-r from-violet-600/20 to-blue-600/15">
              <div className="text-6xl mb-6">🌤️</div>
              <h2 className="font-display font-black text-4xl text-white mb-4">
                Ready to Speak English <span className="gradient-text">Confidently?</span>
              </h2>
              <p className="text-white/50 mb-8">Join 50,000+ learners already improving with Sky. Start free today.</p>
              <Link to="/signup" className="btn-primary text-lg py-4 px-10 inline-flex">
                Start Your Free Journey <RiArrowRightLine className="w-6 h-6" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌤️</span>
              <span className="font-display font-bold text-xl text-white">Sky</span>
              <span className="text-white/30 text-sm">AI English Tutor</span>
            </div>
            <div className="flex gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-white/30 text-sm">© 2026 Sky AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
