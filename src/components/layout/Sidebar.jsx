import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import {
  RiDashboardLine, RiChat3Line, RiMicLine, RiSoundModuleLine,
  RiEdit2Line, RiBookOpenLine, RiPlayLine, RiGroupLine,
  RiUserLine, RiTrophyLine, RiBarChartLine, RiSettings3Line,
  RiLogoutBoxLine, RiShieldLine, RiFlashlightLine
} from 'react-icons/ri'
import { HiOutlineAcademicCap } from 'react-icons/hi'

const navItems = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/chat', icon: RiChat3Line, label: 'Chat with Sky' },
  { to: '/voice', icon: RiMicLine, label: 'Voice Conversation' },
  { to: '/pronunciation', icon: RiSoundModuleLine, label: 'Pronunciation' },
  { to: '/grammar', icon: RiEdit2Line, label: 'Grammar' },
  { to: '/vocabulary', icon: RiBookOpenLine, label: 'Vocabulary' },
  { to: '/lessons', icon: RiPlayLine, label: 'Lessons' },
  { to: '/challenges', icon: RiFlashlightLine, label: 'Challenges' },
  { to: '/scenarios', icon: RiGroupLine, label: 'Scenarios' },
  { to: '/mock-interview', icon: HiOutlineAcademicCap, label: 'Mock Interview' },
  { to: '/quizzes', icon: RiBarChartLine, label: 'Quizzes' },
  { to: '/leaderboard', icon: RiTrophyLine, label: 'Leaderboard' },
]

const bottomItems = [
  { to: '/profile', icon: RiUserLine, label: 'Profile' },
  { to: '/admin', icon: RiShieldLine, label: 'Admin' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const level = user?.level || 'beginner'
  const xp = user?.xp || 0
  const maxXp = level === 'beginner' ? 500 : level === 'intermediate' ? 2000 : 5000
  const xpPct = Math.min((xp / maxXp) * 100, 100)

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-xl animate-pulse-glow">
          🌤️
        </div>
        <div>
          <h1 className="text-white font-display font-bold text-lg leading-none">Sky</h1>
          <p className="text-white/40 text-xs">AI English Tutor</p>
        </div>
      </div>

      {/* User card */}
      {user && (
        <div className="glass-card p-3 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold overflow-hidden">
              {user.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : user.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.full_name}</p>
              <p className="text-white/40 text-xs capitalize">{user.level}</p>
            </div>
            <span className="badge badge-violet text-xs">{user.streak || 0}🔥</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-white/30 text-xs">{xp} XP</span>
            <span className="text-white/30 text-xs">{maxXp} XP</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-4 pt-4 border-t border-white/5 space-y-0.5">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <RiLogoutBoxLine className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Sky coin display */}
      <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪙</span>
          <div>
            <p className="text-white text-sm font-semibold">{user?.coins || 0} Coins</p>
            <p className="text-white/40 text-xs">Keep learning!</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
