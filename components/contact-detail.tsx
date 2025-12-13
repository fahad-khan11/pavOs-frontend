"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, Building2, Calendar, Edit, Trash2, DollarSign, Briefcase } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import type { Contact } from "@/lib/types"

interface ContactDetailProps {
  contact: Contact
  onClose: () => void
  onUpdate: (contact: Contact) => void
  onDelete: (id: string) => void
}

export function ContactDetail({ contact, onClose, onUpdate, onDelete }: ContactDetailProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdate = (updatedContact: Contact) => {
    onUpdate(updatedContact)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this contact?")) {
      onDelete(contact.id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
      case "prospect":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
      case "inactive":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        {isEditing ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Edit Contact</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">Update contact information</DialogDescription>
            </DialogHeader>
            <ContactForm contact={contact} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl text-gray-900 dark:text-white">{contact.name}</DialogTitle>
                  <DialogDescription className="mt-1 text-gray-600 dark:text-gray-400">{contact.position}</DialogDescription>
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
              <Badge className={`mt-2 w-fit ${getStatusColor(contact.status)}`}>{contact.status}</Badge>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="deals">Deals</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Company</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contact.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contact.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Last Contact</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contact.lastContact}</p>
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
                      {contact.tags.map((tag) => (
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{contact.notes || "No notes available"}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                      <Briefcase className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{contact?.deals}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                      <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${contact?.totalValue?.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <CardDescription>Timeline of interactions with this contact</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { date: "2024-01-15", action: "Email sent", description: "Sent Q2 campaign proposal" },
                        { date: "2024-01-10", action: "Meeting", description: "Video call to discuss partnership" },
                        {
                          date: "2024-01-05",
                          action: "Email received",
                          description: "Expressed interest in collaboration",
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
              </TabsContent>

              <TabsContent value="deals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Associated Deals</CardTitle>
                    <CardDescription>All deals with this contact</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {contact.deals > 0 ? (
                        [
                          { name: "Q1 Instagram Campaign", value: 5000, status: "Completed" },
                          { name: "YouTube Sponsorship", value: 8000, status: "In Progress" },
                          { name: "Blog Post Series", value: 2000, status: "Completed" },
                        ]
                          .slice(0, contact.deals)
                          .map((deal, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="text-sm font-medium">{deal.name}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{deal.status}</p>
                              </div>
                              <span className="text-sm font-medium">${deal?.value?.toLocaleString()}</span>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">No deals yet</p>
                      )}
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
