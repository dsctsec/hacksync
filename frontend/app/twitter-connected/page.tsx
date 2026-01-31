"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"

export default function TwitterConnectedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const username = searchParams.get("username")

  useEffect(() => {
    // Signal successful Twitter connection
    localStorage.setItem('twitterJustConnected', 'true')

    // Redirect to settings page after 2 seconds
    const timer = setTimeout(() => {
      router.push("/settings")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md bg-card border-border">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-success/20 p-4">
              <Check className="h-12 w-12 text-success" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Twitter Connected!</h1>
            <p className="text-muted-foreground">
              Successfully connected{" "}
              {username && (
                <span className="font-semibold text-foreground">@{username}</span>
              )}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting to settings...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
