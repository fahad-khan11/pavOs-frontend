"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Users, Briefcase, Loader2 } from "lucide-react"
import api from "@/lib/api"

interface DashboardStats {
  totalRevenue: number
  winRate: number
  activeDeals: number
  avgDealSize: number
  totalLeads: number
  wonLeads: number
  lostLeads: number
}

interface Activity {
  _id: string
  type: string
  description: string
  createdAt: string
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If auth is still loading, wait
    if (authLoading) {
      return
    }
    
    // If auth is done and we have a user, load data
    if (user) {
      loadDashboardData()
    } else {
      // No user after auth loading is done
      setLoading(false)
    }
  }, [user, authLoading])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [analyticsRes, activityRes] = await Promise.all([
        api.get('/dashboard/analytics'),
        api.get('/dashboard/recent-activity?limit=5')
      ])
      setStats(analyticsRes.data.data)
      setActivities(activityRes.data.data || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  const statsData = stats ? [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      description: `From ${stats.wonLeads} won deals`,
      icon: DollarSign,
    },
    {
      title: "Win Rate",
      value: `${stats.winRate}%`,
      description: "Based on closed leads",
      icon: TrendingUp,
    },
    {
      title: "Active Leads",
      value: stats.activeDeals.toString(),
      description: `${stats.totalLeads} total leads`,
      icon: Users,
    },
    {
      title: "Avg Deal Size",
      value: formatCurrency(stats.avgDealSize),
      description: "Per won deal",
      icon: Briefcase,
    },
  ] : []

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-900 dark:text-white" />
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Not Logged In</h2>
            <p className="text-gray-600 dark:text-gray-400">Please log in to view your dashboard.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance text-gray-900 dark:text-white">Welcome back, {user?.name || 'Creator'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Here's what's happening with your partnerships today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest partnership updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">No recent activity</p>
                ) : (
                  activities.map((activity, index) => (
                    <div key={activity._id || `activity-${index}`} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0">
                      <div className="h-2 w-2 rounded-full bg-[#0e1d3a] dark:bg-[#F4C542] mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.type}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{formatTimeAgo(activity.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Overview of your pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Total Leads</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">All time</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalLeads || 0}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Won Deals</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Closed successfully</p>
                  </div>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-500">{stats?.wonLeads || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Lost Deals</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Did not close</p>
                  </div>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-500">{stats?.lostLeads || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
