"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { Search, MessageSquare, UserPlus, Filter } from "lucide-react"
import { format } from "date-fns"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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

// Static data
const staticLeads: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 234 567 890",
    source: "manual",
    status: "new",
    tags: ["high-value", "enterprise"],
    lastContactDate: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@startup.io",
    source: "referral",
    status: "in_conversation",
    tags: ["startup", "tech"],
    lastContactDate: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    unreadCount: 3,
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "m.chen@company.com",
    phone: "+1 555 123 456",
    source: "whop",
    status: "proposal",
    tags: ["saas", "b2b"],
    estimatedValue: 15000,
    lastContactDate: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@creative.co",
    source: "manual",
    status: "negotiation",
    tags: ["agency", "creative"],
    estimatedValue: 8500,
    lastContactDate: new Date(Date.now() - 12 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 21 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "5",
    name: "Alex Thompson",
    email: "alex.t@ecommerce.shop",
    source: "referral",
    status: "won",
    tags: ["ecommerce", "retail"],
    estimatedValue: 25000,
    lastContactDate: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
  },
  {
    id: "6",
    name: "Jessica Lee",
    email: "jlee@startup.io",
    source: "manual",
    status: "lost",
    tags: ["budget"],
    lastContactDate: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
  },
]

const staticStats: LeadStats = {
  total: 156,
  new: 24,
  in_conversation: 38,
  proposal: 21,
  negotiation: 15,
  won: 43,
  lost: 15,
  bySource: {
    discord: 0,
    instagram: 12,
    tiktok: 8,
    whop: 45,
    manual: 67,
    referral: 24,
  },
}

export default function LeadsPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string
  
  // Get token from URL for navigation
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const devToken = searchParams?.get("whop-dev-user-token")
  const tokenQuery = devToken ? `?whop-dev-user-token=${devToken}` : ""
  
  const [leads] = useState<Lead[]>(staticLeads)
  const [stats] = useState<LeadStats>(staticStats)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all")
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all")

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
    <div className="min-h-screen w-full bg-white dark:bg-gray-950 p-8">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/dashboard/${companyId}${tokenQuery}`}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Leads</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your leads.
              </p>
            </div>
            <Button onClick={() => router.push(`/dashboard/${companyId}/leads/new${tokenQuery}`)} variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="truncate">Total Leads</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="truncate">New</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between">
                {stats.new}
                <Badge className={statusColors.new}>New</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="truncate" title="In Conversation">In Conversation</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between">
                {stats.in_conversation}
                <Badge className={statusColors.in_conversation}>Active</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="truncate">Proposal</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between">
                {stats.proposal}
                <Badge className={statusColors.proposal}>Proposal</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="truncate">Won</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between">
                {stats.won}
                <Badge className={statusColors.won}>Won</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="truncate">Lost</CardDescription>
              <CardTitle className="text-2xl">{stats.lost}</CardTitle>
            </CardHeader>
          </Card>
        </div>

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
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="whop">Whop</SelectItem>
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
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No leads found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery || statusFilter !== "all" || sourceFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Start by adding leads manually"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-x-auto">
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
                        onClick={() => {
                          if (lead.source !== "manual" && lead.source !== "whop") {
                            router.push(`/leads/${lead.id}`)
                          }
                        }}
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
                          {(lead.source !== "manual" && lead.source !== "whop") && (
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
                          )}
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