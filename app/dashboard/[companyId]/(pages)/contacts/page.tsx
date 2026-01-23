"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"

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
import { Plus, Search, MoreVertical, Mail, Phone, Building2, Calendar, Filter } from "lucide-react"
import toast from "react-hot-toast"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  position: string
  status: "active" | "prospect" | "inactive"
  lastContact: string
  deals: number
  totalValue: number
  tags: string[]
  notes?: string
}

// Static contacts data
const staticContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    phone: "+1 (555) 123-4567",
    company: "TechCorp Inc.",
    position: "Marketing Director",
    status: "active",
    lastContact: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    deals: 3,
    totalValue: 45000,
    tags: ["enterprise", "tech"],
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@innovate.io",
    phone: "+1 (555) 234-5678",
    company: "Innovate.io",
    position: "CEO",
    status: "active",
    lastContact: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    deals: 5,
    totalValue: 120000,
    tags: ["startup", "high-value"],
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily@creativestudio.com",
    phone: "+1 (555) 345-6789",
    company: "Creative Studio",
    position: "Creative Director",
    status: "prospect",
    lastContact: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
    deals: 0,
    totalValue: 0,
    tags: ["agency", "creative"],
  },
  {
    id: "4",
    name: "James Wilson",
    email: "j.wilson@globalretail.com",
    phone: "+1 (555) 456-7890",
    company: "Global Retail Co.",
    position: "VP of Sales",
    status: "active",
    lastContact: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    deals: 8,
    totalValue: 250000,
    tags: ["retail", "enterprise"],
  },
  {
    id: "5",
    name: "Amanda Martinez",
    email: "amanda@startuplab.co",
    phone: "+1 (555) 567-8901",
    company: "Startup Lab",
    position: "Founder",
    status: "prospect",
    lastContact: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    deals: 1,
    totalValue: 15000,
    tags: ["startup"],
  },
  {
    id: "6",
    name: "Robert Taylor",
    email: "rtaylor@oldclient.com",
    phone: "+1 (555) 678-9012",
    company: "Old Client LLC",
    position: "Operations Manager",
    status: "inactive",
    lastContact: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
    deals: 2,
    totalValue: 30000,
    tags: ["legacy"],
  },
]

export default function ContactsPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string
  
  // Get token from URL for navigation
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const devToken = searchParams?.get("whop-dev-user-token")
  const tokenQuery = devToken ? `?whop-dev-user-token=${devToken}` : ""
  
  const [contacts, setContacts] = useState<Contact[]>(staticContacts)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const handleDeleteContact = (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return
    setContacts(contacts.filter((c) => c.id !== contactId))
    setSelectedContact(null)
    toast.success("Contact deleted successfully!")
  }

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "all" || contact.status === filterStatus

    return matchesSearch && matchesStatus
  })

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-8">

      <main className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/dashboard/${companyId}${tokenQuery}`}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Contacts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center justify-between">
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
                <div className="py-4 text-center text-gray-600 dark:text-gray-400">
                  Contact form coming soon...
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
        {filteredContacts.length === 0 ? (
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
                      <DropdownMenuContent align="end" className="bg-white dark:bg-[#101828]">
                        <DropdownMenuItem onClick={() => setSelectedContact(contact)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Email feature coming soon!")}>
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
                      <span className="font-semibold text-gray-900 dark:text-white">{contact.deals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">${contact.totalValue.toLocaleString()}</span>
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
          <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
            <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">{selectedContact.name}</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  {selectedContact.position} at {selectedContact.company}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedContact.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedContact.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <Badge className={getStatusColor(selectedContact.status)}>{selectedContact.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Contact</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedContact.lastContact).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Deals</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedContact.deals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                    <p className="font-medium text-gray-900 dark:text-white">${selectedContact.totalValue.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedContact.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedContact(null)}>Close</Button>
                <Button variant="destructive" onClick={() => handleDeleteContact(selectedContact.id)}>Delete</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
