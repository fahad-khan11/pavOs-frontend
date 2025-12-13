"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, getStoredUser, logout as authLogout } from "@/lib/auth"
import { connectSocket, disconnectSocket } from "@/lib/socket"

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = getStoredUser()
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    
    setUser(storedUser)
    setIsLoading(false)

    // Connect socket if user is logged in and we have a token
    if (storedUser && token) {
      console.log("🔌 Connecting socket for user:", storedUser.id)
      connectSocket(storedUser.id, token)
    }

    // Cleanup: disconnect socket on unmount
    return () => {
      disconnectSocket()
    }
  }, [])

  // Watch for user changes and connect/disconnect socket accordingly
  useEffect(() => {
    if (user) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (token) {
        console.log("🔌 Connecting socket for user:", user.id)
        connectSocket(user.id, token)
      }
    } else {
      console.log("🔌 Disconnecting socket")
      disconnectSocket()
    }
  }, [user])

  const logout = () => {
    disconnectSocket()
    authLogout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
