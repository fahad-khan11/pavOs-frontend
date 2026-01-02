"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  MessageSquare,
  Kanban,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  LogOut
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/leads", icon: MessageSquare },
    { name: "Pipeline", href: "/pipeline", icon: Kanban },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex flex-col h-screen border-r bg-[#0e1d3a] text-white transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Toggle Button */}
        <div className="absolute -right-4 top-7 z-20">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full border bg-white text-[#0e1d3a] shadow-md hover:bg-gray-100"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
        </div>

        {/* Logo Section */}
        <div className={cn("flex h-16 items-center px-4", isCollapsed ? "justify-center" : "gap-3")}>
          <div className="h-8 w-8 overflow-hidden rounded-lg flex-shrink-0">
             <Image
                 src="/paveOs-logo.jpg"
                 alt="PaveOS Logo"
                 width={32}
                 height={32}
                 className="object-cover"
             />
          </div>
          {!isCollapsed && (
             <span className="text-lg font-bold truncate">
               PaveOS
             </span>
          )}
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              
              if (isCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                         href={item.href}
                         className={cn(
                           "flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-white/10",
                           isActive ? "bg-white text-[#0e1d3a] hover:bg-white hover:text-[#0e1d3a]" : "text-white/70"
                         )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="sr-only">{item.name}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#0e1d3a] text-white border-gray-700">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10",
                    isActive ? "bg-white text-[#0e1d3a] hover:bg-white hover:text-[#0e1d3a]" : "text-white/70"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User Profile Section */}
        <div className="border-t border-white/10 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-center hover:bg-white/10 px-2",
                  isCollapsed ? "justify-center px-0" : "gap-3"
                )}
              >
                  {/* <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[#0e1d3a]">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div> */}
                  {!isCollapsed && (
                    <div className="flex flex-col items-start truncate text-left">
                       <span className="text-sm font-medium text-white truncate w-full">{user?.name}</span>
                    </div>
                  )}
              </Button>
            </DropdownMenuTrigger>
            {/* <DropdownMenuContent align="end" side="right" className="w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 ml-2">
                <DropdownMenuLabel className="text-gray-900 dark:text-white">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => {}}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings/integrations')} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Settings className="mr-2 h-4 w-4" />
                  Integrations
                </DropdownMenuItem>
            </DropdownMenuContent> */}
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  )
}
