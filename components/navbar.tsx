"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { LayoutDashboard, Users, Kanban, BarChart3, User, Settings, MessageSquare, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: MessageSquare },
  { name: "Pipeline", href: "/pipeline", icon: Kanban },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
]

export function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="border-b bg-[#0e1d3a] dark:bg-[#0e1d3a] border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="bg-[#0e1d3a] border-r-gray-800 text-white p-0">
                   <div className="p-6">
                      <div className="flex items-center gap-2 mb-8">
                        <div className="h-8 w-8 rounded-lg overflow-hidden">
                          <Image
                            src="/paveOs-logo.jpg"
                            alt="PaveOS Logo"
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <span className="font-bold text-lg text-white">PaveOS</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {navigation.map((item) => {
                          const Icon = item.icon
                          const isActive = pathname === item.href
                          return (
                            <Link 
                              key={item.name} 
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                            >
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/10",
                                  isActive && "bg-white text-[#0e1d3a] hover:bg-white hover:text-[#0e1d3a]"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                                {item.name}
                              </Button>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="h-9 w-9 rounded-lg overflow-hidden transition-transform group-hover:scale-105">
                  <Image
                    src="/paveOs-logo.jpg"
                    alt="PaveOS Logo"
                    width={36}
                    height={36}
                    className="object-cover"
                  />
                </div>
                <span className="font-bold text-lg text-white dark:text-white hidden sm:block">PaveOS</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "gap-2 text-white/70 dark:text-white/70 hover:text-white dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10",
                        isActive && "bg-white dark:bg-white text-[#0e1d3a] dark:text-[#0e1d3a] hover:bg-white dark:hover:bg-white hover:text-[#0e1d3a] dark:hover:text-[#0e1d3a]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/10 px-2 sm:px-4">
                  <div className="h-8 w-8 rounded-full bg-white dark:bg-white flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#0e1d3a] dark:text-[#0e1d3a]">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-white dark:text-white">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <DropdownMenuLabel className="text-gray-900 dark:text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
              <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings/integrations')} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings className="mr-2 h-4 w-4" />
                Integrations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
