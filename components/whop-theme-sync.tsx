"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export function WhopThemeSync() {
  const { setTheme } = useTheme()
  const lastThemeRef = useRef<string | null>(null)

  useEffect(() => {
    const applyTheme = (theme: string, source: string) => {
      if (theme === "dark" || theme === "light") {
        if (lastThemeRef.current !== theme) {
          console.log(`Theme changed to ${theme} (from ${source})`)
          lastThemeRef.current = theme
          setTheme(theme)
          
          // Update DOM class (Whop uses class-based theme forwarding)
          if (theme === "dark") {
            document.documentElement.classList.add("dark")
          } else {
            document.documentElement.classList.remove("dark")
          }
        }
      }
    }

    const detectTheme = () => {

            // Priority 2: URL parameter (when Whop passes it)
      const url = new URL(window.location.href)
      const urlTheme = url.searchParams.get("theme")
      if (urlTheme === "dark" || urlTheme === "light") {
        applyTheme(urlTheme, "URL")
        return
      }
      // Priority 1: Check for Whop's theme class on html element (Whop forwards theme via classes)
      const htmlElement = document.documentElement
      if (htmlElement.classList.contains("dark")) {
        applyTheme("dark", "Whop class")
        return
      }
      if (htmlElement.classList.contains("light") || !htmlElement.classList.contains("dark")) {
        // Check if we're in a light theme context
        const computedStyle = window.getComputedStyle(htmlElement)
        const bgColor = computedStyle.backgroundColor
        // If background is light, it's light theme
        if (bgColor && !bgColor.includes("rgb(0") && !bgColor.includes("rgb(10")) {
          applyTheme("light", "Whop class")
          return
        }
      }

      // Priority 3: Check parent window theme (if embedded in Whop)
      try {
        if (window.parent !== window) {
          const parentHtml = window.parent.document.documentElement
          if (parentHtml.classList.contains("dark")) {
            applyTheme("dark", "Parent window")
            return
          }
        }
      } catch (e) {
        // Cross-origin, ignore
      }

      // Priority 4: localStorage (fallback persistence)
      const storedTheme = localStorage.getItem("theme")
      if (storedTheme === "dark" || storedTheme === "light") {
        applyTheme(storedTheme, "localStorage")
        return
      }

      // Default: follow system preference or default to light
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      applyTheme(prefersDark ? "dark" : "light", "System preference")
    }

    // Listen for messages from Whop
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from whop.com
      if (event.origin.includes("whop.com")) {
        const { type, theme } = event.data
        
        if (type === "theme-change" && (theme === "dark" || theme === "light")) {
          applyTheme(theme, "postMessage from Whop")
        }
      }
    }

    // Watch for class changes on html element (Whop updates classes)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          detectTheme()
        }
      })
    })

    // Initial detection
    detectTheme()

    // Observe html element for class changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    // Poll URL for changes (in case Whop updates it)
    const interval = setInterval(detectTheme, 500)

    // Listen for postMessage from Whop
    window.addEventListener("message", handleMessage)

    // Listen for URL changes
    window.addEventListener("popstate", detectTheme)
    window.addEventListener("hashchange", detectTheme)

    return () => {
      clearInterval(interval)
      observer.disconnect()
      window.removeEventListener("message", handleMessage)
      window.removeEventListener("popstate", detectTheme)
      window.removeEventListener("hashchange", detectTheme)
    }
  }, [setTheme])

  return null
}
