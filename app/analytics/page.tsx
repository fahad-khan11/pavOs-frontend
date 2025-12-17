"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useTheme } from "next-themes"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, Users, Briefcase, Target, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import api from "@/lib/api"
import toast from "react-hot-toast"

// Custom tick component for proper dark mode support
const CustomTick = ({ x, y, payload, isDark }: any) => {
  return (
    <text 
      x={x} 
      y={y} 
      dy={16} 
      textAnchor="middle" 
      fill={isDark ? "#ffffff" : "#0e1d3a"}
      fontSize={12}
    >
      {payload.value}
    </text>
  )
}

const CustomYTick = ({ x, y, payload, isDark }: any) => {
  return (
    <text 
      x={x} 
      y={y} 
      dx={-10} 
      textAnchor="end" 
      fill={isDark ? "#ffffff" : "#0e1d3a"}
      fontSize={12}
    >
      {payload.value}
    </text>
  )
}

interface AnalyticsData {
  totalRevenue: number
  winRate: number
  activeDeals: number
  avgDealSize: number
  totalLeads: number
  wonLeads: number
  lostLeads: number
  sourceBreakdown: { [key: string]: { count: number; won: number; revenue: number } }
  pipelineBreakdown: { [key: string]: { count: number; value: number } }
  monthlyRevenue: { month: string; revenue: number; deals: number }[]
}

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("30")
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDarkMode = mounted && resolvedTheme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update chart colors for dark mode


  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user, timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/dashboard/analytics?timeRange=${timeRange}`)
      setAnalytics(response.data.data)
    } catch (error: any) {
      console.error('Failed to load analytics:', error)
      toast.error(error.response?.data?.error || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900 dark:text-white" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900 dark:text-white" />
          </div>
        </main>
      </div>
    )
  }

  // Transform data for charts
  const revenueData = analytics?.monthlyRevenue || []
  
  // Debug: Log the data
  console.log('Revenue Data:', revenueData)
  console.log('Is Dark Mode:', isDarkMode)

  const pipelineData = analytics?.pipelineBreakdown ? [
    { stage: "New", value: analytics.pipelineBreakdown.new?.value || 0, count: analytics.pipelineBreakdown.new?.count || 0 },
    { stage: "In Conversation", value: analytics.pipelineBreakdown.in_conversation?.value || 0, count: analytics.pipelineBreakdown.in_conversation?.count || 0 },
    { stage: "Proposal", value: analytics.pipelineBreakdown.proposal?.value || 0, count: analytics.pipelineBreakdown.proposal?.count || 0 },
    { stage: "Negotiation", value: analytics.pipelineBreakdown.negotiation?.value || 0, count: analytics.pipelineBreakdown.negotiation?.count || 0 },
    { stage: "Won", value: analytics.pipelineBreakdown.won?.value || 0, count: analytics.pipelineBreakdown.won?.count || 0 },
    { stage: "Lost", value: analytics.pipelineBreakdown.lost?.value || 0, count: analytics.pipelineBreakdown.lost?.count || 0 },
  ] : []

  // Source breakdown for pie chart
  const sourceData = analytics ? Object.entries(analytics.sourceBreakdown).map(([source, data], index) => ({
    name: source.charAt(0).toUpperCase() + source.slice(1),
    value: data.count,
    revenue: data.revenue,
    won: data.won,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
  })).filter(s => s.value > 0) : []

  const stats = [
    {
      title: "Total Revenue",
      value: `$${(analytics?.totalRevenue || 0).toLocaleString()}`,
      change: "",
      trend: "up" as const,
      icon: DollarSign,
      description: `${analytics?.wonLeads || 0} won deals`,
    },
    {
      title: "Win Rate",
      value: `${analytics?.winRate || 0}%`,
      change: "",
      trend: "up" as const,
      icon: Target,
      description: `${analytics?.wonLeads || 0} of ${(analytics?.wonLeads || 0) + (analytics?.lostLeads || 0)} closed`,
    },
    {
      title: "Active Deals",
      value: `${analytics?.activeDeals || 0}`,
      change: "",
      trend: "up" as const,
      icon: Briefcase,
      description: "In pipeline",
    },
    {
      title: "Avg Deal Size",
      value: `$${(analytics?.avgDealSize || 0).toLocaleString()}`,
      change: "",
      trend: "up" as const,
      icon: TrendingUp,
      description: "Per deal",
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your performance and insights</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 dark:bg-gray-950 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-950 dark:text-white">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="bg-white dark:bg-[#101828]">
            <TabsTrigger value="revenue"  className="hover:bg-white dark:hover-bg-white/10 dark:hover-text-black">Revenue</TabsTrigger>
            <TabsTrigger value="pipeline" className="hover:bg-white dark:hover-bg-white/10 dark:hover-text-black">Pipeline</TabsTrigger>
            <TabsTrigger value="sources"  className="hover:bg-white dark:hover-bg-white/10 dark:hover-text-black">Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData} key={isDarkMode ? 'dark' : 'light'}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                      <XAxis
                        dataKey="month"
                        fontSize={12}
                        stroke={isDarkMode ? "#ffffff" : "#888888"}
                        tick={{ fill: isDarkMode ? "#ffffff" : "#888888" }}
                        tickLine={{ stroke: isDarkMode ? "#ffffff" : "#888888" }}
                        axisLine={{ stroke: isDarkMode ? "#ffffff" : "#888888" }}
                      />
                      <YAxis
                        fontSize={12}
                        stroke={isDarkMode ? "#ffffff" : "#888888"}
                        tick={{ fill: isDarkMode ? "#ffffff" : "#888888" }}
                        tickLine={{ stroke: isDarkMode ? "#ffffff" : "#888888" }}
                        axisLine={{ stroke: isDarkMode ? "#ffffff" : "#888888" }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={isDarkMode ? "#ffffff" : "hsl(var(--chart-1))"}
                        strokeWidth={2}
                        dot={{ fill: isDarkMode ? "#ffffff" : "hsl(var(--chart-1))", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Breakdown</CardTitle>
                  <CardDescription>Deals and revenue by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueData.map((month) => (
                      <div key={month.month} className="flex items-center justify-between pb-4 border-b last:border-0">
                        <div>
                          <p className="font-medium">{month.month}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{month.deals} deals</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${month.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {revenueData.length === 0 && (
                      <p className="text-center text-gray-600 dark:text-gray-400 py-4">No revenue data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Overall performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Leads</span>
                    <span className="font-semibold">{analytics?.totalLeads || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Won Deals</span>
                    <span className="font-semibold">{analytics?.wonLeads || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Lost Deals</span>
                    <span className="font-semibold">{analytics?.lostLeads || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active in Pipeline</span>
                    <span className="font-semibold">{analytics?.activeDeals || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                    <span className="font-semibold">${(analytics?.totalRevenue || 0).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Distribution</CardTitle>
                <CardDescription>Number of leads in each stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pipeline-chart">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Leads",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pipelineData} key={isDarkMode ? 'dark' : 'light'}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                      <XAxis
                        dataKey="stage"
                        fontSize={12}
                        stroke={isDarkMode ? "#ffffff" : "#888888"}
                        tick={{ fill: isDarkMode ? "#ffffff" : "#888888" }}
                        tickLine={{ stroke: isDarkMode ? "#ffffff" : "#888888" }}
                        axisLine={{ stroke: isDarkMode ? "#ffffff" : "#888888" }}
                      />
                      <YAxis
                        fontSize={12}
                        stroke={isDarkMode ? "#ffffff" : "#888888"}
                        tick={{ fill: isDarkMode ? "#ffffff" : "#888888" }}
                        tickLine={{ stroke: isDarkMode ? "#ffffff" : "#888888" }}
                        axisLine={{ stroke: isDarkMode ? "#ffffff" : "#888888" }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        fill={isDarkMode ? "#ffffff" : "hsl(var(--chart-2))"}
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                        activeBar={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pipeline Health</CardTitle>
                  <CardDescription>Key pipeline metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Pipeline Value</span>
                    <span className="font-semibold">
                      ${pipelineData.reduce((sum, s) => sum + s.value, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Leads in Pipeline</span>
                    <span className="font-semibold">
                      {pipelineData.reduce((sum, s) => sum + s.count, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Deal Size</span>
                    <span className="font-semibold">${(analytics?.avgDealSize || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate</span>
                    <span className="font-semibold">{analytics?.winRate || 0}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stage Distribution</CardTitle>
                  <CardDescription>Leads and value per stage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pipelineData.map((stage) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{stage.stage}</span>
                        <div className="text-right">
                          <span className="font-medium">{stage.count} leads</span>
                          {stage.value > 0 && (
                            <span className="text-gray-600 dark:text-gray-400 ml-2">(${stage.value.toLocaleString()})</span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min(100, (stage.count / Math.max(1, analytics?.totalLeads || 1)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>Distribution of leads by source</CardDescription>
                </CardHeader>
                <CardContent>
                  {sourceData.length > 0 ? (
                    <ChartContainer
                      config={{
                        discord: { label: "Discord", color: "hsl(var(--chart-1))" },
                        manual: { label: "Manual", color: "hsl(var(--chart-2))" },
                        whop: { label: "Whop", color: "hsl(var(--chart-3))" },
                        referral: { label: "Referral", color: "hsl(var(--chart-4))" },
                        instagram: { label: "Instagram", color: "hsl(var(--chart-5))" },
                      }}
                      className="h-[300px] [&_text]:fill-foreground"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sourceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: any) => 
                              `${entry.name} ${((entry.percent || 0) * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {sourceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-600 dark:text-gray-400">
                      No lead data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Source Performance</CardTitle>
                  <CardDescription>Leads, wins, and revenue by source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sourceData.map((source) => (
                      <div key={source.name} className="flex items-center justify-between pb-4 border-b last:border-0">
                        <div>
                          <p className="font-medium capitalize">{source.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {source.value} leads, {source.won} won
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${source.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {source.value > 0 ? Math.round((source.won / source.value) * 100) : 0}% win rate
                          </p>
                        </div>
                      </div>
                    ))}
                    {sourceData.length === 0 && (
                      <p className="text-center text-gray-600 dark:text-gray-400 py-4">No source data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
