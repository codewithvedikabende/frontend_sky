import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, RadialLinearScale, ArcElement,
  Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Bar, Radar } from 'react-chartjs-2'
import { useAuth } from '../../contexts/AuthContext'
import { progressAPI, userAPI } from '../../api'
import {
  RiFireLine, RiTrophyLine, RiChat3Line, RiMicLine,
  RiFlashlightLine, RiBarChartLine, RiArrowRightLine,
  RiCalendarLine, RiBookOpenLine
} from 'react-icons/ri'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, RadialLinearScale, ArcElement, Tooltip, Legend, Filler
)

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } } },
  },
}

const days7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const quickActions = [
  { to: '/chat', icon: RiChat3Line, label: 'Chat with Sky', color: 'from-violet-600/30 to-violet-700/20', badge: 'AI' },
  { to: '/voice', icon: RiMicLine, label: 'Voice Practice', color: 'from-blue-600/30 to-blue-700/20', badge: 'Live' },
  { to: '/challenges', icon: RiFlashlightLine, label: 'Challenge', color: 'from-orange-600/30 to-orange-700/20', badge: 'XP' },
  { to: '/quizzes', icon: RiBarChartLine, label: 'Take Quiz', color: 'from-green-600/30 to-green-700/20', badge: 'Fun' },
]

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="stat-card flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-white/40 text-xs mb-0.5">{label}</p>
        <p className="text-white font-bold text-xl leading-none">{value}</p>
        {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([progressAPI.getStats(), userAPI.getDailyFeedback()])
      .then(([statsRes, feedbackRes]) => {
        setStats(statsRes.data)
        setFeedback(feedbackRes.data.feedback)
      })
      .finally(() => setLoading(false))
  }, [])

  const level = user?.level || 'beginner'
  const maxXp = level === 'beginner' ? 500 : level === 'intermediate' ? 2000 : 5000
  const xpPct = Math.min(((user?.xp || 0) / maxXp) * 100, 100)

  const lineData = {
    labels: days7,
    datasets: [{
      label: 'XP',
      data: stats?.weekly_xp || [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#8b5cf6',
      pointRadius: 4,
    }],
  }

  const radarData = {
    labels: ['Speaking', 'Grammar', 'Vocabulary', 'Pronunciation', 'Fluency'],
    datasets: [{
      data: [
        user?.speaking_score || 0,
        user?.grammar_score || 0,
        user?.vocabulary_score || 0,
        user?.pronunciation_score || 0,
        (user?.speaking_score || 0) * 0.9,
      ],
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      pointBackgroundColor: '#8b5cf6',
    }],
  }

  const radarOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0, max: 100,
        grid: { color: 'rgba(255,255,255,0.08)' },
        angleLines: { color: 'rgba(255,255,255,0.08)' },
        ticks: { display: false },
        pointLabels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } },
      },
    },
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-2xl text-white">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
          <span className="gradient-text">{user?.full_name?.split(' ')[0]}!</span> 👋
        </h1>
        <p className="text-white/40 text-sm mt-1">Let's continue your English journey today.</p>
      </motion.div>

      {/* Sky's Daily Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-5 border-l-4 border-violet-500 flex items-start gap-4"
        >
          <div className="text-3xl">🌤️</div>
          <div>
            <p className="text-white/40 text-xs mb-1 font-semibold uppercase tracking-wider">Sky's Daily Message</p>
            <p className="text-white/80 text-sm leading-relaxed">{feedback}</p>
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={RiFireLine} label="Day Streak" value={`${user?.streak || 0} 🔥`} sub="Keep it going!" color="from-orange-500/40 to-red-600/30" delay={0.1} />
        <StatCard icon={RiTrophyLine} label="Total XP" value={`${user?.xp || 0}`} sub={`${Math.round(xpPct)}% to next level`} color="from-yellow-500/40 to-orange-600/30" delay={0.15} />
        <StatCard icon={RiChat3Line} label="Sessions" value={user?.total_sessions || 0} sub="Total conversations" color="from-violet-500/40 to-purple-600/30" delay={0.2} />
        <StatCard icon={RiBookOpenLine} label="Lessons" value={user?.total_lessons || 0} sub="Completed" color="from-blue-500/40 to-indigo-600/30" delay={0.25} />
      </div>

      {/* Level progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-white font-semibold capitalize">{level}</span>
            <span className="text-white/40 text-sm ml-2">Level</span>
          </div>
          <span className="badge badge-violet">{user?.xp || 0} / {maxXp} XP</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${xpPct}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <p className="text-white/30 text-xs mt-2">{Math.round(maxXp - (user?.xp || 0))} XP to reach {level === 'beginner' ? 'Intermediate' : level === 'intermediate' ? 'Advanced' : 'Max'}</p>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ to, icon: Icon, label, color, badge }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Link
                to={to}
                className={`glass-card bg-gradient-to-br ${color} p-5 flex flex-col gap-3 hover:scale-105 transition-transform group block`}
              >
                <div className="flex justify-between items-start">
                  <Icon className="w-6 h-6 text-white" />
                  <span className="badge badge-violet text-xs">{badge}</span>
                </div>
                <span className="text-white font-medium text-sm">{label}</span>
                <RiArrowRightLine className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly XP */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h2 className="text-white font-semibold mb-4">Weekly XP</h2>
          <div className="h-48">
            <Line data={lineData} options={CHART_OPTS} />
          </div>
        </motion.div>

        {/* Skill Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
          <h2 className="text-white font-semibold mb-4">Skill Profile</h2>
          <div className="h-48">
            <Radar data={radarData} options={radarOpts} />
          </div>
        </motion.div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Speaking', score: user?.speaking_score || 0, color: '#8b5cf6' },
          { label: 'Grammar', score: user?.grammar_score || 0, color: '#0ea5e9' },
          { label: 'Vocabulary', score: user?.vocabulary_score || 0, color: '#10b981' },
          { label: 'Pronunciation', score: user?.pronunciation_score || 0, color: '#f59e0b' },
        ].map(({ label, score, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className="glass-card p-4 text-center"
          >
            <div className="relative inline-flex items-center justify-center w-16 h-16 mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={color} strokeWidth="2.5"
                  strokeDasharray={`${score} ${100 - score}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-white font-bold text-sm">{Math.round(score)}</span>
            </div>
            <p className="text-white/60 text-xs">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Daily Goals + Learning Time */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <RiCalendarLine /> Daily Goals
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Chat with Sky (5 messages)', done: (user?.total_sessions || 0) > 0 },
              { label: 'Practice pronunciation', done: (user?.pronunciation_score || 0) > 0 },
              { label: 'Learn 3 new words', done: false },
              { label: 'Complete 1 quiz', done: false },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 ${done ? 'bg-green-500 border-green-500' : 'border-white/20'}`}>
                  {done && '✓'}
                </div>
                <span className={`text-sm ${done ? 'text-white/40 line-through' : 'text-white/70'}`}>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="glass-card p-5">
          <h2 className="text-white font-semibold mb-4">Learning Stats</h2>
          <div className="space-y-4">
            {[
              { label: 'Total Learning Time', value: `${Math.round((user?.learning_time_minutes || 0) / 60)}h ${(user?.learning_time_minutes || 0) % 60}m` },
              { label: 'Badges Earned', value: `${user?.badges?.length || 0}` },
              { label: 'Coins Collected', value: `🪙 ${user?.coins || 0}` },
              { label: 'Current Level', value: level.charAt(0).toUpperCase() + level.slice(1) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-white/50 text-sm">{label}</span>
                <span className="text-white font-semibold text-sm">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
