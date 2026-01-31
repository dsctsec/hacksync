"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MoreHorizontal } from "lucide-react"
import Link from "next/link"

const scheduledPosts = [
  {
    id: 1,
    content: "Excited to announce our new product launch! 🚀 Stay tuned for more details...",
    platforms: ["instagram", "twitter"],
    scheduledFor: "Today, 2:00 PM",
    status: "scheduled",
  },
  {
    id: 2,
    content: "Check out our latest blog post on social media trends for 2026...",
    platforms: ["linkedin", "twitter"],
    scheduledFor: "Tomorrow, 9:00 AM",
    status: "scheduled",
  },
  {
    id: 3,
    content: "Behind the scenes look at our team working on something special! 👀",
    platforms: ["instagram"],
    scheduledFor: "Jan 18, 12:00 PM",
    status: "draft",
  },
]

const platformIcons: Record<string, string> = {
  instagram: "📷",
  twitter: "𝕏",
  linkedin: "in",
  facebook: "f",
  bluesky: "🦋",
}

export function ScheduledPosts() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Scheduled Posts</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/calendar">View All</Link>
        </Button>
      </CardHeader>
      <p className="px-6 ">
        NO SCHEDULED POSTS
      </p>
    </Card>
  )
}
