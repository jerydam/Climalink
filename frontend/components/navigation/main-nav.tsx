"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BellIcon,
  HomeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CreditCardIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { WalletInfo } from "@/components/blockchain/wallet-info"
import { LinkIcon } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Submit Report", href: "/submit", icon: DocumentTextIcon },
  { name: "Validate", href: "/validate", icon: CheckCircleIcon },
  { name: "DAO", href: "/dao", icon: UserGroupIcon },
  { name: "Portfolio", href: "/portfolio", icon: CreditCardIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
  { name: "Blockchain", href: "/blockchain", icon: LinkIcon },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-climate-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CL</span>
            </div>
            <span className="font-bold text-xl">ClimaLink</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <BellIcon className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">3</Badge>
            </Button>

            <WalletInfo />
          </div>
        </div>
      </div>
    </header>
  )
}
