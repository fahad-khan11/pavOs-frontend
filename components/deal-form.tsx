"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Deal, Contact } from "@/lib/types"
import { contactService } from "@/lib/services"
import toast from "react-hot-toast"

interface DealFormProps {
  deal?: Deal
  onSubmit: (deal: Omit<Deal, "id" | "creatorId" | "createdDate"> | Deal) => void
  onCancel: () => void
}

export function DealForm({ deal, onSubmit, onCancel }: DealFormProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    brandName: deal?.brandName || "",
    brandContact: deal?.brandContact || "",
    contactId: deal?.contactId || "",
    contactName: deal?.contactName || "",
    company: deal?.company || "",
    dealValue: deal?.dealValue || 0,
    status: deal?.status || "active",
    stage: deal?.stage || "Lead",
    probability: deal?.probability || 30,
    deadline: deal?.deadline || "",
    notes: deal?.notes || "",
    tags: deal?.tags?.join(", ") || "",
  })

  useEffect(() => {
    // Load contacts from backend
    const loadContacts = async () => {
      try {
        setLoading(true)
        const response = await contactService.getAll({ status: 'active' })
        setContacts(response.data)
      } catch (error: any) {
        console.error('Failed to load contacts:', error)
        toast.error('Failed to load contacts')
      } finally {
        setLoading(false)
      }
    }
    loadContacts()
  }, [])

  const handleContactChange = (contactId: string) => {
    const selectedContact = contacts.find((c) => c.id === contactId)
    if (selectedContact) {
      setFormData({
        ...formData,
        contactId,
        contactName: selectedContact.name,
        company: selectedContact.company || '',
        brandContact: selectedContact.email,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.brandName.trim()) {
      toast.error('Brand name is required')
      return
    }
    if (!formData.brandContact.trim()) {
      toast.error('Brand contact is required')
      return
    }
    if (!formData.dealValue || formData.dealValue <= 0) {
      toast.error('Deal value must be greater than 0')
      return
    }
    if (!formData.deadline) {
      toast.error('Deadline is required')
      return
    }

    const dealData = {
      ...formData,
      dealValue: Number(formData.dealValue),
      probability: Number(formData.probability),
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      // Convert date to ISO string
      deadline: new Date(formData.deadline).toISOString(),
    }

    // Remove empty optional fields
    if (!dealData.contactId) delete dealData.contactId
    if (!dealData.contactName) delete dealData.contactName
    if (!dealData.company) delete dealData.company
    if (!dealData.notes) delete dealData.notes
    if (dealData.tags.length === 0) delete dealData.tags

    if (deal) {
      onSubmit({ ...dealData, id: deal.id, creatorId: deal.creatorId, createdDate: deal.createdDate })
    } else {
      onSubmit(dealData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="brandName">Brand Name *</Label>
        <Input
          id="brandName"
          value={formData.brandName}
          onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
          placeholder="TechBrand Co."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brandContact">Brand Contact (Email) *</Label>
          <Input
            id="brandContact"
            type="email"
            value={formData.brandContact}
            onChange={(e) => setFormData({ ...formData, brandContact: e.target.value })}
            placeholder="contact@brand.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dealValue">Deal Value ($) *</Label>
          <Input
            id="dealValue"
            type="number"
            min="0"
            step="0.01"
            value={formData.dealValue}
            onChange={(e) => setFormData({ ...formData, dealValue: Number(e.target.value) })}
            placeholder="5000"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact">Link to Contact (Optional)</Label>
          <Select value={formData.contactId} onValueChange={handleContactChange} disabled={loading}>
            <SelectTrigger id="contact">
              <SelectValue placeholder={loading ? "Loading contacts..." : "Select a contact"} />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name} - {contact.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company (Optional)</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="TechBrand Co."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage">Pipeline Stage *</Label>
          <Select
            value={formData.stage}
            onValueChange={(value) => setFormData({ ...formData, stage: value })}
          >
            <SelectTrigger id="stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Proposal">Proposal</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Contracted">Contracted</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="probability">Probability (%) *</Label>
          <Input
            id="probability"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline *</Label>
        <Input
          id="deadline"
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="instagram, tech, high-value"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="Add any relevant notes about this deal..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-white dark:bg-gray-800 text-primary dark:text-white hover:bg-white/90 dark:hover:bg-gray-700">
          {deal ? "Update Deal" : "Add Deal"}
        </Button>
      </div>
    </form>
  )
}
