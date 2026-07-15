import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiUserStarLine, RiCodeBoxLine, RiSuitcaseLine, RiFeedbackLine
} from 'react-icons/ri'
import ChatPage from '../Chat/ChatPage'

const jobRoles = [
  { id: 'swe', title: 'Software Engineer', icon: RiCodeBoxLine, desc: 'Practice coding questions, system designs, problem solving, and behavioral HR rounds.' },
  { id: 'sales', title: 'Sales & BD Executive', icon: RiSuitcaseLine, desc: 'Practice sales pitches, customer handling, pricing negotiations, and conversion strategies.' },
  { id: 'support', title: 'Customer Success Specialist', icon: RiUserStarLine, desc: 'Practice complaint handling, communication styles, ticket resolutions, and empathy rounds.' }
]

export default function MockInterviewPage() {
  const [selectedRole, setSelectedRole] = useState(null)

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 h-full">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">Mock Interview Simulator</h1>
        <p className="text-white/40 text-sm mt-1">Select a career role and practice interviews with Sky</p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {jobRoles.map(j => {
              const Icon = j.icon
              return (
                <div
                  key={j.id}
                  onClick={() => setSelectedRole(j)}
                  className="glass-card p-6 border border-white/5 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between min-h-48"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center text-violet-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-white font-bold text-base leading-tight">{j.title}</h3>
                    <p className="text-white/50 text-xs leading-relaxed">{j.desc}</p>
                  </div>
                  <span className="text-[10px] text-violet-400 font-semibold mt-4">START INTERVIEW →</span>
                </div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            key="interview-chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col"
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3">
              <div>
                <h3 className="text-white font-bold text-lg">{selectedRole.title} Mock Interview</h3>
                <p className="text-xs text-white/40">Sky is acting as the HR interviewer</p>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-white/40 hover:text-white text-xs"
              >
                ← Choose Role
              </button>
            </div>

            <ChatPage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
