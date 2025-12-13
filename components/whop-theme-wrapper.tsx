"use client"

import { useEffect, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { Theme, useThemeContext } from "@whop/react/components"

interface WhopThemeWrapperProps {
  children: ReactNode
}

/**
 * Syncs Next-themes dark mode with Whop's Frosted UI theme system
 * This ensures both Tailwind dark: classes and Whop components use the same theme
 */
export function WhopThemeWrapper({ children }: WhopThemeWrapperProps) {
  const { theme: nextTheme, systemTheme } = useTheme()
  
  // Determine the actual theme (resolving 'system')
  const resolvedTheme = nextTheme === 'system' ? systemTheme : nextTheme
  const appearance = resolvedTheme === 'dark' ? 'dark' : 'light'

  useEffect(() => {
    // Sync the data-theme attribute for Tailwind dark mode
    const root = document.documentElement
    root.setAttribute('data-theme', appearance)
    
    // Also ensure the class is set for Tailwind's class-based dark mode
    if (appearance === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [appearance])

  return (
    <Theme appearance={appearance} asChild>
      {children}
    </Theme>
  )
}
