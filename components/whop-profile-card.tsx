"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Mail, Building, Calendar, Shield, Clock } from "lucide-react"
import { getWhopProfile, WhopProfile } from "@/lib/services/whopProfileService"
import { format } from "date-fns"

export function WhopProfileCard() {
  const [profile, setProfile] = useState<WhopProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getWhopProfile()
        setProfile(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (error || !profile) {
    return (
      <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
        <CardContent className="flex flex-col items-center justify-center py-10 text-red-500">
           <Shield className="h-10 w-10 mb-2 opacity-50" />
           <p className="font-medium">Unable to load Whop Profile</p>
           <p className="text-sm opacity-80">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="stats-card bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"> 
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Whop Profile</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">Synced data from your Whop account connection</CardDescription>
            </div>
            <Badge variant={
                profile.role === 'owner' ? 'default' : 
                profile.role === 'admin' ? 'secondary' : 'outline'
            } className="w-fit">
                {profile.role.toUpperCase()}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
            
            {/* Name */}
            <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> Name
                </p>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">{profile.name}</p>
            </div>
            
            {/* Email */}
            <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> Email
                </p>
                <p className="font-medium text-gray-900 dark:text-white break-all">{profile.email}</p>
            </div>

            {/* User ID */}
            <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" /> User ID
                </p>
                <code className="text-xs bg-white dark:bg-gray-950 px-2 py-1.5 rounded-md font-mono text-gray-900 dark:text-gray-200 block w-fit border border-gray-100 dark:border-gray-800">{profile.id}</code>
            </div>

            {/* Company ID */}
            <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Building className="h-3.5 w-3.5" /> Company ID
                </p>
                <code className="text-xs bg-white dark:bg-gray-950 px-2 py-1.5 rounded-md font-mono text-gray-900 dark:text-gray-200 block w-fit border border-gray-100 dark:border-gray-800">{profile.companyId}</code>
            </div>

            {/* Dates */}
            <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> Joined
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                    {profile.createdAt ? format(new Date(profile.createdAt), 'MMMM do, yyyy') : 'N/A'}
                </p>
            </div>

             <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Last Login
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                    {profile.lastLogin ? format(new Date(profile.lastLogin), 'PPp') : 'N/A'}
                </p>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
