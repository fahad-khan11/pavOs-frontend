"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Camera, Save, Loader2, User, Mail, Shield } from "lucide-react"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Dummy data state initialized from user or defaults
  const [formData, setFormData] = useState({
    name: user?.name || "Creator Name",
    email: user?.email || "creator@example.com",
    bio: "Content Creator | Digital Artist | Tech Enthusiast",
    website: "https://paveos.com",
    location: "San Francisco, CA",
  })

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-white dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900 dark:text-white" />
      </div>
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast.success("Profile updated successfully")
    }, 1000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your personal information and preferences
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your photo and personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={formData.name} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                      {formData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{formData.name}</h3>
                  <p className="text-sm text-gray-500">{formData.email}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Pro Plan
                    </Badge>
                    <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Form Section */}
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="pl-9"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="pl-9"
                        placeholder="your@email.com"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Tell us a little about yourself"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Security Card (Visual only) */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
