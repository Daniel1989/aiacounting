"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function BackButton() {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute left-4 top-4 md:left-8 md:top-8 bg-[#ebebeb] rounded-full"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-8 w-8" />
    </Button>
  )
} 