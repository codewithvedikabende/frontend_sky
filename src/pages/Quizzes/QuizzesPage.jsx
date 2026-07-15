import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiBarChartHorizontalLine, RiTimeLine, RiStarLine, RiCheckLine,
  RiRefreshLine, RiFileList3Line
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { quizzesAPI } from '../../api'

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [activeTab, setActiveTab] = useState('list') // list, history
  const [loading, setLoading] = useState(false)

  // Quiz taking state
  const [answers, setAnswers] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [quizResult, setQuizResult] = useState(null)

  useEffect(() => {
    loadQuizzes()
    loadAttempts()
  }, [])

  const loadQuizzes = async () => {
    setLoading(true)
    try {
      const { data } = await quizzesAPI.getAll()
      setQuizzes(data)
    } catch {
      toast.error('Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const loadAttempts = async () => {
    try {
      const { data } = await quizzesAPI.getMyAttempts()
      setAttempts(data || [])
    } catch {
      toast.error('Failed to load quiz history')
    }
  }

  const handleStartQuiz = async (id) => {
    try {
      const { data } = await quizzesAPI.getOne(id)
      setSelectedQuiz(data)
      setAnswers(Array(data.questions.length).fill(-1))
      setCurrentIdx(0)
      setStartTime(Date.now())
      setQuizResult(null)
    } catch {
      toast.error('Failed to load quiz questions')
    }
  }

  const handleSelectOption = (optIdx) => {
    const next = [...answers]
    next[currentIdx] = optIdx
    setAnswers(next)
  }

  const handleNext = () => {
    if (answers[currentIdx] === -1) {
      toast.error('Please select an option before proceeding')
      return
    }
    if (currentIdx < selectedQuiz.questions.length - 1) {
      setCurrentIdx(p => p + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const handleSubmitQuiz = async () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    try {
      const { data } = await quizzesAPI.submit(selectedQuiz.id, {
        quiz_id: selectedQuiz.id,
        answers,
        time_taken_seconds: timeTaken
      })
      setQuizResult(data)
      loadAttempts()
    } catch {
      toast.error('Failed to submit answers')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">English Quizzes</h1>
        <p className="text-white/40 text-sm mt-1">Test your English speaking, grammar, and vocabulary skills</p>
      </div>

      <div className="flex gap-2 bg-white/5 p-1 rounded-xl w-60 mx-auto border border-white/5">
        {[
          { id: 'list', label: 'Quizzes List' },
          { id: 'history', label: 'My Attempts' }
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
        {activeTab === 'list' ? (
          !selectedQuiz ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {quizzes.map(q => (
                <div
                  key={q.id}
                  onClick={() => handleStartQuiz(q.id)}
                  className="glass-card p-5 border border-white/5 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between min-h-44"
                >
                  <div>
                    <span className="badge badge-violet text-[9px] uppercase mb-2">{q.category}</span>
                    <h3 className="text-white font-bold text-base leading-snug">{q.title}</h3>
                    <p className="text-white/40 text-xs mt-1 capitalize">{q.level} level</p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/30 pt-3 border-t border-white/5 mt-4">
                    <span className="flex items-center gap-1"><RiTimeLine /> {q.time_limit_seconds / 60}m</span>
                    <span className="flex items-center gap-1"><RiStarLine /> {q.xp_reward} XP</span>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : quizResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center max-w-md mx-auto space-y-6"
            >
              <div className="text-6xl">🏆</div>
              <h2 className="text-white font-display font-black text-2xl">Quiz Completed!</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-white/40 text-xs">Your Score</p>
                  <p className="text-white font-bold text-lg mt-1">{quizResult.score}%</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-white/40 text-xs">XP Earned</p>
                  <p className="text-violet-400 font-bold text-lg mt-1">+{quizResult.xp_earned}</p>
                </div>
              </div>
              <p className="text-white/70 text-xs italic">"{quizResult.feedback}"</p>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="btn-primary w-full py-3"
              >
                Back to Quizzes List
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 max-w-lg mx-auto space-y-6"
            >
              <div className="flex justify-between text-xs text-white/40 pb-4 border-b border-white/5">
                <span>QUESTION {currentIdx + 1}/{selectedQuiz.questions.length}</span>
                <span>LEVEL: {selectedQuiz.level.toUpperCase()}</span>
              </div>

              <div className="space-y-2">
                <p className="text-white font-semibold text-sm leading-relaxed">
                  {selectedQuiz.questions[currentIdx].question}
                </p>
              </div>

              <div className="space-y-3">
                {selectedQuiz.questions[currentIdx].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    className={`w-full text-left p-4 rounded-xl border text-xs leading-relaxed transition-all ${
                      answers[currentIdx] === i
                        ? 'bg-violet-500/20 border-violet-500 text-white'
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-white/5 mt-4">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(p => p - 1)}
                  className="btn-secondary py-2 px-5 text-xs disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="btn-primary py-2 px-6 text-xs"
                >
                  {currentIdx === selectedQuiz.questions.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </motion.div>
          )
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {attempts.length === 0 ? (
              <div className="text-center py-12 text-white/30 text-sm">
                You haven't attempted any quizzes yet.
              </div>
            ) : (
              attempts.map((a, idx) => (
                <div key={idx} className="glass-card p-5 flex justify-between items-center border border-white/5 text-xs">
                  <div>
                    <h4 className="text-white font-bold text-sm">Attempted Quiz</h4>
                    <p className="text-white/40 mt-1">Score: {a.score}% ({a.correct}/{a.total} correct)</p>
                  </div>
                  <span className="text-violet-400 font-semibold">+{a.xp_earned} XP</span>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
