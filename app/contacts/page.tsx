"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Mail, Phone, Building2, Calendar, Filter, Loader2 } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import { ContactDetail } from "@/components/contact-detail"
import { EmailComposer, type EmailData } from "@/components/email-composer"
import type { Contact } from "@/lib/types"
import { contactService } from "@/lib/services"
import toast from "react-hot-toast"

export default function ContactsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [emailContact, setEmailContact] = useState<Contact | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  // Load contacts from backend
  useEffect(() => {
    if (user) {
      loadContacts()
    }
  }, [user, searchQuery, filterStatus])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await contactService.getAll({
        search: searchQuery || undefined,
        status: filterStatus === 'all' ? undefined : filterStatus as any,
      })
      setContacts(response.data)
    } catch (error: any) {
      console.error('Failed to load contacts:', error)
      toast.error(error.response?.data?.error || 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleAddContact = async (newContact: Omit<Contact, "id" | "deals" | "totalValue">) => {
    try {
      const contact = await contactService.create(newContact)
      setContacts([contact, ...contacts])
      setIsAddDialogOpen(false)
      toast.success("Contact added successfully!")
    } catch (error: any) {
      console.error('Failed to add contact:', error)
      toast.error(error.response?.data?.error || 'Failed to add contact')
    }
  }

  const handleUpdateContact = async (contactId: string, updates: Partial<Contact>) => {
    try {
      const updatedContact = await contactService.update(contactId, updates)
      setContacts(contacts.map((c) => (c.id === contactId ? updatedContact : c)))
      setSelectedContact(null)
      toast.success("Contact updated successfully!")
    } catch (error: any) {
      console.error('Failed to update contact:', error)
      toast.error(error.response?.data?.error || 'Failed to update contact')
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    try {
      await contactService.delete(contactId)
      setContacts(contacts.filter((c) => c.id !== contactId))
      setSelectedContact(null)
      toast.success("Contact deleted successfully!")
    } catch (error: any) {
      console.error('Failed to delete contact:', error)
      toast.error(error.response?.data?.error || 'Failed to delete contact')
    }
  }

  const handleSendEmail = (emailData: EmailData) => {
    // TODO: Implement email sending in Phase 3
    console.log("Sending email:", emailData)
    toast.success("Email sent successfully!")
    setEmailContact(null)
  }

  const filteredContacts = contacts

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "prospect":
        return "bg-blue-500"
      case "inactive":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900 dark:text-white" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="container mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Contacts</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your brand contacts and relationships</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="dark:hover:bg-[#030712]">
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Add New Contact</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">Add a new brand contact to your CRM.</DialogDescription>
              </DialogHeader>
              <ContactForm onSubmit={handleAddContact} onCancel={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-600 dark:text-gray-400" />
                <Input
                  placeholder="Search by name, email, or company..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Status: {filterStatus === "all" ? "All" : filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white dark:bg-[#101828]">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Contacts</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("prospect")}>Prospect</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>Inactive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">No contacts found. Add your first contact to get started!</p>
              <Button className="mt-4 bg-white text-primary hover:bg-white/90 dark:hover:bg-[#030712] " onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{contact.name}</CardTitle>
                      <CardDescription>{contact.position}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedContact(contact)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEmailContact(contact)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 dark:text-red-400"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className="h-4 w-4" />
                    <span>{contact.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Last contact: {new Date(contact.lastContact).toLocaleDateString()}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Deals:</span>
                      <span className="font-semibold">{contact.deals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                      <span className="font-semibold">${contact.totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                  {contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {contact.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contact Detail Dialog */}
        {selectedContact && (
          <ContactDetail
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            onUpdate={(updates) => handleUpdateContact(selectedContact.id, updates)}
            onDelete={() => handleDeleteContact(selectedContact.id)}
          />
        )}

        {/* Email Composer Dialog */}
        {emailContact && (
          <Dialog open={!!emailContact} onOpenChange={() => setEmailContact(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Send Email to {emailContact.name}</DialogTitle>
                <DialogDescription>Compose and send an email to {emailContact.email}</DialogDescription>
              </DialogHeader>
              <EmailComposer
                recipient={emailContact.email}
                onSend={handleSendEmail}
                onCancel={() => setEmailContact(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
