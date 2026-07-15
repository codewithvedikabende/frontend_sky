import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiUserLine, RiAwardLine, RiBookmarkLine, RiAwardFill,
  RiCameraLine, RiTrophyLine, RiFireLine, RiTimeLine
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { userAPI, vocabularyAPI } from '../../api'
import { useAuth } from '../../contexts/AuthContext'

export default function ProfilePage() {
  const { user, fetchUser } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [activeTab, setActiveTab] = useState('achievements') // achievements, bookmarks, certificate
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [username, setUsername] = useState(user?.username || '')
  const [level, setLevel] = useState(user?.level || 'beginner')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAchievements()
    loadBookmarks()
  }, [])

  const loadAchievements = async () => {
    try {
      const { data } = await userAPI.getAchievements()
      setAchievements(data || [])
    } catch {
      toast.error('Failed to load achievements')
    }
  }

  const loadBookmarks = async () => {
    try {
      const { data } = await vocabularyAPI.getBookmarks()
      setBookmarks(data || [])
    } catch {
      toast.error('Failed to load bookmarked vocabulary')
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await userAPI.uploadAvatar(file)
      await fetchUser()
      toast.success('Avatar updated successfully')
    } catch {
      toast.error('Failed to upload avatar')
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await userAPI.updateMe({ full_name: fullName, username, level })
      await fetchUser()
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">Profile & Progress</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account information, inspect certificates and bookmarks</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Card - User info & Edit */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex flex-col items-center gap-3 relative">
            <div className="w-24 h-24 rounded-full bg-gradient-primary border-4 border-violet-500/20 relative group overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                  {user?.full_name?.[0]?.toUpperCase()}
                </div>
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                <RiCameraLine className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="text-center">
              <h2 className="text-white font-bold text-lg leading-tight">{user?.full_name}</h2>
              <p className="text-white/40 text-xs">@{user?.username}</p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-3">
            {!editing ? (
              <>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">English Level</span>
                  <span className="text-violet-400 font-semibold capitalize">{user?.level}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Streak Count</span>
                  <span className="text-orange-400 font-semibold">{user?.streak || 0} 🔥</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">User Role</span>
                  <span className="text-blue-400 font-semibold uppercase">{user?.role}</span>
                </div>
                <button onClick={() => setEditing(true)} className="btn-secondary w-full py-2 text-xs font-semibold">
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div>
                  <label className="text-white/50 text-[10px] uppercase font-semibold">Full Name</label>
                  <input className="input-field mt-1 py-2 text-xs" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="text-white/50 text-[10px] uppercase font-semibold">Username</label>
                  <input className="input-field mt-1 py-2 text-xs" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div>
                  <label className="text-white/50 text-[10px] uppercase font-semibold">Level</label>
                  <select className="input-field mt-1 py-2 text-xs" value={level} onChange={e => setLevel(e.target.value)}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary py-2 px-4 text-xs flex-1">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary py-2 px-4 text-xs flex-1">Save</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right side - Tabs of achievements, bookmarks, certificate */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'achievements', label: 'Achievements', icon: RiAwardLine },
              { id: 'bookmarks', label: 'Bookmarks', icon: RiBookmarkLine },
              { id: 'certificate', label: 'Certificate', icon: RiAwardFill }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold flex-1 justify-center transition-all ${
                  activeTab === t.id ? 'bg-violet-500 text-white font-bold shadow-glow' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <t.icon />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {achievements.map((a) => (
                  <div
                    key={a.id}
                    className={`glass-card p-4 flex gap-3 border transition-all ${
                      a.earned ? 'border-violet-500/20 bg-violet-500/5' : 'border-white/5 opacity-50'
                    }`}
                  >
                    <div className="text-3xl flex-shrink-0">{a.icon || '🏆'}</div>
                    <div className="space-y-1">
                      <h4 className="text-white font-bold text-xs">{a.name}</h4>
                      <p className="text-white/50 text-[10px] leading-relaxed">{a.description}</p>
                      <span className={`badge text-[9px] ${a.earned ? 'badge-violet' : 'badge-orange'}`}>
                        {a.earned ? 'Earned' : 'Locked'}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'bookmarks' && (
              <motion.div
                key="bookmarks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {bookmarks.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-white/30 text-xs">
                    No bookmarked words found. Visit the vocabulary page to bookmark words.
                  </div>
                ) : (
                  bookmarks.map((w) => (
                    <div key={w.id} className="glass-card p-4 border border-white/5 flex flex-col justify-between text-xs">
                      <div>
                        <h4 className="text-white font-bold text-sm">{w.word}</h4>
                        <p className="text-white/60 text-[10px] mt-1">{w.meaning}</p>
                      </div>
                      {w.example && <p className="text-white/30 text-[9px] italic mt-2">"{w.example}"</p>}
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'certificate' && (
              <motion.div
                key="certificate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-8 text-center space-y-6 max-w-md mx-auto"
              >
                <div className="text-6xl animate-float">📜</div>
                <h3 className="text-white font-display font-black text-lg">Sky Tutor Certificate</h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  Earn a Certificate of Completion once you finish all Daily Lessons and reach Advanced level!
                </p>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40">Lesson progress</span>
                    <span className="text-white font-semibold">{user?.total_lessons || 0} complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Required level</span>
                    <span className="text-white font-semibold">Advanced</span>
                  </div>
                </div>
                <button disabled className="btn-primary w-full py-3 disabled:opacity-30 text-xs">
                  Generate Certificate (Locked)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
