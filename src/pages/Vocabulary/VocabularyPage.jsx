import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiStarLine, RiStarFill, RiSearch2Line, RiRefreshLine,
  RiQuestionLine, RiCheckLine, RiBookmarkLine, RiVolumeUpLine
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { vocabularyAPI, voiceAPI } from '../../api'

export default function VocabularyPage() {
  const [dailyWords, setDailyWords] = useState([])
  const [allWords, setAllWords] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [activeTab, setActiveTab] = useState('daily') // daily, search, bookmarks, quiz
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [selectedWord, setSelectedWord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [flippedWord, setFlippedWord] = useState(null)

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [quizFinished, setQuizFinished] = useState(false)

  useEffect(() => {
    loadDailyWords()
    loadBookmarks()
  }, [])

  useEffect(() => {
    if (activeTab === 'search') {
      loadAllWords()
    }
  }, [activeTab, searchQuery, levelFilter])

  const loadDailyWords = async () => {
    setLoading(true)
    try {
      const { data } = await vocabularyAPI.getDailyWords()
      setDailyWords(data)
    } catch {
      toast.error('Failed to load daily words')
    } finally {
      setLoading(false)
    }
  }

  const loadAllWords = async () => {
    try {
      const params = {}
      if (levelFilter) params.level = levelFilter
      if (searchQuery) params.search = searchQuery
      const { data } = await vocabularyAPI.listWords(params)
      setAllWords(data.items || [])
    } catch {
      toast.error('Failed to load words list')
    }
  }

  const loadBookmarks = async () => {
    try {
      const { data } = await vocabularyAPI.getBookmarks()
      setBookmarks(data)
    } catch {
      toast.error('Failed to load bookmarks')
    }
  }

  const handleToggleBookmark = async (w, e) => {
    if (e) e.stopPropagation()
    try {
      const res = await vocabularyAPI.toggleBookmark(w.id)
      const isBookmarked = res.data.bookmarked
      toast.success(isBookmarked ? 'Added to Bookmarks' : 'Removed from Bookmarks')
      loadBookmarks()
      // Update local state
      setDailyWords(prev => prev.map(item => item.id === w.id ? { ...item, is_bookmarked: isBookmarked } : item))
      setAllWords(prev => prev.map(item => item.id === w.id ? { ...item, is_bookmarked: isBookmarked } : item))
    } catch {
      toast.error('Failed to bookmark word')
    }
  }

  const handlePlayVoice = async (word, e) => {
    if (e) e.stopPropagation()
    try {
      const res = await voiceAPI.synthesize(word, 'nova')
      const url = URL.createObjectURL(res.data)
      const player = new Audio(url)
      player.play()
    } catch {
      toast.error('Failed to play pronunciation audio')
    }
  }

  // Quiz helper
  const startQuiz = () => {
    const list = dailyWords.length > 0 ? dailyWords : bookmarks
    if (list.length < 3) {
      toast.error('You need at least 3 bookmarked or daily words to start a quiz!')
      return
    }
    const questions = list.map((w, idx) => {
      const others = list.filter(item => item.id !== w.id)
      const shuffledOthers = others.sort(() => 0.5 - Math.random()).slice(0, 3)
      const options = [w.meaning, ...shuffledOthers.map(o => o.meaning)].sort(() => 0.5 - Math.random())
      return {
        word: w.word,
        correct: w.meaning,
        options
      }
    })
    setQuizQuestions(questions)
    setCurrentQuizIdx(0)
    setScore(0)
    setSelectedOption(null)
    setQuizFinished(false)
    setQuizStarted(true)
  }

  const handleSelectOption = (opt) => {
    if (selectedOption !== null) return
    setSelectedOption(opt)
    if (opt === quizQuestions[currentQuizIdx].correct) {
      setScore(p => p + 1)
      toast.success('Correct!')
    } else {
      toast.error('Wrong answer!')
    }
  }

  const handleNextQuiz = () => {
    if (currentQuizIdx < quizQuestions.length - 1) {
      setCurrentQuizIdx(p => p + 1)
      setSelectedOption(null)
    } else {
      setQuizFinished(true)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">Vocabulary Builder</h1>
        <p className="text-white/40 text-sm mt-1">Learn new words daily, bookmark for study, and quiz yourself</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-xl max-w-md mx-auto border border-white/5">
        {[
          { id: 'daily', label: 'Daily Words' },
          { id: 'search', label: 'Explore' },
          { id: 'bookmarks', label: 'Bookmarks' },
          { id: 'quiz', label: 'Practice Quiz' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id)
              setQuizStarted(false)
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex-1 text-center transition-all ${
              activeTab === t.id ? 'bg-violet-500 text-white font-bold shadow-glow' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'daily' && (
          <motion.div
            key="daily"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {dailyWords.map((w) => (
              <div
                key={w.id}
                onClick={() => setFlippedWord(flippedWord === w.id ? null : w.id)}
                className="glass-card p-6 min-h-60 flex flex-col justify-between cursor-pointer border border-white/5 relative hover:scale-[1.02] transition-all"
              >
                <div className="flex justify-between items-start">
                  <span className="badge badge-violet text-[10px] uppercase">{w.level}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handlePlayVoice(w.word, e)}
                      className="text-white/40 hover:text-white p-1"
                    >
                      <RiVolumeUpLine className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleToggleBookmark(w, e)}
                      className="text-white/40 hover:text-yellow-400 p-1"
                    >
                      {w.is_bookmarked ? <RiStarFill className="text-yellow-400 w-4 h-4" /> : <RiStarLine className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {flippedWord === w.id ? (
                  <div className="flex-1 flex flex-col justify-center text-center space-y-2 mt-4">
                    <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Meaning:</p>
                    <p className="text-white text-sm leading-relaxed">{w.meaning}</p>
                    {w.example && <p className="text-white/50 text-xs italic mt-2">"{w.example}"</p>}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center text-center space-y-1">
                    <h3 className="text-white font-display font-black text-2xl">{w.word}</h3>
                    {w.pronunciation && <p className="text-white/40 text-xs">/{w.pronunciation}/</p>}
                    <p className="text-white/20 text-[10px] mt-2">TAP TO FLIP</p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <RiSearch2Line className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search words..."
                  className="input-field pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="input-field max-w-44"
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allWords.map((w) => (
                <div
                  key={w.id}
                  className="glass-card p-5 flex flex-col justify-between border border-white/5"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-white font-bold text-lg">{w.word}</h4>
                    <button
                      onClick={(e) => handleToggleBookmark(w, e)}
                      className="text-white/40 hover:text-yellow-400"
                    >
                      {w.is_bookmarked ? <RiStarFill className="text-yellow-400 w-4 h-4" /> : <RiStarLine className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-white/60 text-xs line-clamp-2">{w.meaning}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'bookmarks' && (
          <motion.div
            key="bookmarks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {bookmarks.map((w) => (
              <div
                key={w.id}
                className="glass-card p-5 border border-white/5 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-bold text-lg">{w.word}</h4>
                  <button
                    onClick={(e) => handleToggleBookmark(w, e)}
                    className="text-yellow-400 hover:text-white/40"
                  >
                    <RiStarFill className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-white/70 text-xs mb-2">{w.meaning}</p>
                {w.example && <p className="text-white/40 text-[10px] italic">"{w.example}"</p>}
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
            {!quizStarted ? (
              <div className="glass-card p-8 text-center space-y-6">
                <span className="text-6xl">📝</span>
                <h3 className="text-white font-display font-bold text-lg">Vocabulary Practice Quiz</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Test your memory of recent daily words or bookmarks. Multiple choice options will be generated.
                </p>
                <button onClick={startQuiz} className="btn-primary w-full py-3">
                  Start Quiz
                </button>
              </div>
            ) : quizFinished ? (
              <div className="glass-card p-8 text-center space-y-6">
                <span className="text-6xl">🏆</span>
                <h3 className="text-white font-display font-bold text-xl">Quiz Complete!</h3>
                <p className="text-white/60">You scored {score}/{quizQuestions.length}</p>
                <button onClick={startQuiz} className="btn-primary w-full py-3">
                  Retake Quiz
                </button>
              </div>
            ) : (
              <div className="glass-card p-8 space-y-6">
                <div className="flex justify-between text-xs text-white/40">
                  <span>QUESTION {currentQuizIdx + 1}/{quizQuestions.length}</span>
                  <span>SCORE: {score}</span>
                </div>

                <div className="text-center py-4">
                  <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">What is the meaning of:</p>
                  <h3 className="text-white font-display font-black text-3xl mt-2">{quizQuestions[currentQuizIdx].word}</h3>
                </div>

                <div className="space-y-3">
                  {quizQuestions[currentQuizIdx].options.map((opt, i) => {
                    const isSelected = selectedOption === opt
                    const isCorrect = opt === quizQuestions[currentQuizIdx].correct
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left p-4 rounded-xl border text-xs leading-relaxed transition-all ${
                          selectedOption !== null
                            ? isCorrect
                              ? 'bg-green-500/20 border-green-500/40 text-green-400'
                              : isSelected
                              ? 'bg-red-500/20 border-red-500/40 text-red-400'
                              : 'bg-white/5 border-white/5 text-white/30'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-violet-500/30'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {selectedOption !== null && (
                  <button
                    onClick={handleNextQuiz}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                  >
                    <span>{currentQuizIdx === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
