"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Pencil, Calendar, TrendingUp, ImageIcon, Send } from "lucide-react"

const capabilities = [
  {
    icon: Lightbulb,
    title: "Generate Ideas",
    description: "Get creative post ideas based on your niche",
  },
  {
    icon: Pencil,
    title: "Write Captions",
    description: "Platform-optimized captions for any content",
  },
  {
    icon: Calendar,
    title: "Campaign Plans",
    description: "Strategic multi-week content calendars",
  },
  {
    icon: TrendingUp,
    title: "Trending Topics",
    description: "Discover what's trending in your industry",
  },
  {
    icon: ImageIcon,
    title: "Image Prompts",
    description: "Generate prompts for AI image creation",
  },
  {
    icon: Send,
    title: "Direct Publishing",
    description: "Send AI content directly to post creator",
  },
]

export function AICapabilities() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">What NestGPT can do</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {capabilities.map((cap) => (
            <div key={cap.title} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
              <cap.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">{cap.title}</p>
                <p className="text-xs text-muted-foreground">{cap.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
