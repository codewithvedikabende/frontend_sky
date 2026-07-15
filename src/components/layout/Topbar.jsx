import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { RiMenuLine, RiNotification3Line, RiMoonLine } from 'react-icons/ri'
import { useAuth } from '../../contexts/AuthContext'

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/chat': 'Chat with Sky',
  '/voice': 'Voice Conversation',
  '/pronunciation': 'Pronunciation Analysis',
  '/grammar': 'Grammar Correction',
  '/vocabulary': 'Vocabulary Builder',
  '/lessons': 'Daily Lessons',
  '/challenges': 'Speaking Challenges',
  '/scenarios': 'Real-Life Scenarios',
  '/mock-interview': 'Mock Interview',
  '/quizzes': 'Quizzes',
  '/leaderboard': 'Leaderboard',
  '/profile': 'My Profile',
  '/admin': 'Admin Panel',
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const title = routeTitles[pathname] || 'Sky'

  return (
    <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between glass border-b border-white/5">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden btn-ghost p-2"
          aria-label="Toggle sidebar"
        >
          <RiMenuLine className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-white font-display font-bold text-lg leading-none">{title}</h2>
          <p className="text-white/40 text-xs mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* XP badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-violet-500/20">
          <span className="text-yellow-400 text-sm">⚡</span>
          <span className="text-white text-sm font-semibold">{user?.xp || 0} XP</span>
        </div>

        {/* Streak */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-orange-500/20">
          <span className="text-sm">🔥</span>
          <span className="text-white text-sm font-semibold">{user?.streak || 0}</span>
        </div>

        {/* Notification */}
        <button className="btn-ghost relative p-2">
          <RiNotification3Line className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
        </button>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-gradient-primary overflow-hidden flex items-center justify-center text-sm font-bold border-2 border-violet-500/30 hover:border-violet-500/60 transition-colors"
        >
          {user?.avatar
            ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            : user?.full_name?.[0]?.toUpperCase() || 'U'}
        </button>
      </div>
    </header>
  )
}
