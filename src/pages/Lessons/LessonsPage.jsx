import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiPlayLine, RiBookOpenLine, RiCheckLine, RiStarLine,
  RiArrowRightLine, RiTimeLine, RiCloseLine
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { lessonsAPI } from '../../api'

export default function LessonsPage() {
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all') // all, reading, listening, speaking, grammar
  const [loading, setLoading] = useState(false)

  // Lesson flow/quiz state
  const [activeStep, setActiveStep] = useState('reading') // reading, quiz
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [quizFinished, setQuizFinished] = useState(false)

  useEffect(() => {
    loadLessons()
  }, [activeFilter])

  const loadLessons = async () => {
    setLoading(true)
    try {
      const params = {}
      if (activeFilter !== 'all') params.category = activeFilter
      const { data } = await lessonsAPI.getAll(params)
      setLessons(data.items || [])
    } catch {
      toast.error('Failed to load lessons')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenLesson = async (id) => {
    try {
      const { data } = await lessonsAPI.getOne(id)
      setSelectedLesson(data)
      setActiveStep('reading')
      setSelectedAnswer(null)
      setQuizFinished(false)
    } catch {
      toast.error('Failed to load lesson details')
    }
  }

  const handleCompleteLesson = async () => {
    if (!selectedLesson) return
    try {
      const { data } = await lessonsAPI.complete(selectedLesson.id)
      toast.success(data.message || 'Lesson completed!')
      setSelectedLesson(null)
      loadLessons()
    } catch {
      toast.error('Failed to mark lesson completed')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">Daily Lessons</h1>
        <p className="text-white/40 text-sm mt-1">Complete structured daily lessons to earn XP and level up</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar max-w-lg mx-auto">
        {['all', 'reading', 'listening', 'speaking', 'grammar', 'vocabulary'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
              activeFilter === cat
                ? 'bg-violet-500 border-violet-500 text-white shadow-glow'
                : 'bg-white/5 border-white/5 text-white/40 hover:text-white/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map(l => (
          <div
            key={l.id}
            onClick={() => handleOpenLesson(l.id)}
            className="glass-card p-5 cursor-pointer border border-white/5 hover:scale-[1.02] transition-all flex flex-col justify-between h-48"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="badge badge-violet text-[9px] uppercase font-bold">{l.category}</span>
                {l.is_completed && <span className="text-green-400 text-xs">✓ Completed</span>}
              </div>
              <h3 className="text-white font-bold text-base leading-snug line-clamp-2">{l.title}</h3>
              <p className="text-white/40 text-xs mt-2 line-clamp-2">{l.description}</p>
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/30 pt-3 border-t border-white/5">
              <span className="flex items-center gap-1"><RiTimeLine /> {l.duration_minutes}m</span>
              <span className="flex items-center gap-1"><RiStarLine /> {l.xp_reward} XP</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lesson View Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 flex justify-between items-start">
                <div>
                  <span className="badge badge-violet text-[10px] uppercase mb-1">{selectedLesson.category}</span>
                  <h3 className="text-white font-display font-bold text-lg leading-tight">{selectedLesson.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="text-white/40 hover:text-white p-1"
                >
                  <RiCloseLine className="w-6 h-6" />
                </button>
              </div>

              {/* Content Panel */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeStep === 'reading' ? (
                  <div className="space-y-4 text-xs leading-relaxed text-white/80">
                    <p className="text-white font-semibold text-sm">Read the passage below:</p>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl whitespace-pre-line">
                      {selectedLesson.content?.reading || "This lesson details grammar syntax, practical speak-out methods, and rules definition."}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-white font-semibold text-sm">Answer this question to finish:</p>
                    <p className="text-white/85 text-xs">{selectedLesson.content?.quiz_question || "What is the primary theme of this passage?"}</p>
                    
                    <div className="space-y-2">
                      {selectedLesson.content?.options?.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedAnswer(i)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                            selectedAnswer === i
                              ? 'bg-violet-500/20 border-violet-500 text-white'
                              : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {opt}
                        </button>
                      )) || (
                        ['Syntax rules', 'Pronunciation accents', 'Writing style'].map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedAnswer(i)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                              selectedAnswer === i
                                ? 'bg-violet-500/20 border-violet-500 text-white'
                                : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {opt}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-black/10">
                {activeStep === 'reading' ? (
                  <button
                    onClick={() => setActiveStep('quiz')}
                    className="btn-primary py-2 px-6 flex items-center gap-1 text-xs"
                  >
                    <span>Proceed to Quiz</span>
                    <RiArrowRightLine />
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteLesson}
                    disabled={selectedAnswer === null}
                    className="btn-primary py-2 px-6 flex items-center gap-1 text-xs disabled:opacity-50"
                  >
                    <RiCheckLine />
                    <span>Complete Lesson</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
