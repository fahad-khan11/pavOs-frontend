"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { discordService } from "@/lib/services/discordService"
import { Search, MessageSquare, UserPlus, Filter, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import { format } from "date-fns"

type LeadStatus = "new" | "in_conversation" | "proposal" | "negotiation" | "won" | "lost"
type LeadSource = "discord" | "instagram" | "tiktok" | "whop" | "manual" | "referral"

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  discordUserId?: string
  discordUsername?: string
  instagramUsername?: string
  tiktokUsername?: string
  source: LeadSource
  status: LeadStatus
  tags: string[]
  notes?: string
  lastContactDate?: string
  nextFollowUpDate?: string
  estimatedValue?: number
  createdAt: string
  updatedAt: string
  unreadCount?: number
}

interface LeadStats {
  total: number
  new: number
  in_conversation: number
  proposal: number
  negotiation: number
  won: number
  lost: number
  bySource: {
    discord: number
    instagram: number
    tiktok: number
    whop: number
    manual: number
    referral: number
  }
}

const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-500",
  in_conversation: "bg-purple-500",
  proposal: "bg-orange-500",
  negotiation: "bg-yellow-500",
  won: "bg-green-500",
  lost: "bg-gray-500",
}

const sourceIcons: Record<LeadSource, string> = {
  discord: "💬",
  instagram: "📸",
  tiktok: "🎵",
  whop: "🛒",
  manual: "✍️",
  referral: "🤝",
}

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all")
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all")

  useEffect(() => {
    loadLeads()
    loadStats()
  }, [])

  const loadLeads = async () => {
    try {
      setLoading(true)
      const data = await discordService.getLeads()
      setLeads(data.leads || [])
    } catch (error: any) {
      toast.error(error.message || "Failed to load leads")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await discordService.getLeadStats()
      setStats(data)
    } catch (error: any) {
      console.error("Failed to load stats:", error)
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.discordUsername?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button onClick={() => router.push("/leads/new")} variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your leads from Discord, Instagram, TikTok, and more
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Leads</CardDescription>
                <CardTitle className="text-2xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>New</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {stats.new}
                  <Badge className={statusColors.new}>New</Badge>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>In Conversation</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {stats.in_conversation}
                  <Badge className={statusColors.in_conversation}>Active</Badge>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Proposal</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {stats.proposal}
                  <Badge className={statusColors.proposal}>Proposal</Badge>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Won</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {stats.won}
                  <Badge className={statusColors.won}>Won</Badge>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Lost</CardDescription>
                <CardTitle className="text-2xl">{stats.lost}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-600 dark:text-gray-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | "all")} >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#101828]">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_conversation">In Conversation</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as LeadSource | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#101828]">
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="whop">Whop</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
            <CardDescription>
              Click on a lead to view conversation history and send messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No leads found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery || statusFilter !== "all" || sourceFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Start by connecting Discord or adding leads manually"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 dark:border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Last Contact</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/leads/${lead.id}`)}
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            {lead.name}
                            {lead.unreadCount && lead.unreadCount > 0 && (
                              <Badge variant="destructive" className="rounded-full text-xs px-2">
                                {lead.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{sourceIcons[lead.source]}</span>
                            <span className="capitalize">{lead.source}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[lead.status]}>
                            {lead.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            {lead.email && <div className="text-gray-900 dark:text-white">{lead.email}</div>}
                            {lead.discordUsername && (
                              <div className="text-gray-600 dark:text-gray-400">
                                Discord: {lead.discordUsername}
                              </div>
                            )}
                            {lead.phone && <div className="text-gray-900 dark:text-white">{lead.phone}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          {lead.lastContactDate
                            ? format(new Date(lead.lastContactDate), "MMM d, yyyy")
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap max-w-[200px]">
                            {lead.tags.slice(0, 2).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {lead.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{lead.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/leads/${lead.id}`)
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
