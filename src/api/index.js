import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor – attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor – auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refresh })
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth API ─────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  googleLogin: () => { window.location.href = `${API_URL}/auth/google` },
}

// ─── User API ─────────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  uploadAvatar: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getDailyFeedback: () => api.get('/users/me/daily-feedback'),
  getStudyPlan: () => api.get('/users/me/study-plan'),
  getAchievements: () => api.get('/users/me/achievements'),
}

// ─── Chat API ─────────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getSessions: () => api.get('/chat/sessions'),
  getSession: (id) => api.get(`/chat/sessions/${id}`),
  deleteSession: (id) => api.delete(`/chat/sessions/${id}`),
}

// ─── Voice API ────────────────────────────────────────────────
export const voiceAPI = {
  transcribe: (audioBlob, filename = 'audio.webm') => {
    const form = new FormData()
    form.append('audio', audioBlob, filename)
    return api.post('/voice/transcribe', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  synthesize: (text, voice = 'nova') => {
    const form = new FormData()
    form.append('text', text)
    form.append('voice', voice)
    return api.post('/voice/synthesize', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
    })
  },
  analyzePronunciation: (audioBlob, referenceText) => {
    const form = new FormData()
    form.append('audio', audioBlob, 'audio.webm')
    form.append('reference_text', referenceText)
    return api.post('/voice/pronunciation', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getSessions: () => api.get('/voice/sessions'),
}

// ─── Grammar API ──────────────────────────────────────────────
export const grammarAPI = {
  correct: (text) => api.post('/grammar/correct', { text }),
  analyze: (text) => api.post('/grammar/analyze', { text }),
  getHistory: (page = 1) => api.get(`/grammar/history?page=${page}`),
}

// ─── Vocabulary API ───────────────────────────────────────────
export const vocabularyAPI = {
  getDailyWords: () => api.get('/vocabulary/daily'),
  listWords: (params = {}) => api.get('/vocabulary/', { params }),
  toggleBookmark: (wordId) => api.post(`/vocabulary/${wordId}/bookmark`),
  getBookmarks: () => api.get('/vocabulary/bookmarks'),
}

// ─── Lessons API ──────────────────────────────────────────────
export const lessonsAPI = {
  getAll: (params = {}) => api.get('/lessons/', { params }),
  getOne: (id) => api.get(`/lessons/${id}`),
  complete: (id) => api.post(`/lessons/${id}/complete`),
}

// ─── Quizzes API ──────────────────────────────────────────────
export const quizzesAPI = {
  getAll: (params = {}) => api.get('/quizzes/', { params }),
  getOne: (id) => api.get(`/quizzes/${id}`),
  submit: (quizId, data) => api.post(`/quizzes/${quizId}/submit`, data),
  getMyAttempts: () => api.get('/quizzes/me/attempts'),
}

// ─── Progress API ─────────────────────────────────────────────
export const progressAPI = {
  getStats: () => api.get('/progress/stats'),
  logSession: (durationMinutes) => api.post(`/progress/log-session?duration_minutes=${durationMinutes}`),
  getLeaderboardRank: () => api.get('/progress/leaderboard-rank'),
}

// ─── Leaderboard API ──────────────────────────────────────────
export const leaderboardAPI = {
  get: (limit = 50) => api.get(`/leaderboard/?limit=${limit}`),
}

// ─── Challenges API ───────────────────────────────────────────
export const challengesAPI = {
  getAll: () => api.get('/challenges/'),
  evaluate: (data) => api.post('/challenges/evaluate', null, { params: data }),
}

// ─── Admin API ────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
  toggleUserStatus: (userId, isActive) =>
    api.put(`/admin/users/${userId}/status?is_active=${isActive}`),
  getActivity: () => api.get('/admin/activity'),
}
