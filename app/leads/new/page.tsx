"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { discordService } from "@/lib/services/discordService"
import { ArrowLeft, UserPlus, Save } from "lucide-react"
import toast from "react-hot-toast"

type LeadSource = "discord" | "instagram" | "tiktok" | "whop" | "manual" | "referral"
type LeadStatus = "new" | "in_conversation" | "proposal" | "negotiation" | "won" | "lost"

export default function NewLeadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    discordUsername: "",
    instagramUsername: "",
    tiktokUsername: "",
    source: "manual" as LeadSource,
    status: "new" as LeadStatus,
    tags: "",
    notes: "",
    estimatedValue: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    // Validate Discord username if source is Discord
    if (formData.source === "discord" && !formData.discordUsername.trim()) {
      toast.error("Discord username is required when source is Discord")
      return
    }

    try {
      setLoading(true)
      
      // Process tags
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      // Prepare lead data
      const leadData: any = {
        name: formData.name.trim(),
        source: formData.source,
        status: formData.status,
        tags,
      }

      // Add optional fields if provided
      if (formData.email.trim()) leadData.email = formData.email.trim()
      if (formData.phone.trim()) leadData.phone = formData.phone.trim()
      // Discord username is required if source is discord (validated above), include if provided
      if (formData.discordUsername.trim()) {
        leadData.discordUsername = formData.discordUsername.trim()
      }
      // if (formData.instagramUsername.trim()) leadData.instagramUsername = formData.instagramUsername.trim()
      // if (formData.tiktokUsername.trim()) leadData.tiktokUsername = formData.tiktokUsername.trim()
      if (formData.notes.trim()) leadData.notes = formData.notes.trim()
      if (formData.estimatedValue.trim()) {
        const value = parseFloat(formData.estimatedValue)
        if (!isNaN(value)) leadData.estimatedValue = value
      }

      const newLead = await discordService.createLead(leadData)
      
      toast.success("Lead created successfully!")
      router.push("/leads")
    } catch (error: any) {
      console.error("Error creating lead:", error)
      toast.error(error.message || "Failed to create lead")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Lead</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create a new lead manually
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
            <CardDescription>
              Fill in the details to create a new lead
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-white">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter lead name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-900 dark:text-white">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="estimatedValue" className="text-sm font-medium text-gray-900 dark:text-white">
                      Estimated Value
                    </label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      step="0.01"
                      value={formData.estimatedValue}
                      onChange={(e) => handleChange("estimatedValue", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Source & Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Details</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="source" className="text-sm font-medium text-gray-900 dark:text-white">
                      Source <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) => handleChange("source", value)}
                    >
                      <SelectTrigger id="source">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900">
                        <SelectItem value="manual">Manual</SelectItem>
                        {/* <SelectItem value="discord">Discord</SelectItem> */}
                        {/* <SelectItem value="instagram">Instagram</SelectItem> */}
                        {/* <SelectItem value="tiktok">TikTok</SelectItem> */}
                        {/* <SelectItem value="whop">Whop</SelectItem> */}
                        {/* <SelectItem value="referral">Referral</SelectItem> */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium text-gray-900 dark:text-white">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900">
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_conversation">In Conversation</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Social Media Usernames */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media</h3>
                
                <div className="grid gap-4 md:grid-cols-1">
                  <div className="space-y-2">
                    <label htmlFor="discordUsername" className="text-sm font-medium text-gray-900 dark:text-white">
                      Discord Username
                      {formData.source === "discord" ? (
                        <span className="text-red-500"> *</span>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400"> (optional)</span>
                      )}
                    </label>
                    <Input
                      id="discordUsername"
                      value={formData.discordUsername}
                      onChange={(e) => handleChange("discordUsername", e.target.value)}
                      placeholder="username#1234"
                      required={formData.source === "discord"}
                    />
                  </div>

                  {/* <div className="space-y-2">
                    <label htmlFor="instagramUsername" className="text-sm font-medium">
                      Instagram Username
                    </label>
                    <Input
                      id="instagramUsername"
                      value={formData.instagramUsername}
                      onChange={(e) => handleChange("instagramUsername", e.target.value)}
                      placeholder="@username"
                    />
                  </div> */}

                  {/* <div className="space-y-2">
                    <label htmlFor="tiktokUsername" className="text-sm font-medium">
                      TikTok Username
                    </label>
                    <Input
                      id="tiktokUsername"
                      value={formData.tiktokUsername}
                      onChange={(e) => handleChange("tiktokUsername", e.target.value)}
                      placeholder="@username"
                    />
                  </div> */}
                </div>
              </div>

              {/* Tags & Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Information</h3>
                
                <div className="space-y-2">
                  <label htmlFor="tags" className="text-sm font-medium text-gray-900 dark:text-white">
                    Tags
                  </label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    placeholder="tag1, tag2, tag3 (comma separated)"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Separate tags with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium text-gray-900 dark:text-white">
                    Notes
                  </label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Add any additional notes about this lead..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="outline" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Creating..." : "Create Lead"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

