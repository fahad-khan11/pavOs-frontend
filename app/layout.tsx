import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { WhopThemeSync } from "@/components/whop-theme-sync"
import { WhopThemeWrapper } from "@/components/whop-theme-wrapper"
import { Toaster } from "react-hot-toast"
import { WhopApp } from "@whop/react/components"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PaveOS - The Creator Operating System",
  description: "Close deals, deliver work, and get paid faster. The all-in-one platform for modern creators.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <WhopThemeSync />
          <WhopApp accentColor="blue" appearance="inherit">
            <WhopThemeWrapper>
              <AuthProvider>{children}</AuthProvider>
            </WhopThemeWrapper>
          </WhopApp>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: 'dark:bg-gray-800 dark:text-white dark:border-accent',
              style: {
                background: "#0A1931",
                color: "#fff",
                border: "1px solid #F4C542",
              },
              success: {
                iconTheme: {
                  primary: "#F4C542",
                  secondary: "#0A1931",
                },
              },
            }}
          />
          <Analytics />
        </ThemeProvider>

      </body>
    </html>
  )
}
