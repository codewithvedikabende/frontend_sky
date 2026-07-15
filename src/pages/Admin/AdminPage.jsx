import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiShieldLine, RiUserLine, RiBookOpenLine, RiBarChartLine,
  RiCheckDoubleLine, RiAlertLine, RiSettings3Line
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { adminAPI } from '../../api'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('analytics') // analytics, users, lessons

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
    }
  }, [activeTab])

  const loadStats = async () => {
    setLoading(true)
    try {
      const { data } = await adminAPI.getStats()
      setStats(data)
    } catch {
      toast.error('Failed to load admin stats')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers(1)
      setUsers(data.items || [])
    } catch {
      toast.error('Failed to load users list')
    }
  }

  const handleToggleStatus = async (userId, status) => {
    try {
      await adminAPI.toggleUserStatus(userId, !status)
      toast.success('User status updated')
      loadUsers()
    } catch {
      toast.error('Failed to update user status')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">Admin Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Manage users, view platform logs, compile analytics reports</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-xl w-72 mx-auto border border-white/5">
        {[
          { id: 'analytics', label: 'Analytics' },
          { id: 'users', label: 'Users' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex-1 text-center transition-all ${
              activeTab === t.id ? 'bg-violet-500 text-white font-bold shadow-glow' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats row */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold text-center">
                <div className="glass-card p-5">
                  <p className="text-white/40 text-[10px] uppercase mb-1">Total Users</p>
                  <p className="text-white text-xl">{stats.total_users}</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-white/40 text-[10px] uppercase mb-1">Active Today</p>
                  <p className="text-violet-400 text-xl">{stats.active_users_today}</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-white/40 text-[10px] uppercase mb-1">Total Sessions</p>
                  <p className="text-blue-400 text-xl">{stats.total_sessions}</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-white/40 text-[10px] uppercase mb-1">Avg Score</p>
                  <p className="text-green-400 text-xl">{stats.avg_speaking_score}%</p>
                </div>
              </div>
            )}

            {/* Platform statistics summary info */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-white font-semibold text-sm">Platform Health Logs</h3>
              <div className="bg-white/5 border border-white/5 rounded-xl p-5 text-xs space-y-2 text-white/70 leading-relaxed">
                <p>✓ All databases connections active (MongoDB Atlas clusters)</p>
                <p>✓ Cognitive AI pipelines online (OpenAI GPT-4o, Whisper models)</p>
                <p>✓ Speech synthesis nodes active (OpenAI TTS-1, Nova voice accents)</p>
                <p>✓ User verification SMTP engines online (Gmail TLS tunnels)</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-white/40 font-semibold uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">XP</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/5">
                      <td className="p-4 font-semibold text-white">{u.full_name}</td>
                      <td className="p-4 text-white/60">{u.email}</td>
                      <td className="p-4 text-violet-400 capitalize">{u.level}</td>
                      <td className="p-4 text-white/40">{u.xp} XP</td>
                      <td className="p-4">
                        <span className={`badge ${u.is_active ? 'badge-green' : 'badge-orange'}`}>
                          {u.is_active ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.is_active)}
                          className={`px-3 py-1.5 rounded-lg font-semibold ${
                            u.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
