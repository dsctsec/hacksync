"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PenSquare, Calendar, Inbox, Sparkles } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    title: "Create Post",
    description: "Write and schedule new content",
    icon: PenSquare,
    href: "/create",
    variant: "secondary" as const,
  },
  {
    title: "View Calendar",
    description: "See your content schedule",
    icon: Calendar,
    href: "/calendar",
    variant: "secondary" as const,
  },
  {
    title: "Open Inbox",
    description: "3 new messages",
    icon: Inbox,
    href: "/inbox",
    variant: "secondary" as const,
  },
  {
    title: "Generate with AI",
    description: "Let NestGPT create content",
    icon: Sparkles,
    href: "/ai",
    variant: "secondary" as const,
  },
]

export function QuickActions() {
  return (

        <div className="flex justify-around mb-8">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto grid items-start gap-1 p-4 w-[240px]"
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center justify-center text-center gap-2">
                  <action.icon className="h-5 w-5" />
                  <span className="font-medium">{action.title}</span>
                </div>
                <span className="text-xs opacity-70 font-normal">{action.description}</span>
              </Link>
            </Button>
          ))}
        </div>
  )
}
