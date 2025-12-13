"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Building2, Calendar, Edit, Trash2, DollarSign, User, Mail, Phone, FileText } from "lucide-react"
import { DealForm } from "@/components/deal-form"
import type { Deal } from "@/lib/types"

interface DealDetailProps {
  deal: Deal
  onClose: () => void 
  onUpdate: (deal: Deal) => void
  onDelete: (id: string) => void
  onSendEmail?: () => void
}

export function DealDetail({ deal, onClose, onUpdate, onDelete, onSendEmail }: DealDetailProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdate = (updatedDeal: Deal) => {
    onUpdate(updatedDeal)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this deal?")) {
      onDelete(deal.id)
    }
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
      contacted: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      proposal: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      negotiation: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      contracted: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      completed: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200",
    }
    return colors[stage] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        {isEditing ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Edit Deal</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">Update deal information</DialogDescription>
            </DialogHeader>
            <DealForm deal={deal} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl text-gray-900 dark:text-white">{deal.title}</DialogTitle>
                  <DialogDescription className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Building2 className="h-4 w-4" />
                    {deal.company}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStageColor(deal.stage)}>{deal.stage}</Badge>
                <Badge variant="outline">{deal.probability}% probability</Badge>
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Deal Value</CardTitle>
                      <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">${deal?.value?.toLocaleString()}</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Weighted: ${Math.round(deal?.value * (deal?.probability / 100)).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Expected Close</CardTitle>
                      <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{deal.expectedCloseDate}</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Created: {deal.createdDate}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Deal Progress</CardTitle>
                    <CardDescription>Current stage in the pipeline</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Probability of closing</span>
                      <span className="font-medium text-gray-900 dark:text-white">{deal.probability}%</span>
                    </div>
                    <Progress value={deal.probability} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Contact Person</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{deal.contactName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Company</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{deal.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {deal.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{deal.notes || "No notes available"}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <CardDescription>Timeline of interactions for this deal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          date: "2024-01-15",
                          type: "email",
                          action: "Proposal sent",
                          description: "Sent detailed proposal with pricing breakdown",
                        },
                        {
                          date: "2024-01-12",
                          type: "call",
                          action: "Discovery call",
                          description: "30-minute call to discuss requirements",
                        },
                        {
                          date: "2024-01-10",
                          type: "note",
                          action: "Deal created",
                          description: "Initial inquiry received via email",
                        },
                      ].map((activity, i) => (
                        <div key={i} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{activity.action}</p>
                              <span className="text-xs text-gray-600 dark:text-gray-400">{activity.date}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={onSendEmail}>
                      <Mail className="h-4 w-4" />
                      Send Email
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Phone className="h-4 w-4" />
                      Log Call
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <FileText className="h-4 w-4" />
                      Add Note
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Documents & Files</CardTitle>
                    <CardDescription>Proposals, contracts, and other files</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Partnership Proposal.pdf", date: "2024-01-15", size: "245 KB" },
                        { name: "Media Kit.pdf", date: "2024-01-12", size: "1.2 MB" },
                        { name: "Rate Card.xlsx", date: "2024-01-10", size: "89 KB" },
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{doc.name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {doc.date} • {doc.size}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
