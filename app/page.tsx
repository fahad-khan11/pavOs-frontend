"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  console.log("Aqib Now Owner of the repo")

  useEffect(() => {
    // Redirect to dashboard - Whop authentication is handled by the dashboard
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-white"></div>
    </div>
  )
}
