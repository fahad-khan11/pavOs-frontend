"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { discordService } from "@/lib/services/discordService"
import { useSocket } from "@/hooks/use-socket"
import {
  ArrowLeft,
  Send,
  User,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Tag,
  DollarSign,
  Edit,
  Save,
  X,
  RefreshCw,
} from "lucide-react"
import toast from "react-hot-toast"
import { format } from "date-fns"

type LeadStatus = "new" | "in_conversation" | "proposal" | "negotiation" | "won" | "lost"

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  discordUserId?: string
  discordUsername?: string
  instagramUsername?: string
  tiktokUsername?: string
  source: string
  status: LeadStatus
  tags: string[]
  notes?: string
  lastContactDate?: string
  nextFollowUpDate?: string
  estimatedValue?: number
  createdAt: string
  updatedAt: string
}

interface Message {
  id: string
  content: string
  direction: "incoming" | "outgoing"
  authorUsername?: string
  isRead: boolean
  createdAt: string
  attachments?: Array<{
    url: string
    filename: string
  }>
}

const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-500",
  in_conversation: "bg-purple-500",
  proposal: "bg-orange-500",
  negotiation: "bg-yellow-500",
  won: "bg-green-500",
  lost: "bg-gray-500",
}

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.id as string
  const { socket, isConnected } = useSocket()

  const [lead, setLead] = useState<Lead | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageContent, setMessageContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (leadId) {
      // Redirect to new lead page if id is "new"
      if (leadId === "new") {
        router.replace("/leads/new")
        return
      }

      // Load initial data once
      loadLead()
      loadMessages()

      // Setup socket listeners for real-time updates
      if (socket && isConnected) {
        console.log("🔌 Setting up socket listeners for lead:", leadId)
        console.log("🔌 Socket ID:", socket.id)
        
        // Listen for new messages - REAL-TIME instead of polling
        socket.on("discord:message", (data: any) => {
          console.log("📨 Received discord:message event:", data)
          
          // Only add message if it's for this lead
          if (data.leadId === leadId) {
            console.log("✅ Message is for this lead, adding to UI")
            const newMessage: Message = {
              id: data.id,
              content: data.content,
              direction: data.direction,
              authorUsername: data.authorUsername,
              isRead: data.isRead,
              createdAt: data.createdAt,
              attachments: data.attachments,
            }
            
            setMessages((prev) => {
              // Check if message already exists
              if (prev.some((m) => m.id === newMessage.id)) {
                console.log("⚠️ Message already exists, skipping")
                return prev
              }
              console.log("✅ Adding new message to list")
              return [...prev, newMessage]
            })
            
            // Auto-scroll to new message
            setTimeout(() => scrollToBottom(), 100)
            
            // Show notification ONLY for incoming messages (from Discord)
            // Don't show for outgoing messages (sent from PaveOS) - those already have "Message sent!" toast
            if (data.direction === 'incoming') {
              toast.success(`New message from ${data.authorUsername || 'User'}`)
            }
          } else {
            console.log("⚠️ Message not for this lead. Message leadId:", data.leadId, "Current leadId:", leadId)
          }
        })

        // Listen for message read status updates
        socket.on("discord:messageRead", (data: any) => {
          console.log("📨 Received discord:messageRead event:", data)
          if (data.leadId === leadId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === data.messageId ? { ...m, isRead: true } : m
              )
            )
          }
        })

        // Listen for lead updates
        socket.on("lead:updated", (data: any) => {
          console.log("📝 Received lead:updated event:", data)
          if (data.id === leadId) {
            console.log("📝 Lead updated via socket:", data)
            setLead((prev) => (prev ? { ...prev, ...data } : null))
            toast.success("Lead updated")
          }
        })

        // Join the lead room for targeted updates
        socket.emit("lead:join", { leadId })
        console.log("🚪 Emitted lead:join for leadId:", leadId)
        // Note: discord:join is handled in separate useEffect after lead is loaded
      }

      // ⚠️ NO MORE POLLING - Socket handles real-time updates
      // Removed: setInterval(() => loadMessages(), 5000)

      // Cleanup
      return () => {
        if (socket) {
          socket.emit("lead:leave", { leadId })
          socket.off("discord:message")
          socket.off("discord:messageRead")
          socket.off("lead:updated")
          console.log("🚪 Left lead room:", leadId)
        }
      }
    }
  }, [leadId, router, socket, isConnected])

  // Join discord room when lead is loaded and socket is connected
  useEffect(() => {
    if (socket && isConnected && lead?.discordUserId) {
      console.log("🚪 Joining discord room for discordUserId:", lead.discordUserId)
      socket.emit("discord:join", { discordUserId: lead.discordUserId, leadId })
      
      return () => {
        if (socket && lead?.discordUserId) {
          socket.emit("discord:leave", { discordUserId: lead.discordUserId, leadId })
          console.log("🚪 Left discord room for discordUserId:", lead.discordUserId)
        }
      }
    }
  }, [socket, isConnected, lead?.discordUserId, leadId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadLead = async () => {
    try {
      setLoading(true)
      const data = await discordService.getLead(leadId)

      setLead(data.lead)
      setEditedLead(data.lead)

      // Load messages from the same response
      if (data.messages) {
        // Sort messages by createdAt ascending (oldest first) for chat view
        const sortedMessages = data.messages.sort((a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        setMessages(sortedMessages)

        // Mark unread messages as read
        const unreadMessages = data.messages.filter((m: any) => !m.isRead && m.direction === 'incoming')
        for (const msg of unreadMessages) {
          try {
            await discordService.markAsRead(msg.id)
          } catch (err) {
            console.error('Failed to mark message as read:', err)
          }
        }
      }
      setMessagesLoading(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to load lead")
      router.push("/leads")
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      setMessagesLoading(true)
      const data = await discordService.getLead(leadId)

      if (data.messages) {
        // Sort messages by createdAt ascending (oldest first) for chat view
        const sortedMessages = data.messages.sort((a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        setMessages(sortedMessages)

        // Mark any new unread messages as read
        const unreadMessages = data.messages.filter((m: any) => !m.isRead && m.direction === 'incoming')
        for (const msg of unreadMessages) {
          try {
            await discordService.markAsRead(msg.id)
          } catch (err) {
            console.error('Failed to mark message as read:', err)
          }
        }
      }
    } catch (error: any) {
      console.error("Failed to load messages:", error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !lead?.discordUserId) {
      toast.error("Please enter a message")
      return
    }

    try {
      setSendingMessage(true)
      await discordService.sendMessage({
        discordUserId: lead.discordUserId,
        content: messageContent,
      })

      setMessageContent("")
      toast.success("Message sent!")
    } catch (error: any) {
      toast.error(error.message || "Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleUpdateLead = async () => {
    try {
      const updatedLead = await discordService.updateLead(leadId, editedLead as any)
      setLead(updatedLead)
      setIsEditing(false)
      toast.success("Lead updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update lead")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 bg-white dark:bg-gray-950 min-h-screen">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-3 gap-8">
          <Skeleton className="h-[600px] col-span-1" />
          <Skeleton className="h-[600px] col-span-2" />
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="container mx-auto py-8 bg-white dark:bg-gray-950 min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lead not found</h2>
          <Button onClick={() => router.push("/leads")} className="mt-4">
            Back to Leads
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
      <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/leads")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <Badge className={statusColors[lead.status]}>
            {lead.status.replace("_", " ")}
          </Badge>
        </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{lead.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Lead Details & Conversation</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Info Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Lead Information</CardTitle>
            {!isEditing ? (
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={handleUpdateLead}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false)
                    setEditedLead(lead)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                Name
              </label>
              {isEditing ? (
                <Input
                  value={editedLead.name || ""}
                  onChange={(e) => setEditedLead({ ...editedLead, name: e.target.value })}
                />
              ) : (
                <p className="text-sm">{lead.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editedLead.email || ""}
                  onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                  placeholder="email@example.com"
                />
              ) : (
                <p className="text-sm">{lead.email || "Not provided"}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4" />
                Phone
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={editedLead.phone || ""}
                  onChange={(e) => setEditedLead({ ...editedLead, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              ) : (
                <p className="text-sm">{lead.phone || "Not provided"}</p>
              )}
            </div>

            <Separator />

            {/* Discord Username */}
            {lead.discordUsername && (
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  💬 Discord
                </label>
                <p className="text-sm">{lead.discordUsername}</p>
              </div>
            )}

            {/* Source */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                Source
              </label>
              <Badge variant="outline" className="capitalize">
                {lead.source}
              </Badge>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                Status
              </label>
              {isEditing ? (
                <Select
                  value={editedLead.status}
                  onValueChange={(value) =>
                    setEditedLead({ ...editedLead, status: value as LeadStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_conversation">In Conversation</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={statusColors[lead.status]}>
                  {lead.status.replace("_", " ")}
                </Badge>
              )}
            </div>

            {/* Estimated Value */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Estimated Value
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedLead.estimatedValue || ""}
                  onChange={(e) =>
                    setEditedLead({ ...editedLead, estimatedValue: Number(e.target.value) })
                  }
                  placeholder="1000"
                />
              ) : (
                <p className="text-sm">
                  {lead.estimatedValue ? `$${lead.estimatedValue}` : "Not set"}
                </p>
              )}
            </div>

            <Separator />

            {/* Next Follow-up Date */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                Next Follow-up
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedLead.nextFollowUpDate ? new Date(editedLead.nextFollowUpDate).toISOString().split('T')[0] : ""}
                  onChange={(e) =>
                    setEditedLead({ ...editedLead, nextFollowUpDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                  }
                />
              ) : (
                <p className="text-sm">
                  {lead.nextFollowUpDate
                    ? format(new Date(lead.nextFollowUpDate), "MMM d, yyyy")
                    : "Not set"}
                </p>
              )}
            </div>

            {/* Last Contact */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4" />
                Last Contact
              </label>
              <p className="text-sm">
                {lead.lastContactDate
                  ? format(new Date(lead.lastContactDate), "MMM d, yyyy 'at' h:mm a")
                  : "Never"}
              </p>
            </div>

            {/* Last Contact */}
            {/* <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                Last Contact
              </label>
              <p className="text-sm">
                {lead.lastContactDate
                  ? format(new Date(lead.lastContactDate), "MMM d, yyyy 'at' h:mm a")
                  : "Never"}
              </p>
            </div> */}

            {/* Tags */}
            {/* <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div> */}

            {/* Notes */}
            {/* <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              {isEditing ? (
                <Textarea
                  value={editedLead.notes || ""}
                  onChange={(e) => setEditedLead({ ...editedLead, notes: e.target.value })}
                  placeholder="Add notes about this lead..."
                  rows={4}
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lead.notes || "No notes added"}
                </p>
              )}
            </div> */}

            {/* Created Date */}
            {/* <div>
              <label className="text-sm font-medium mb-2 block">Created</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(new Date(lead.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div> */}
          </CardContent>
        </Card>

        {/* Messages Panel */}
        <Card className="lg:col-span-2 flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
          <CardHeader className="flex-shrink-0 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Conversation History
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  {lead.discordUserId
                    ? "Send and receive Discord messages"
                    : "No messaging platform connected"}
                  {/* Socket Status Indicator */}
                  <span className="flex items-center gap-1 text-xs ml-2">
                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </CardDescription>
              </div>
              {/* Manual Refresh Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadMessages()}
                title="Refresh messages"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto px-6 scroll-smooth" style={{ height: '100%' }}>
              {messagesLoading ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <MessageSquare className="h-12 w-12 text-gray-600 dark:text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    {lead.discordUserId
                      ? "Start a conversation by sending a message below"
                      : "Connect a messaging platform to start chatting"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 py-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === "outgoing" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.direction === "outgoing"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">
                            {message.authorUsername || "Unknown"}
                          </span>
                          <span className="text-xs opacity-70">
                            {format(new Date(message.createdAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((att, idx) => (
                              <a
                                key={idx}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline block"
                              >
                                {att.filename}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            {lead.discordUserId && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex-shrink-0 bg-white dark:bg-gray-900">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageContent.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
