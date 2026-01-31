"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function TwitterErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md bg-card border-border">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/20 p-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Connection Failed</h1>
            <p className="text-muted-foreground">
              {error || "Failed to connect your Twitter account. Please try again."}
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={() => router.push("/settings")}>
              Back to Settings
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
