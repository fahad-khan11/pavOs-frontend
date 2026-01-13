"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { connectSocket } from "@/lib/socket"
import DashboardContent from "../dashboard-content"

interface WhopDashboardWrapperProps {
  whopUserId: string
  whopCompanyId: string
  whopEmail?: string
  whopUsername?: string
}

export function WhopDashboardWrapper({
  whopUserId,
  whopCompanyId,
  whopEmail,
  whopUsername
}: WhopDashboardWrapperProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const authenticateWithPaveOS = async () => {
      try {
        console.log("🔐 Authenticating with PaveOS using Whop context:", { whopUserId, whopCompanyId })

        // ✅ WHOP-FIRST: Store Whop identifiers in sessionStorage (more reliable in iframes)
        sessionStorage.setItem("whop_user_id", whopUserId)
        sessionStorage.setItem("whop_company_id", whopCompanyId)

        // Call backend to create/update user (no tokens returned)
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/whop`,
          {
            whopUserId,
            whopCompanyId,
            email: whopEmail,
            name: whopUsername || whopEmail,
          }
        )

        const { user } = response.data.data
        console.log("✅ Authenticated with PaveOS for user:", user)

        // Store user data (for display purposes only, not auth)
        localStorage.setItem("user", JSON.stringify(user))

        // Connect socket with Whop identifiers
        console.log("🔌 Connecting socket with Whop context")
        connectSocket(whopUserId, whopCompanyId)

        // Mark as authenticated to show dashboard content
        setIsAuthenticated(true)
      } catch (err: any) {
        console.error("❌ Whop authentication error:", err)
        setError(err.response?.data?.message || "Failed to authenticate with PaveOS")
      }
    }

    authenticateWithPaveOS()
  }, [whopUserId, whopCompanyId, whopEmail, whopUsername])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Authentication Error</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Authenticating with PaveOS...</p>
        </div>
      </div>
    )
  }

  // Render the actual dashboard content after authentication
  return <DashboardContent whopCompanyId={whopCompanyId} />
}
