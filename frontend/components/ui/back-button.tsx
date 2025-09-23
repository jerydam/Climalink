"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  href?: string
  className?: string
  children?: React.ReactNode
}

export function BackButton({ href, className, children }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button variant="ghost" onClick={handleClick} className={cn("mb-4", className)}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      {children || "Back"}
    </Button>
  )
}
