// "use client"

// import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
// import { type User, getStoredUser, logout as authLogout } from "@/lib/auth"
// import { connectSocket, disconnectSocket } from "@/lib/socket"

// interface AuthContextType {
//   user: User | null
//   setUser: (user: User | null) => void
//   logout: () => void
//   isLoading: boolean
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     const storedUser = getStoredUser()
    
//     // ✅ WHOP-FIRST: Check for Whop context in sessionStorage
//     const whopUserId = typeof window !== 'undefined' ? sessionStorage.getItem('whop_user_id') : null
//     const whopCompanyId = typeof window !== 'undefined' ? sessionStorage.getItem('whop_company_id') : null
    
//     setUser(storedUser)
//     setIsLoading(false)

//     // Connect socket if we have Whop context
//     if (whopUserId && whopCompanyId) {
//       console.log("🔌 Connecting socket with Whop context:", { whopUserId, whopCompanyId })
//       connectSocket(whopUserId, whopCompanyId)
//     }

//     // Cleanup: disconnect socket on unmount
//     return () => {
//       disconnectSocket()
//     }
//   }, [])

//   // Watch for user changes and connect/disconnect socket accordingly
//   useEffect(() => {
//     if (user) {
//       const whopUserId = typeof window !== 'undefined' ? sessionStorage.getItem('whop_user_id') : null
//       const whopCompanyId = typeof window !== 'undefined' ? sessionStorage.getItem('whop_company_id') : null
      
//       if (whopUserId && whopCompanyId) {
//         console.log("🔌 Connecting socket for user with Whop context")
//         connectSocket(whopUserId, whopCompanyId)
//       }
//     } else {
//       console.log("🔌 Disconnecting socket")
//       disconnectSocket()
//     }
//   }, [user])

//   const logout = () => {
//     disconnectSocket()
//     authLogout()
//     setUser(null)
//   }

//   return <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>{children}</AuthContext.Provider>
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }
