import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiMicLine, RiStopLine, RiVolumeUpLine, RiCheckDoubleLine,
  RiRefreshLine, RiArrowRightLine, RiAlertLine
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { voiceAPI } from '../../api'

const sampleSentences = [
  "Continuous learning is the key to mastering any language.",
  "Sky helps English learners improve their pronunciation and grammar.",
  "She sells seashells by the seashore.",
  "Practice makes perfect when it comes to communication skills.",
  "Would you like to try a cup of coffee or tea this morning?"
]

export default function PronunciationPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioPlayerRef = useRef(null)

  const sentence = sampleSentences[currentIndex]

  const handleNext = () => {
    setCurrentIndex(p => (p + 1) % sampleSentences.length)
    setResult(null)
    setAudioUrl(null)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioUrl(URL.createObjectURL(audioBlob))
        await analyzeSpeech(audioBlob)
      }

      mediaRecorderRef.current.start()
      setRecording(true)
    } catch {
      toast.error('Microphone access is required')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setRecording(false)
    }
  }

  const analyzeSpeech = async (blob) => {
    setLoading(true)
    try {
      const { data } = await voiceAPI.analyzePronunciation(blob, sentence)
      setResult(data)
    } catch {
      toast.error('Failed to analyze pronunciation')
    } finally {
      setLoading(false)
    }
  }

  const playReference = async () => {
    try {
      const res = await voiceAPI.synthesize(sentence, 'nova')
      const url = URL.createObjectURL(res.data)
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = url
        audioPlayerRef.current.play()
      }
    } catch {
      toast.error('Failed to load pronunciation audio')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">Pronunciation Analysis</h1>
        <p className="text-white/40 text-sm mt-1">Read the sentence aloud to test your clarity</p>
      </div>

      <div className="glass-card p-8 space-y-8 relative overflow-hidden">
        {/* Top actions */}
        <div className="flex justify-between items-center text-xs text-white/40">
          <span>PRACTICE SENTENCE {currentIndex + 1}/{sampleSentences.length}</span>
          <div className="flex gap-2">
            <button onClick={playReference} className="flex items-center gap-1 hover:text-white transition-colors">
              <RiVolumeUpLine /> Play Guide
            </button>
            <button onClick={handleNext} className="flex items-center gap-1 hover:text-white transition-colors">
              <RiRefreshLine /> Change
            </button>
          </div>
        </div>

        {/* Display sentence */}
        <div className="text-center py-6 px-4 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-white text-xl font-medium font-display leading-relaxed">{sentence}</p>
        </div>

        {/* Recording actions */}
        <div className="flex flex-col items-center gap-4">
          {recording ? (
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white border-4 border-red-500/20 hover:scale-105 transition-all shadow-glow"
            >
              <RiStopLine className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={loading}
              className="w-16 h-16 rounded-full bg-gradient-primary hover:scale-105 transition-all flex items-center justify-center text-white shadow-glow disabled:opacity-50"
            >
              <RiMicLine className="w-6 h-6" />
            </button>
          )}
          <span className="text-xs text-white/30">
            {recording ? 'Recording... Stop when done' : loading ? 'Analyzing your pronunciation...' : 'Tap microfone to start speaking'}
          </span>
        </div>

        <audio ref={audioPlayerRef} className="hidden" />

        {/* Pronunciation Results Analysis */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-6 border-t border-white/5"
            >
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Overall Score', val: result.overall_score, color: 'text-violet-400' },
                  { label: 'Accuracy', val: result.accuracy_score, color: 'text-blue-400' },
                  { label: 'Fluency', val: result.fluency_score, color: 'text-green-400' },
                  { label: 'Completeness', val: result.completeness_score, color: 'text-yellow-400' }
                ].map(({ label, val, color }) => (
                  <div key={label} className="glass-card p-3">
                    <p className={`font-display font-black text-lg ${color}`}>{val}/100</p>
                    <p className="text-white/40 text-[10px] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Word-level review */}
              <div className="space-y-2">
                <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Word Analysis:</span>
                <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-xl border border-white/5">
                  {result.words?.map((w, i) => (
                    <span
                      key={i}
                      className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-all ${
                        w.correct
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                      title={w.correct ? 'Correct' : `You said: ${w.spoken || 'N/A'}`}
                    >
                      {w.word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sky Feedback */}
              <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl p-4 space-y-2">
                <p className="text-white text-sm font-semibold">Sky's feedback 🌤️</p>
                <p className="text-white/80 text-xs leading-relaxed">{result.feedback}</p>
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="pt-2 space-y-1">
                    {result.suggestions.map((s, idx) => (
                      <p key={idx} className="text-white/50 text-[11px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
                        {s}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
              >
                <span>Try Another Sentence</span>
                <RiArrowRightLine />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
