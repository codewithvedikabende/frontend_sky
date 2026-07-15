import React, { createContext, useContext, useEffect, useState } from 'react'
import useAuthStore from '../store/authStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const store = useAuthStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token && !store.user) {
      store.fetchUser().finally(() => setInitialized(true))
    } else {
      setInitialized(true)
    }
  }, [])

  if (!initialized) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl animate-pulse-glow">
            🌤️
          </div>
          <p className="text-white/50 text-sm">Loading Sky...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
