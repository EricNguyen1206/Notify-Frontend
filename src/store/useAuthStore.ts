import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id: number
  email: string
  username: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  setToken: (token: string) => void
  setUser: (user: User) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (res.ok) {
          set({ token: data.token, isAuthenticated: true })
          await useAuthStore.getState().fetchProfile()
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      fetchProfile: async () => {
        const { token } = useAuthStore.getState()
        const res = await fetch('/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const user = await res.json()
        if (res.ok) set({ user })
      },

      setToken: (token: string) => set({ token }),
      setUser: (user: User) => set({ user }),
      setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
)
