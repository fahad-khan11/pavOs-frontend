"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Paperclip, Sparkles } from "lucide-react"
import toast from "react-hot-toast"

interface EmailComposerProps {
  to?: string
  subject?: string
  onSend: (email: EmailData) => void
  onCancel: () => void
}

export interface EmailData {
  to: string
  subject: string
  body: string
  template?: string
}

const EMAIL_TEMPLATES = [
  {
    id: "intro",
    name: "Introduction",
    subject: "Partnership Opportunity with [Your Name]",
    body: `Hi [Contact Name],

I hope this email finds you well. I'm reaching out to explore a potential partnership opportunity between us.

I'm a content creator focused on [your niche], with an engaged audience of [audience size] followers across [platforms]. I believe there's a great synergy between my content and [Company Name]'s brand values.

I'd love to discuss how we could collaborate on [specific campaign type]. Would you be available for a brief call next week to explore this further?

Looking forward to hearing from you!

Best regards,
[Your Name]`,
  },
  {
    id: "proposal",
    name: "Send Proposal",
    subject: "Partnership Proposal - [Campaign Name]",
    body: `Hi [Contact Name],

Thank you for your interest in collaborating! I've put together a detailed proposal for our partnership.

Campaign Overview:
- Platform: [Platform]
- Content Type: [Type]
- Timeline: [Timeline]
- Investment: $[Amount]

I've attached my media kit and rate card for your review. The proposal includes:
• [Deliverable 1]
• [Deliverable 2]
• [Deliverable 3]

I'm excited about the possibility of working together and happy to adjust the proposal based on your needs.

Please let me know if you have any questions!

Best regards,
[Your Name]`,
  },
  {
    id: "followup",
    name: "Follow Up",
    subject: "Following Up - [Campaign Name]",
    body: `Hi [Contact Name],

I wanted to follow up on my previous email regarding our potential partnership for [Campaign Name].

I understand you're likely busy, but I wanted to make sure my proposal didn't get lost in your inbox. I'm still very interested in working with [Company Name] and would love to discuss this opportunity further.

Would you have 15 minutes this week for a quick call?

Looking forward to your response!

Best regards,
[Your Name]`,
  },
  {
    id: "thankyou",
    name: "Thank You",
    subject: "Thank You - Excited to Partner!",
    body: `Hi [Contact Name],

Thank you so much for agreeing to move forward with our partnership! I'm really excited to work with [Company Name] on this campaign.

Next steps:
1. Review and sign the contract
2. Finalize content calendar
3. Begin content creation

I'll send over the contract by [date] and we can schedule a kickoff call to align on all the details.

Thanks again for this opportunity!

Best regards,
[Your Name]`,
  },
]

export function EmailComposer({ to = "", subject = "", onSend, onCancel }: EmailComposerProps) {
  const [formData, setFormData] = useState({
    to,
    subject,
    body: "",
    template: "",
  })

  const handleTemplateChange = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setFormData({
        ...formData,
        template: templateId,
        subject: template.subject,
        body: template.body,
      })
      toast.success(`Template "${template.name}" loaded`)
    }
  }

  const handleAIEnhance = () => {
    setFormData({
      ...formData,
      body: formData.body + "\n\n[AI-enhanced content would appear here with improved tone and clarity]",
    })
    toast.success("Email enhanced with AI")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSend(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email Templates</CardTitle>
          <CardDescription>Start with a pre-written template or write from scratch</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={formData.template} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template (optional)" />
            </SelectTrigger>
            <SelectContent>
              {EMAIL_TEMPLATES.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.template && (
            <Badge variant="secondary" className="mt-2">
              Using: {EMAIL_TEMPLATES.find((t) => t.id === formData.template)?.name}
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="to">To *</Label>
        <Input
          id="to"
          type="email"
          value={formData.to}
          onChange={(e) => setFormData({ ...formData, to: e.target.value })}
          placeholder="contact@brand.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Partnership Opportunity"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="body">Message *</Label>
          <Button type="button" variant="ghost" size="sm" onClick={handleAIEnhance} className="gap-2 h-8">
            <Sparkles className="h-3 w-3" />
            AI Enhance
          </Button>
        </div>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          rows={12}
          placeholder="Write your email message here..."
          required
        />
        <p className="text-xs text-gray-600 dark:text-gray-400">Tip: Use [Contact Name], [Company Name], etc. as placeholders</p>
      </div>

      <div className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <Paperclip className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Attachments: Media Kit.pdf, Rate Card.pdf</span>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="gap-2 bg-white dark:bg-gray-800 text-primary dark:text-white hover:bg-white/90 dark:hover:bg-gray-700">
          <Send className="h-4 w-4" />
          Send Email
        </Button>
      </div>
    </form>
  )
}
