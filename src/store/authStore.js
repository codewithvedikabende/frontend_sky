import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userAPI } from '../api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setTokens: (access, refresh) => {
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        set({ accessToken: access, refreshToken: refresh })
      },

      setUser: (user) => set({ user }),

      login: async (access, refresh) => {
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        set({ accessToken: access, refreshToken: refresh, isLoading: true })
        try {
          const { data } = await userAPI.getMe()
          set({ user: data, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },

      fetchUser: async () => {
        set({ isLoading: true })
        try {
          const { data } = await userAPI.getMe()
          set({ user: data, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, accessToken: null, refreshToken: null })
      },

      isAuthenticated: () => {
        return !!localStorage.getItem('access_token')
      },
    }),
    {
      name: 'sky-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)

export default useAuthStore
