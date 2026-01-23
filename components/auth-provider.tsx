"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, getStoredUser, logout as authLogout } from "@/lib/auth"

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

  

    // Connect socket if we have Whop context
    
  


  const logout = () => {
    authLogout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>{children}</AuthContext.Provider>
}

