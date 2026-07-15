import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiMicLine, RiStopLine, RiRefreshLine, RiVolumeUpLine,
  RiTimeLine, RiStarLine, RiCheckDoubleLine, RiAlertLine
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { challengesAPI, voiceAPI } from '../../api'

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([])
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [result, setResult] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    loadChallenges()
    return () => stopTimer()
  }, [])

  const loadChallenges = async () => {
    try {
      const { data } = await challengesAPI.getAll()
      setChallenges(data)
    } catch {
      toast.error('Failed to load challenges')
    }
  }

  const startTimer = (limit) => {
    setTimer(limit)
    timerRef.current = setInterval(() => {
      setTimer(p => {
        if (p <= 1) {
          stopTimer()
          stopRecording()
          return 0
        }
        return p - 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startRecording = async () => {
    if (!selectedChallenge) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await evaluateResponse(audioBlob)
      }

      mediaRecorderRef.current.start()
      setRecording(true)
      startTimer(selectedChallenge.duration_seconds)
    } catch {
      toast.error('Microphone access is required')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setRecording(false)
      stopTimer()
    }
  }

  const evaluateResponse = async (blob) => {
    setLoading(true)
    try {
      // 1. Transcribe the audio responses first
      const transcribeRes = await voiceAPI.transcribe(blob)
      const transcript = transcribeRes.data.transcript

      if (!transcript.trim()) {
        toast.error("No speaking audio detected. Try again!")
        setLoading(false)
        return
      }

      // 2. Submit to evaluate speaking challenges endpoint
      const { data } = await challengesAPI.evaluate({
        transcript,
        topic: selectedChallenge.topic,
        duration_seconds: selectedChallenge.duration_seconds
      })
      setResult(data)
    } catch {
      toast.error('Failed to analyze your challenge response')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">Speaking Challenges</h1>
        <p className="text-white/40 text-sm mt-1">Select a topic, speak continuously, and get evaluated by Sky</p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedChallenge ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {challenges.map(c => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedChallenge(c)
                  setResult(null)
                }}
                className="glass-card p-6 border border-white/5 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between min-h-48"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge badge-violet text-[9px] uppercase font-bold">{c.challenge_type}</span>
                  </div>
                  <h3 className="text-white font-bold text-base leading-tight">{c.topic}</h3>
                  <p className="text-white/40 text-xs mt-2 line-clamp-2">{c.description}</p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-white/30 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1"><RiTimeLine /> {c.duration_seconds}s Limit</span>
                  <span className="flex items-center gap-1"><RiStarLine /> {c.xp_reward} XP</span>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 space-y-6 max-w-2xl mx-auto"
          >
            {/* Header info */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <span className="badge badge-violet text-[10px] uppercase mb-1">{selectedChallenge.challenge_type}</span>
                <h3 className="text-white font-bold text-lg">{selectedChallenge.topic}</h3>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-white/40 hover:text-white text-xs"
              >
                ← Back
              </button>
            </div>

            <p className="text-white/70 text-xs bg-white/5 p-4 rounded-xl border border-white/5 leading-relaxed">
              {selectedChallenge.description}
            </p>

            {/* Visual visualizer / loading timer */}
            <div className="flex flex-col items-center gap-4 py-4">
              {recording ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white animate-pulse">
                    <RiStopLine className="w-6 h-6" onClick={stopRecording} />
                  </div>
                  <span className="text-white font-mono font-bold text-lg bg-red-500/20 px-4 py-1 border border-red-500/30">
                    Remaining: {timer}s
                  </span>
                </>
              ) : loading ? (
                <div className="text-center py-6">
                  <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-white/40">Evaluating your responses...</span>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  className="btn-primary p-4 rounded-full flex items-center justify-center shadow-glow"
                >
                  <RiMicLine className="w-6 h-6" />
                  <span className="text-xs font-semibold pr-2">Start Challenge</span>
                </button>
              )}
            </div>

            {/* Result Evaluations summary */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-6 border-t border-white/5 text-xs"
                >
                  <div className="grid grid-cols-5 gap-2 text-center font-bold">
                    {[
                      { l: 'Overall', v: result.overall_score, c: 'text-violet-400' },
                      { l: 'Grammar', v: result.grammar_score, c: 'text-red-400' },
                      { l: 'Fluency', v: result.fluency_score, c: 'text-green-400' },
                      { l: 'Vocabulary', v: result.vocabulary_score, c: 'text-blue-400' },
                      { l: 'Confidence', v: result.confidence_score, c: 'text-yellow-400' }
                    ].map(item => (
                      <div key={item.l} className="glass-card p-2">
                        <p className={`text-base ${item.c}`}>{item.v}</p>
                        <p className="text-white/40 text-[9px] mt-0.5">{item.l}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl p-4 space-y-2">
                    <p className="text-white font-semibold">Evaluation feedback 🌤</p>
                    <p className="text-white/80 leading-relaxed">{result.feedback}</p>
                  </div>

                  {result.improvements && result.improvements.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-white font-semibold">Key Improvements suggested:</p>
                      <div className="space-y-1.5">
                        {result.improvements.map((imp, idx) => (
                          <div key={idx} className="flex gap-2 items-start text-white/60 leading-relaxed bg-white/5 border border-white/5 p-2 rounded-lg">
                            <span className="text-yellow-400 flex-shrink-0">✦</span>
                            <span>{imp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedChallenge(null)
                      setResult(null)
                    }}
                    className="btn-primary w-full py-3"
                  >
                    Done & Back to List
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
