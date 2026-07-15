import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiMicLine, RiStopLine, RiVolumeUpLine, RiCloseLine,
  RiCheckLine, RiLoader4Line, RiVolumeMuteLine
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { voiceAPI, chatAPI } from '../../api'

export default function VoicePage() {
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [skyReply, setSkyReply] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const audioPlayerRef = useRef(null)

  useEffect(() => {
    return () => {
      stopTimer()
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startTimer = () => {
    setTimer(0)
    timerRef.current = setInterval(() => {
      setTimer(p => p + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
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
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        await handleProcessAudio(audioBlob)
      }

      mediaRecorderRef.current.start()
      setRecording(true)
      startTimer()
    } catch {
      toast.error('Microphone permission denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      // Stop all tracks on the stream to turn off the microphone light
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setRecording(false)
      stopTimer()
    }
  }

  const handleProcessAudio = async (blob) => {
    setLoading(true)
    try {
      // 1. Transcribe speech using Whisper
      const transcribeRes = await voiceAPI.transcribe(blob)
      const text = transcribeRes.data.transcript
      setTranscript(text)

      if (!text.trim()) {
        toast.error("I didn't hear anything. Try again!")
        setLoading(false)
        return
      }

      // 2. Send transcript to Sky chat
      const chatRes = await chatAPI.sendMessage({
        message: text,
        mode: 'conversation',
        include_grammar_check: true
      })
      const reply = chatRes.data.reply
      setSkyReply(reply)

      // 3. Synthesize voice if enabled
      if (voiceEnabled) {
        const ttsRes = await voiceAPI.synthesize(reply, 'nova')
        const ttsUrl = URL.createObjectURL(ttsRes.data)
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = ttsUrl
          audioPlayerRef.current.play()
        }
      }
    } catch (err) {
      toast.error('Failed to process voice')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6">
      <div className="text-center">
        <h1 className="font-display font-black text-2xl text-white">Voice Conversation</h1>
        <p className="text-white/40 text-sm mt-1">Talk to Sky using your voice and hear her speak</p>
      </div>

      <div className="glass-card p-8 flex flex-col items-center gap-8 min-h-[400px] justify-center relative overflow-hidden">
        {/* Toggle Voice responses */}
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`absolute top-4 right-4 p-2 rounded-xl border transition-all ${
            voiceEnabled
              ? 'bg-violet-500/20 border-violet-500/30 text-violet-400'
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
          title={voiceEnabled ? 'Mute Sky responses' : 'Unmute Sky responses'}
        >
          {voiceEnabled ? <RiVolumeUpLine className="w-5 h-5" /> : <RiVolumeMuteLine className="w-5 h-5" />}
        </button>

        {/* Audio Visualizer / Status Area */}
        <div className="h-32 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {recording ? (
              <motion.div
                key="recording"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-end gap-1.5 h-16"
              >
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="wave-bar"
                    style={{
                      height: `${Math.random() * 80 + 20}%`,
                      animationDelay: `${i * 0.1}s`,
                      width: '6px'
                    }}
                  />
                ))}
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-violet-400"
              >
                <RiLoader4Line className="w-12 h-12" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white/30 text-sm"
              >
                🌤️ Ready. Tap the mic to speak to Sky.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timer display */}
        {recording && (
          <div className="text-white font-mono font-bold text-lg bg-red-500/20 px-4 py-1.5 rounded-full border border-red-500/30 animate-pulse">
            {formatTime(timer)}
          </div>
        )}

        {/* Record Button */}
        <div className="flex justify-center">
          {recording ? (
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white border-4 border-red-500/20 hover:scale-105 transition-all shadow-glow"
            >
              <RiStopLine className="w-8 h-8" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={loading}
              className="w-20 h-20 rounded-full bg-gradient-primary hover:scale-105 transition-all flex items-center justify-center text-white shadow-glow"
            >
              <RiMicLine className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Hidden Audio Player for TTS */}
        <audio ref={audioPlayerRef} className="hidden" />

        {/* Display transcriptions & responses */}
        <AnimatePresence>
          {(transcript || skyReply) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-4 pt-6 border-t border-white/5"
            >
              {transcript && (
                <div className="space-y-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">You said:</span>
                  <p className="text-white text-sm bg-white/5 p-3 rounded-xl border border-white/5">{transcript}</p>
                </div>
              )}
              {skyReply && (
                <div className="space-y-1">
                  <span className="text-[10px] text-violet-400 uppercase tracking-wider font-semibold">Sky replied:</span>
                  <p className="text-white text-sm bg-violet-500/10 p-3 rounded-xl border border-violet-500/20">
                    {skyReply}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
