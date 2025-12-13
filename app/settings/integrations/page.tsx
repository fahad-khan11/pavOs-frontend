"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, RefreshCw, ExternalLink, MessageCircle } from "lucide-react"
import { whopService, type WhopConnectionStatus } from "@/lib/services"
import { discordService, type DiscordConnectionStatus } from "@/lib/services/discordService"
import toast from "react-hot-toast"

export default function IntegrationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [whopStatus, setWhopStatus] = useState<WhopConnectionStatus | null>(null)
  const [discordStatus, setDiscordStatus] = useState<DiscordConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [discordConnecting, setDiscordConnecting] = useState(false)
  const [discordSyncing, setDiscordSyncing] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  const loadDiscordStatus = useCallback(async () => {
    try {
      const status = await discordService.getStatus()
      setDiscordStatus(status)
    } catch (error: any) {
      console.error('Failed to load Discord status:', error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadStatuses()
    }
  }, [user])

  // Handle Discord OAuth callback from popup
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Listen for messages from popup window
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'DISCORD_OAUTH_SUCCESS') {
        console.log('✅ Received DISCORD_OAUTH_SUCCESS message from popup')
        toast.success('Successfully connected to Discord!')
        setDiscordConnecting(false)
        // Reload Discord status immediately
        loadDiscordStatus().catch((error) => {
          console.error('Failed to reload Discord status:', error)
        })
      } else if (event.data.type === 'DISCORD_OAUTH_ERROR') {
        console.log('❌ Received DISCORD_OAUTH_ERROR message from popup')
        toast.error(event.data.message || 'Failed to connect Discord')
        setDiscordConnecting(false)
      }
    }

    window.addEventListener('message', handleMessage)

    // Also handle direct URL redirects (fallback)
    const params = new URLSearchParams(window.location.search)
    const discordStatus = params.get('discord')

    if (discordStatus === 'connected') {
      toast.success('Successfully connected to Discord!')
      loadDiscordStatus()
      window.history.replaceState({}, '', '/settings/integrations')
    } else if (discordStatus === 'error') {
      const message = params.get('message') || 'Failed to connect Discord'
      toast.error(message)
      window.history.replaceState({}, '', '/settings/integrations')
    }

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [loadDiscordStatus])

  const loadStatuses = async () => {
    try {
      setLoading(true)
      const [whop, discord] = await Promise.all([
        whopService.getStatus(),
        discordService.getStatus(),
      ])
      setWhopStatus(whop)
      setDiscordStatus(discord)
    } catch (error: any) {
      console.error('Failed to load integration status:', error)
      // Don't show toast for network errors on initial load to avoid spam
      // Only show if it's not a network error
      if (error.code !== 'ERR_NETWORK' && !error.message?.includes('Network Error')) {
        toast.error('Failed to load integration status')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadWhopStatus = async () => {
    try {
      const status = await whopService.getStatus()
      setWhopStatus(status)
    } catch (error: any) {
      console.error('Failed to load Whop status:', error)
    }
  }


  const handleConnectWhop = async () => {
    try {
      setConnecting(true)
      const result = await whopService.connect()
      toast.success(result.message || 'Successfully connected to Whop!')
      await loadWhopStatus()
    } catch (error: any) {
      console.error('Failed to connect Whop:', error)
      toast.error(error.response?.data?.error || 'Failed to connect to Whop')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnectWhop = async () => {
    if (!confirm('Are you sure you want to disconnect Whop? This will not delete your synced contacts.')) {
      return
    }

    try {
      setConnecting(true)
      await whopService.disconnect()
      toast.success('Disconnected from Whop')
      await loadWhopStatus()
    } catch (error: any) {
      console.error('Failed to disconnect Whop:', error)
      toast.error(error.response?.data?.error || 'Failed to disconnect')
    } finally {
      setConnecting(false)
    }
  }

  const handleSyncCustomers = async () => {
    try {
      setSyncing(true)
      const result = await whopService.syncCustomers()
      toast.success(
        `Synced ${result.created + result.updated} customers from Whop!\n` +
        `Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`
      )
      await loadWhopStatus()
    } catch (error: any) {
      console.error('Failed to sync customers:', error)
      toast.error(error.response?.data?.error || 'Failed to sync customers')
    } finally {
      setSyncing(false)
    }
  }

  const handleConnectDiscord = async () => {
    try {
      setDiscordConnecting(true)
      const url = await discordService.getOAuthURL()

      // Open Discord OAuth in a popup window to avoid connection issues
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const popup = window.open(
        url,
        'Discord OAuth',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      )

      if (!popup) {
        toast.error('Please allow popups to connect to Discord')
        setDiscordConnecting(false)
        return
      }

      // Check if popup is closed manually and reload status as fallback
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setDiscordConnecting(false)
          // Reload status when popup closes as fallback (in case message wasn't received)
          // This ensures UI updates even if postMessage fails
          setTimeout(() => {
            loadDiscordStatus().catch((error) => {
              console.error('Failed to reload Discord status after popup close:', error)
            })
          }, 500)
        }
      }, 500)

    } catch (error: any) {
      console.error('Failed to get Discord OAuth URL:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to initiate Discord connection'
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend server is running on port 5000.'
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again to connect Discord'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      setDiscordConnecting(false)
    }
  }

  const handleDisconnectDiscord = async () => {
    if (!confirm('Are you sure you want to disconnect Discord? This will not delete your synced leads.')) {
      return
    }

    try {
      setDiscordConnecting(true)
      await discordService.disconnect()
      toast.success('Disconnected from Discord')
      await loadDiscordStatus()
    } catch (error: any) {
      console.error('Failed to disconnect Discord:', error)
      toast.error(error.response?.data?.error || 'Failed to disconnect')
    } finally {
      setDiscordConnecting(false)
    }
  }

  const handleSyncMembers = async () => {
    try {
      setDiscordSyncing(true)
      const result = await discordService.syncMembers()
      toast.success(
        `Synced ${result.created + result.updated} members from Discord!\n` +
        `Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`
      )
      await loadDiscordStatus()
    } catch (error: any) {
      console.error('Failed to sync members:', error)
      toast.error(error.response?.data?.error || 'Failed to sync members')
    } finally {
      setDiscordSyncing(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integrations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Connect your tools and sync your data</p>
        </div>

        <div className="space-y-6">
          {/* Whop Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                    W
                  </div>
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      Whop
                      {whopStatus?.connected && (
                        <Badge variant="default" className="bg-green-500 dark:bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                      {whopStatus && !whopStatus.connected && (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {whopStatus?.connected
                        ? 'Your Whop account is automatically connected. Sync customers below.'
                        : 'Automatically connected when you log in via Whop'}
                    </CardDescription>
                  </div>
                </div>
                <a
                  href="https://whop.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {whopStatus?.connected ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Company ID</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">{whopStatus.companyId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {whopStatus.connectedAt
                          ? new Date(whopStatus.connectedAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last Sync</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {whopStatus.lastSyncAt
                          ? new Date(whopStatus.lastSyncAt).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  {whopStatus.syncedCustomersCount !== undefined && whopStatus.syncedCustomersCount > 0 && (
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Synced Customers</p>
                      <p className="text-2xl font-bold">{whopStatus.syncedCustomersCount}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSyncCustomers}
                      disabled={syncing}
                      className="flex-1"
                    >
                      {syncing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Customers
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDisconnectWhop}
                      disabled={connecting}
                    >
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Whop Auto-Sync</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your Whop account is automatically connected when you log in through Whop.
                      Once connected, you can sync customers and memberships.
                    </p>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 ml-4 list-disc">
                      <li>Automatically sync your Whop customers as contacts</li>
                      <li>Track membership status and subscriptions</li>
                      <li>Match customers to leads and mark deals as won</li>
                      <li>View customer activity in one place</li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Discord Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      Discord
                      {discordStatus?.connected && (
                        <Badge variant="default" className="bg-green-500 dark:bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                      {discordStatus && !discordStatus.connected && (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                      {discordStatus?.botActive && (
                        <Badge variant="default" className="bg-blue-500 dark:bg-blue-600">
                          Bot Active
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Track Discord DMs, sync server members as leads, and automate messages
                    </CardDescription>
                  </div>
                </div>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {discordStatus?.connected ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Server</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{discordStatus.guildName || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {discordStatus.connectedAt
                          ? new Date(discordStatus.connectedAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last Sync</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {discordStatus.lastSyncAt
                          ? new Date(discordStatus.lastSyncAt).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  {discordStatus.syncedMembersCount !== undefined && discordStatus.syncedMembersCount > 0 && (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Synced Members as Leads</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{discordStatus.syncedMembersCount}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSyncMembers}
                      disabled={discordSyncing}
                      className="flex-1"
                    >
                      {discordSyncing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Members
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDisconnectDiscord}
                      disabled={discordConnecting}
                    >
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Connect Discord to:</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                      <li>Track DMs and automatically create leads</li>
                      <li>Sync Discord server members as leads</li>
                      <li>Send automated onboarding messages</li>
                      <li>Manage conversations from one dashboard</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleConnectDiscord}
                    disabled={discordConnecting}
                    className="w-full"
                  >
                    {discordConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Discord'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stripe Integration - Coming Soon */}
          {/* <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                    S
                  </div>
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      Stripe
                      <Badge variant="secondary">Coming Soon</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Accept payments and track revenue from Stripe
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stripe integration will be available soon. Connect your Stripe account to track payments
                and revenue.
              </p>
            </CardContent>
          </Card> */}
        </div>
      </main>
    </div>
  )
}
