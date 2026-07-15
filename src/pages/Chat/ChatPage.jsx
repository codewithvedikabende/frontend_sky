import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiSendPlane2Fill, RiMicLine, RiAddLine, RiDeleteBin7Line,
  RiFileList3Line, RiInformationLine, RiCheckboxCircleLine
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { chatAPI, voiceAPI } from '../../api'
import { useAuth } from '../../contexts/AuthContext'

export default function ChatPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingReply, setStreamingReply] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (currentSessionId) {
      loadSessionMessages(currentSessionId)
    } else {
      setMessages([])
    }
  }, [currentSessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingReply])

  const loadSessions = async () => {
    try {
      const { data } = await chatAPI.getSessions()
      setSessions(data)
      if (data.length > 0 && !currentSessionId) {
        setCurrentSessionId(data[0].session_id)
      }
    } catch (err) {
      toast.error('Failed to load chat history')
    }
  }

  const loadSessionMessages = async (sid) => {
    try {
      const { data } = await chatAPI.getSession(sid)
      setMessages(data.messages || [])
    } catch {
      toast.error('Failed to load messages')
    }
  }

  const handleStartNewSession = () => {
    setCurrentSessionId(null)
    setMessages([])
    setInputText('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const userMessage = { role: 'user', content: inputText.trim() }
    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputText
    setInputText('')
    setLoading(true)

    try {
      const response = await chatAPI.sendMessage({
        message: messageToSend,
        session_id: currentSessionId,
        include_grammar_check: true,
        mode: 'conversation'
      })

      if (!currentSessionId) {
        setCurrentSessionId(response.data.session_id)
        loadSessions()
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.reply,
          corrections: response.data.grammar_corrections,
          vocabulary_tips: response.data.vocabulary_tips
        }
      ])
    } catch (err) {
      toast.error('Sky is currently busy. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (sid, e) => {
    e.stopPropagation()
    try {
      await chatAPI.deleteSession(sid)
      toast.success('Chat deleted')
      if (currentSessionId === sid) {
        setCurrentSessionId(null)
      }
      loadSessions()
    } catch {
      toast.error('Failed to delete chat')
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)] glass-card overflow-hidden">
      {/* Sessions Sidebar */}
      <div className={`w-64 border-r border-white/5 flex flex-col h-full bg-black/20 ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
        <div className="p-4 border-b border-white/5">
          <button
            onClick={handleStartNewSession}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2"
          >
            <RiAddLine />
            <span>New Session</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((s) => (
            <div
              key={s.session_id}
              onClick={() => setCurrentSessionId(s.session_id)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                currentSessionId === s.session_id
                  ? 'bg-gradient-to-r from-violet-600/30 to-blue-600/20 border border-violet-500/30'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{s.preview || 'Empty Chat'}</p>
                <p className="text-white/40 text-[10px] mt-1">
                  {new Date(s.updated_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteSession(s.session_id, e)}
                className="text-white/30 hover:text-red-400 p-1"
              >
                <RiDeleteBin7Line className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
              <span className="text-6xl mb-4 animate-float">🌤️</span>
              <h2 className="text-white font-display font-bold text-xl mb-2">Chat with Sky</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Hi! I am Sky, your English speaking tutor. Start typing or speak to me. I will respond and guide you to correct your grammar and build your vocabulary.
              </p>
            </div>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex gap-3 max-w-[80%]">
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center text-sm flex-shrink-0">
                    🌤️
                  </div>
                )}
                <div>
                  <div
                    className={
                      m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-sky'
                    }
                  >
                    <p>{m.content}</p>
                  </div>

                  {/* Grammar Corrections */}
                  {m.corrections && m.corrections.length > 0 && (
                    <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-red-400 font-semibold text-xs">
                        <RiInformationLine className="w-4 h-4" />
                        <span>Grammar Correction</span>
                      </div>
                      {m.corrections.map((c, i) => (
                        <div key={i} className="text-xs space-y-1.5">
                          <p className="text-white/50">Original: <span className="text-red-400 line-through">{c.original}</span></p>
                          <p className="text-white">Correct: <span className="text-green-400 font-semibold">{c.corrected}</span></p>
                          {c.rule && <p className="text-violet-300 font-medium">Rule: {c.rule}</p>}
                          {c.explanation && <p className="text-white/70">{c.explanation}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vocabulary Tips */}
                  {m.vocabulary_tips && m.vocabulary_tips.length > 0 && (
                    <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                        <RiCheckboxCircleLine className="w-4 h-4" />
                        <span>Vocabulary Tip</span>
                      </div>
                      {m.vocabulary_tips.map((v, i) => (
                        <div key={i} className="text-xs space-y-1">
                          <p className="text-white font-semibold">{v.word}</p>
                          <p className="text-white/60">Meaning: {v.meaning}</p>
                          {v.example && <p className="text-white/40 italic">"{v.example}"</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center text-sm flex-shrink-0 animate-spin-slow">
                  🌤️
                </div>
                <div className="chat-bubble-sky flex items-center gap-1.5 py-3.5 px-5">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-white/5 bg-black/10">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message to Sky..."
              className="input-field flex-1"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="btn-primary p-3 flex items-center justify-center"
            >
              <RiSendPlane2Fill className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
