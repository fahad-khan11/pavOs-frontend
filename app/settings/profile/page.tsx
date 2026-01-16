"use client"

// import { useAuth } from "@/components/auth-provider"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Loader2 } from "lucide-react"
import { WhopProfileCard } from "@/components/whop-profile-card"

export default function ProfilePage() {
  // const { isLoading: authLoading } = useAuth()

  // if (authLoading) {
  //   return (
  //     <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
  //       <Loader2 className="h-8 w-8 animate-spin text-foreground" />
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-400 dark:text-gray-600" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-gray-900 dark:text-white">Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              View your Whop profile details
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          <WhopProfileCard />
        </div>
      </main>
    </div>
  )
}



