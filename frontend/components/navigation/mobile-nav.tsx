"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, DocumentTextIcon, CheckCircleIcon, UserGroupIcon, UserIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

const mobileNavigation = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  { name: "Reports", href: "/submit", icon: DocumentTextIcon },
  { name: "Validate", href: "/validate", icon: CheckCircleIcon },
  { name: "DAO", href: "/dao", icon: UserGroupIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-5 h-16">
        {mobileNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
