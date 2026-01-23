"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"

export default function DashboardCompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0A1931]">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <main className="flex-1 overflow-auto flex flex-col bg-white dark:bg-[#101828]">
        <Navbar />
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0A1931]">
          {children}
        </div>
      </main>
    </div>
  )
}
