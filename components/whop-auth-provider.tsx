"use client"

import { createContext, useContext, ReactNode } from "react"

interface WhopAuthContextType {
  whopUserId: string | null
  whopCompanyId: string | null
  isWhopAuth: boolean
}

const WhopAuthContext = createContext<WhopAuthContextType>({
  whopUserId: null,
  whopCompanyId: null,
  isWhopAuth: false,
})

export function useWhopAuth() {
  return useContext(WhopAuthContext)
}

interface WhopAuthProviderProps {
  children: ReactNode
  whopUserId?: string
  whopCompanyId?: string
}

export function WhopAuthProvider({
  children,
  whopUserId = null,
  whopCompanyId = null
}: WhopAuthProviderProps) {
  return (
    <WhopAuthContext.Provider
      value={{
        whopUserId,
        whopCompanyId,
        isWhopAuth: !!whopUserId && !!whopCompanyId,
      }}
    >
      {children}
    </WhopAuthContext.Provider>
  )
}
