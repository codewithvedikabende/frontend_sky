import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiUserVoiceLine, RiRestaurantLine, RiFlightTakeoffLine,
  RiHotelLine, RiCustomerService2Line, RiMessage3Line
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import ChatPage from '../Chat/ChatPage' // reuse message handling inside scenario or build custom light chat inline

const scenarioList = [
  { id: 'restaurant', title: 'At the Restaurant', role: 'Waiter', icon: RiRestaurantLine, desc: 'Practice ordering food, asking for recommendations, and billing details.' },
  { id: 'airport', title: 'Airport Check-in', role: 'Customs Officer', icon: RiFlightTakeoffLine, desc: 'Practice checking baggage, answering customs queries, and ticketing.' },
  { id: 'hotel', title: 'Hotel Reception', role: 'Receptionist', icon: RiHotelLine, desc: 'Practice room booking, handling room service requests, and check-out rules.' },
  { id: 'customer', title: 'Customer Support Call', role: 'Support Executive', icon: RiCustomerService2Line, desc: 'Practice complaining about a product, ordering refunds, and seeking support.' }
]

export default function ScenariosPage() {
  const [selectedScenario, setSelectedScenario] = useState(null)

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 h-full">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">Real-Life Scenarios</h1>
        <p className="text-white/40 text-sm mt-1">Practice roleplaying with Sky in day-to-day settings</p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedScenario ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {scenarioList.map(s => {
              const Icon = s.icon
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedScenario(s)}
                  className="glass-card p-6 border border-white/5 cursor-pointer hover:scale-[1.02] transition-all flex items-start gap-4 min-h-36"
                >
                  <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-base leading-tight">{s.title}</h3>
                    <p className="text-white/40 text-xs">Sky acts as: <span className="text-violet-400 font-semibold">{s.role}</span></p>
                    <p className="text-white/50 text-xs mt-2 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            key="scenario-chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col"
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3">
              <div>
                <h3 className="text-white font-bold text-lg">{selectedScenario.title}</h3>
                <p className="text-xs text-white/40">Sky is acting as the <span className="text-violet-400 font-bold">{selectedScenario.role}</span></p>
              </div>
              <button
                onClick={() => setSelectedScenario(null)}
                className="text-white/40 hover:text-white text-xs"
              >
                ← Change Scenario
              </button>
            </div>

            {/* Embed lightweight Chat interface */}
            <ChatPage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
