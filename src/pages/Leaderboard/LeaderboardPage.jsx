import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RiTrophyLine, RiMedalLine, RiFireLine } from 'react-icons/ri'
import toast from 'react-hot-toast'
import { leaderboardAPI } from '../../api'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const { data } = await leaderboardAPI.get()
      setLeaderboard(data || [])
    } catch {
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">Global Leaderboard</h1>
        <p className="text-white/40 text-sm mt-1">Climb the ranks and compete with learners worldwide</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        {/* Top 3 podium highlight */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 pb-6 border-b border-white/5 items-end pt-4">
            {/* 2nd place */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-500/20 border border-slate-400/30 flex items-center justify-center text-lg font-bold text-slate-300 mx-auto">
                {leaderboard[1].avatar
                  ? <img src={leaderboard[1].avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  : '2'}
              </div>
              <p className="text-white text-xs font-semibold truncate">{leaderboard[1].username}</p>
              <span className="badge badge-blue text-[9px]">{leaderboard[1].xp} XP</span>
            </div>

            {/* 1st place */}
            <div className="text-center space-y-2 pb-2">
              <div className="relative">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl">👑</span>
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center text-xl font-bold text-yellow-300 mx-auto glow-violet">
                  {leaderboard[0].avatar
                    ? <img src={leaderboard[0].avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    : '1'}
                </div>
              </div>
              <p className="text-white text-sm font-black truncate">{leaderboard[0].username}</p>
              <span className="badge badge-violet text-[10px]">{leaderboard[0].xp} XP</span>
            </div>

            {/* 3rd place */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-700/20 border border-amber-600/30 flex items-center justify-center text-lg font-bold text-amber-500 mx-auto">
                {leaderboard[2].avatar
                  ? <img src={leaderboard[2].avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  : '3'}
              </div>
              <p className="text-white text-xs font-semibold truncate">{leaderboard[2].username}</p>
              <span className="badge badge-orange text-[9px]">{leaderboard[2].xp} XP</span>
            </div>
          </div>
        )}

        {/* List of other ranks */}
        <div className="space-y-2.5">
          {leaderboard.map((u) => (
            <div
              key={u.user_id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                u.is_current_user
                  ? 'bg-gradient-to-r from-violet-600/30 to-blue-600/20 border-violet-500/40 shadow-glow'
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 text-center text-white/40 text-xs font-bold font-mono">
                  {u.rank}
                </span>
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0">
                  {u.avatar
                    ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                    : u.username?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-bold truncate flex items-center gap-1.5">
                    <span>{u.username}</span>
                    {u.is_current_user && <span className="text-[10px] text-violet-400 font-bold font-sans">(You)</span>}
                  </p>
                  <p className="text-white/40 text-[10px] uppercase mt-0.5">{u.level}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] text-white/40">
                  <RiFireLine className="text-orange-500" />
                  <span>{u.streak || 0}</span>
                </div>
                <span className="text-white font-bold text-xs font-mono">{u.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
