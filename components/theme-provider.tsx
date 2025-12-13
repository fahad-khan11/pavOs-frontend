'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme,
} from 'next-themes'
import { WhopApp } from "@whop/react/components"

function WhopAppWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WhopApp appearance={mounted && resolvedTheme === "dark" ? "dark" : "light"}>
      {children}
    </WhopApp>
  )
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <WhopAppWrapper>{children}</WhopAppWrapper>
    </NextThemesProvider>
  )
}
