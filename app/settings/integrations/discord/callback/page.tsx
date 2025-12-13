"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { discordService } from "@/lib/services/discordService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function DiscordCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const success = searchParams.get('success')
      const error = searchParams.get('error')

      // Handle backend redirect (when backend processes OAuth and redirects here)
      if (success === 'true') {
        setStatus('success')
        setMessage('Successfully connected to Discord!')
        
        // Notify parent window if opened in popup - send immediately
        if (window.opener) {
          // Send message immediately so parent can update
          window.opener.postMessage(
            { type: 'DISCORD_OAUTH_SUCCESS' },
            window.location.origin
          )
          // Close popup after a short delay to show success message
          setTimeout(() => {
            window.close()
          }, 1500)
        } else {
          setTimeout(() => {
            router.push('/settings/integrations')
          }, 2000)
        }
        return
      }

      if (error) {
        setStatus('error')
        setMessage(decodeURIComponent(error))
        
        // Notify parent window if opened in popup
        if (window.opener) {
          window.opener.postMessage(
            { type: 'DISCORD_OAUTH_ERROR', message: decodeURIComponent(error) },
            window.location.origin
          )
        }
        
        setTimeout(() => {
          if (window.opener) {
            window.close()
          } else {
            router.push('/settings/integrations')
          }
        }, 2000)
        return
      }

      // Handle direct OAuth callback with code (frontend processes it)
      if (!code) {
        setStatus('error')
        setMessage('Authorization code not found. Please try connecting again.')
        
        if (window.opener) {
          window.opener.postMessage(
            { type: 'DISCORD_OAUTH_ERROR', message: 'Authorization code not found' },
            window.location.origin
          )
        }
        return
      }

      // Exchange code for tokens
      await discordService.handleCallback(code, state || '')

      setStatus('success')
      setMessage('Successfully connected to Discord!')

      // Notify parent window if opened in popup - send immediately
      if (window.opener) {
        // Send message immediately so parent can update
        window.opener.postMessage(
          { type: 'DISCORD_OAUTH_SUCCESS' },
          window.location.origin
        )
        // Close popup after a short delay to show success message
        setTimeout(() => {
          window.close()
        }, 1500)
      } else {
        setTimeout(() => {
          router.push('/settings/integrations')
        }, 2000)
      }
    } catch (error: any) {
      console.error('Discord callback error:', error)
      setStatus('error')
      setMessage(error.response?.data?.error || 'Failed to connect Discord. Please try again.')
      
      // Notify parent window if opened in popup
      if (window.opener) {
        window.opener.postMessage(
          { type: 'DISCORD_OAUTH_ERROR', message: error.response?.data?.error || 'Failed to connect Discord' },
          window.location.origin
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
          <CardTitle>
            {status === 'loading' && 'Connecting to Discord...'}
            {status === 'success' && 'Connected!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Please wait while we complete the connection...
            </p>
          )}
          {status === 'success' && (
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Redirecting you back to integrations...
            </p>
          )}
          {status === 'error' && (
            <div className="space-y-4">
              <Button
                onClick={() => router.push('/settings/integrations')}
                className="w-full"
              >
                Back to Integrations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DiscordCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            </div>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <DiscordCallbackContent />
    </Suspense>
  )
}
