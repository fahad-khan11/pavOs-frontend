"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Building, Calendar, Shield, Clock } from "lucide-react"
import { useAppSelector } from "@/lib/redux"
import { format } from "date-fns"

export function WhopProfileCard() {
  const { user, company, access, isLoaded } = useAppSelector((state) => state.whop)

  if (!isLoaded) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="flex items-center justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
        <CardContent className="flex flex-col items-center justify-center py-10 text-red-500">
           <Shield className="h-10 w-10 mb-2 opacity-50" />
           <p className="font-medium">Unable to load Whop Profile</p>
           <p className="text-sm opacity-80">User data not found in store</p>
        </CardContent>
      </Card>
    )
  }

  // Determine role from access level
  const role = access?.access_level || "member"

  return (
    <Card className="stats-card bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"> 
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Whop Profile</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">Synced data from your Whop account connection</CardDescription>
            </div>
            <Badge variant={
                role === 'owner' ? 'default' : 
                role === 'admin' ? 'secondary' : 'outline'
            } className="w-fit">
                {role.toUpperCase()}
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
                <p className="font-semibold text-gray-900 dark:text-white text-lg">{user.name}</p>
            </div>
            
            {/* Username */}
            <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> Username
                </p>
                <p className="font-medium text-gray-900 dark:text-white break-all">@{user.username}</p>
            </div>

            {/* User ID */}
            <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" /> User ID
                </p>
                <code className="text-xs bg-white dark:bg-gray-950 px-2 py-1.5 rounded-md font-mono text-gray-900 dark:text-gray-200 block w-fit border border-gray-100 dark:border-gray-800">{user.id}</code>
            </div>

            {/* Company ID */}
            <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Building className="h-3.5 w-3.5" /> Company
                </p>
                <p className="font-medium text-gray-900 dark:text-white">{company?.title || "N/A"}</p>
                <code className="text-xs bg-white dark:bg-gray-950 px-2 py-1.5 rounded-md font-mono text-gray-900 dark:text-gray-200 block w-fit border border-gray-100 dark:border-gray-800">{company?.id || "N/A"}</code>
            </div>

            {/* Joined Date */}
            <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> Joined
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                    {user.created_at ? format(new Date(user.created_at), 'MMMM do, yyyy') : 'N/A'}
                </p>
            </div>

            {/* Access Status */}
             <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Access Status
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                    {access?.has_access ? (
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="destructive">No Access</Badge>
                    )}
                </p>
            </div>
        </div>

        {/* Bio Section */}
        {user.bio && (
          <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bio</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
