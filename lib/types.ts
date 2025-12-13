export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: "creator" | "manager" | "admin"
  subscriptionPlan: "Starter" | "Pro" | "Agency"
  whopId?: string
  createdAt: string
  lastLogin: string
  avatar?: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  position: string
  status: "active" | "prospect" | "inactive"
  tags: string[]
  lastContact: string
  notes: string
  deals: number
  totalValue: number
}

export interface Deal {
  id: string
  creatorId: string
  brandName: string
  brandContact: string
  dealValue: number
  stage: "Lead" | "Negotiation" | "Paid"
  startDate: string
  deadline: string
  notes: string
  status: "active" | "completed"
  attachments: string[]
  contactId?: string
  contactName?: string
  company?: string
  probability?: number
  expectedCloseDate?: string
  createdDate: string
  tags: string[]
}

export interface Deliverable {
  id: string
  dealId: string
  dealName: string
  brandName: string
  title: string
  description: string
  dueDate: string
  status: "Pending" | "In Progress" | "Submitted" | "Approved"
  assignedTo: string
  fileUploads: FileUpload[]
  revisionNotes: string
  createdAt: string
}

export interface FileUpload {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

export interface Payment {
  id: string
  dealId: string
  brandName: string
  amount: number
  paymentStatus: "Pending" | "Paid" | "Overdue"
  invoiceUrl?: string
  dueDate: string
  paymentDate?: string
  reminderSent: boolean
  notes: string
  createdAt: string
}

export interface Integration {
  id: string
  type: "Discord" | "Whop" | "Email"
  status: "active" | "inactive"
  webhookUrl?: string
  lastSync?: string
  config: Record<string, any>
  createdAt: string
}

export interface PricingPlan {
  id: string
  planName: "Starter" | "Pro" | "Agency"
  pricePerMonth: number
  features: string[]
  dealLimit: number
  teamLimit: number
  integrationAccess: boolean
  createdAt: string
}

export interface TeamMember {
  id: string
  teamId: string
  ownerId: string
  memberName: string
  memberEmail: string
  role: "editor" | "assistant" | "manager"
  avatar?: string
  joinedAt: string
}

export interface UserSettings {
  userId: string
  notificationsEnabled: boolean
  theme: "light" | "dark" | "system"
  language: string
  emailNotifications: boolean
  discordNotifications: boolean
}

export interface Activity {
  id: string
  type: "email" | "call" | "meeting" | "note" | "payment" | "deliverable"
  contactId?: string
  dealId?: string
  description: string
  date: string
  createdBy: string
}
