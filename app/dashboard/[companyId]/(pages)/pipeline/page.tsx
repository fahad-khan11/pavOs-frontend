"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, DollarSign, Calendar, MessageSquare } from "lucide-react"
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

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  discordUserId?: string
  discordUsername?: string
  source: string
  status: LeadStatus
  tags: string[]
  notes?: string
  lastContactDate?: string
  nextFollowUpDate?: string
  estimatedValue?: number
  actualValue?: number
  createdAt: string
  updatedAt: string
  unreadCount?: number
}

const PIPELINE_STAGES: { id: LeadStatus; name: string; color: string }[] = [
  { id: "new", name: "New", color: "bg-blue-500/20" },
  { id: "in_conversation", name: "In Conversation", color: "bg-purple-500/20" },
  { id: "proposal", name: "Proposal", color: "bg-orange-500/20" },
  { id: "negotiation", name: "Negotiation", color: "bg-yellow-500/20" },
  { id: "won", name: "Won", color: "bg-green-500/20" },
  { id: "lost", name: "Lost", color: "bg-gray-500/20" },
]

// Static leads data
const staticLeads: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    source: "manual",
    status: "new",
    tags: ["high-value", "enterprise"],
    estimatedValue: 15000,
    lastContactDate: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@startup.io",
    source: "referral",
    status: "new",
    tags: ["startup"],
    estimatedValue: 8000,
    lastContactDate: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    unreadCount: 2,
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "m.chen@company.com",
    source: "whop",
    status: "in_conversation",
    tags: ["saas", "b2b"],
    estimatedValue: 25000,
    lastContactDate: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@creative.co",
    source: "manual",
    status: "in_conversation",
    tags: ["agency"],
    estimatedValue: 12000,
    lastContactDate: new Date(Date.now() - 12 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 21 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "5",
    name: "Alex Thompson",
    email: "alex.t@ecommerce.shop",
    source: "referral",
    status: "proposal",
    tags: ["ecommerce", "retail"],
    estimatedValue: 35000,
    lastContactDate: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    nextFollowUpDate: new Date(Date.now() + 2 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
  },
  {
    id: "6",
    name: "Lisa Wang",
    email: "lisa@techfirm.com",
    source: "whop",
    status: "negotiation",
    tags: ["tech", "enterprise"],
    estimatedValue: 50000,
    lastContactDate: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    nextFollowUpDate: new Date(Date.now() + 1 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
  },
  {
    id: "7",
    name: "David Brown",
    email: "david@bigcorp.com",
    source: "referral",
    status: "won",
    tags: ["enterprise"],
    estimatedValue: 75000,
    actualValue: 80000,
    lastContactDate: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
  },
  {
    id: "8",
    name: "Jennifer Martinez",
    email: "jen@startup.co",
    source: "manual",
    status: "won",
    tags: ["startup", "saas"],
    estimatedValue: 20000,
    actualValue: 22000,
    lastContactDate: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
  },
  {
    id: "9",
    name: "Robert Wilson",
    email: "robert@smallbiz.com",
    source: "manual",
    status: "lost",
    tags: ["budget"],
    estimatedValue: 5000,
    lastContactDate: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 40 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
  },
]

export default function PipelinePage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string
  
  // Get token from URL for navigation
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const devToken = searchParams?.get("whop-dev-user-token")
  const tokenQuery = devToken ? `?whop-dev-user-token=${devToken}` : ""
  
  const [leads, setLeads] = useState<Lead[]>(staticLeads)
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)

  const getLeadsByStage = (stageId: LeadStatus) => {
    return leads.filter((lead) => lead.status === stageId)
  }

  const getTotalValueByStage = (stageId: LeadStatus) => {
    return getLeadsByStage(stageId).reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)
  }

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (stageId: LeadStatus) => {
    if (!draggedLead || draggedLead.status === stageId) {
      setDraggedLead(null)
      return
    }

    // Update local state only (static behavior)
    setLeads(leads.map((l) => (l.id === draggedLead.id ? { ...l, status: stageId } : l)))
    setDraggedLead(null)

    const stageName = PIPELINE_STAGES.find((s) => s.id === stageId)?.name || stageId
    toast.success(`Lead moved to ${stageName}!`)
  }

  // Calculate metrics
  const activeLeads = leads.filter(l => l.status !== 'won' && l.status !== 'lost')
  const wonLeads = leads.filter(l => l.status === 'won')
  const totalPipelineValue = activeLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)
  const totalWonValue = wonLeads.reduce((sum, lead) => sum + (lead.actualValue || lead.estimatedValue || 0), 0)
  const averageLeadValue = activeLeads.length > 0 ? totalPipelineValue / activeLeads.length : 0

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/dashboard/${companyId}${tokenQuery}`}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Pipeline</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance text-gray-900 dark:text-white">Pipeline</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your leads through the sales pipeline</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => router.push(`/dashboard/${companyId}/leads/new${tokenQuery}`)}>
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Pipeline Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <CardTitle className="text-sm font-medium">Active Pipeline</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">${totalPipelineValue.toLocaleString()}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{activeLeads.length} active leads</p>
            </div>
          </Card>
          <Card>
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <CardTitle className="text-sm font-medium">Won Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">${totalWonValue.toLocaleString()}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{wonLeads.length} won deals</p>
            </div>
          </Card>
          <Card>
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <CardTitle className="text-sm font-medium">Average Lead Value</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">${Math.round(averageLeadValue).toLocaleString()}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Per lead</p>
            </div>
          </Card>
          <Card>
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{wonLeads.length} of {leads.length} leads</p>
            </div>
          </Card>
        </div>

        {/* Pipeline Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id)
            const stageValue = getTotalValueByStage(stage.id)

            return (
              <div
                key={stage.id}
                className="flex flex-col flex-shrink-0 w-[280px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                <div className={`${stage.color} rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-800`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{stage.name}</h3>
                    <Badge variant="secondary" className="rounded-full">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ${stageValue.toLocaleString()}
                  </p>
                </div>

                <div className="flex-1 space-y-3 min-h-[400px]">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400 text-sm">
                      No leads
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <Card
                        key={lead.id}
                        className="cursor-move hover:shadow-md transition-shadow"
                        draggable
                        onDragStart={() => handleDragStart(lead)}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm mb-1 line-clamp-1 text-gray-900 dark:text-white">
                                {lead.name}
                              </h4>
                              {lead.unreadCount && lead.unreadCount > 0 && (
                                <Badge variant="destructive" className="rounded-full text-xs px-2">
                                  {lead.unreadCount}
                                </Badge>
                              )}
                            </div>
                            {lead.email && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                {lead.email}
                              </p>
                            )}
                          </div>

                          {(lead.estimatedValue || 0) > 0 && (
                            <div className="flex items-center justify-between text-sm border-t border-gray-200 dark:border-gray-800 pt-3">
                              <span className="text-gray-600 dark:text-gray-400 text-xs">Value</span>
                              <span className="font-bold text-sm text-gray-900 dark:text-white">
                                ${(lead.actualValue || lead.estimatedValue || 0).toLocaleString()}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Badge variant="outline" className="text-xs capitalize">
                              {lead.source}
                            </Badge>
                          </div>

                          {lead.lastContactDate && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <MessageSquare className="h-3 w-3 flex-shrink-0" />
                              <span>{format(new Date(lead.lastContactDate), "MMM d")}</span>
                            </div>
                          )}

                          {lead.nextFollowUpDate && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              <span>Follow-up: {format(new Date(lead.nextFollowUpDate), "MMM d")}</span>
                            </div>
                          )}

                          {lead.tags && lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2 border-t">
                              {lead.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                                  {tag}
                                </Badge>
                              ))}
                              {lead.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs px-2 py-0">
                                  +{lead.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
