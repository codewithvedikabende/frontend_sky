import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiEdit2Line, RiHistoryLine, RiCheckDoubleLine, RiAlertLine,
  RiArrowRightLine, RiFileList3Line
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { grammarAPI } from '../../api'

export default function GrammarPage() {
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('check') // check, history

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory()
    }
  }, [activeTab])

  const loadHistory = async () => {
    try {
      const { data } = await grammarAPI.getHistory(1)
      setHistory(data.items || [])
    } catch {
      toast.error('Failed to load grammar history')
    }
  }

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    setLoading(true)
    setResult(null)
    try {
      const { data } = await grammarAPI.correct(inputText)
      setResult(data)
    } catch {
      toast.error('Failed to analyze grammar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">Grammar Correction</h1>
        <p className="text-white/40 text-sm mt-1">Check your grammar rules, learn definitions, and practice correct phrasing</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-xl w-60 mx-auto border border-white/5">
        {[
          { id: 'check', label: 'Grammar Check', icon: RiEdit2Line },
          { id: 'history', label: 'History Log', icon: RiHistoryLine }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold flex-1 justify-center transition-all ${
              activeTab === t.id ? 'bg-violet-500 text-white font-bold shadow-glow' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <t.icon />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'check' ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="glass-card p-6 space-y-4">
              <form onSubmit={handleCheck} className="space-y-4">
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block font-semibold uppercase tracking-wider">Your Sentence / Paragraph</label>
                  <textarea
                    placeholder="Type or paste your English text here to check grammar rules..."
                    className="input-field min-h-32 resize-none"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    disabled={loading}
                    maxLength={2000}
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-white/30">
                    <span>MAX 2000 CHARS</span>
                    <span>{inputText.length}/2000</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <RiCheckDoubleLine className="w-5 h-5" />
                      <span>Check Grammar</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results display */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Original vs corrected */}
                    <div className="glass-card p-5 border-l-4 border-red-500/50 space-y-2">
                      <p className="text-red-400 font-semibold text-xs uppercase tracking-wider">Original Text</p>
                      <p className="text-white/80 text-sm leading-relaxed">{result.original}</p>
                    </div>

                    <div className="glass-card p-5 border-l-4 border-green-500/50 space-y-2">
                      <p className="text-green-400 font-semibold text-xs uppercase tracking-wider">Corrected Text</p>
                      <p className="text-white text-sm leading-relaxed">{result.corrected}</p>
                    </div>
                  </div>

                  {/* Corrections & explanations */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="text-white font-semibold text-sm">Detailed Analysis:</h3>
                    {result.corrections && result.corrections.length > 0 ? (
                      <div className="space-y-4">
                        {result.corrections.map((c, i) => (
                          <div key={i} className="bg-white/5 rounded-xl border border-white/5 p-4 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="badge badge-violet">{c.rule || 'Grammar Rule'}</span>
                              {c.category && <span className="badge badge-blue">{c.category}</span>}
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 pt-2">
                              <p className="text-white/50">Mistake: <span className="text-red-400 font-semibold line-through">{c.original}</span></p>
                              <p className="text-white">Correction: <span className="text-green-400 font-semibold">{c.corrected}</span></p>
                            </div>
                            {c.explanation && <p className="text-white/70 leading-relaxed pt-1.5 border-t border-white/5 mt-1.5">{c.explanation}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-green-400 flex flex-col items-center gap-2">
                        <span className="text-4xl">🎉</span>
                        <p className="font-semibold text-sm">Perfect Grammar! No errors detected.</p>
                      </div>
                    )}
                  </div>

                  {/* Practice Example */}
                  {result.practice_example && (
                    <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl p-5 space-y-2">
                      <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Practice Example:</h4>
                      <p className="text-white/80 text-sm italic">"{result.practice_example}"</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {history.length === 0 ? (
              <div className="text-center py-12 text-white/30 text-sm">
                No grammar checks performed yet.
              </div>
            ) : (
              history.map((h, i) => (
                <div key={h.id} className="glass-card p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs text-white/40">
                    <span>LOG ENTRY</span>
                    <span>{new Date(h.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-red-400 line-through text-xs">{h.original}</p>
                    <p className="text-green-400 font-medium text-xs">{h.corrected}</p>
                  </div>
                  {h.corrections && h.corrections.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {h.corrections.map((c, idx) => (
                        <span key={idx} className="badge badge-violet text-[10px]">{c.rule}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
