"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  href?: string
  children?: React.ReactNode
}

export function BackButton({ href, children = "Back" }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button variant="ghost" onClick={handleBack} className="p-0 h-auto font-normal">
      <ArrowLeft className="h-4 w-4 mr-2" />
      {children}
    </Button>
  )
}