"use client"

import { format, isSameDay } from "date-fns"
import type { ScheduledPost } from "@/lib/calendar-data"
import { platformIcons } from "@/lib/calendar-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface DayViewProps {
  currentDate: Date
  posts: ScheduledPost[]
  onDeletePost?: (postId: string) => void
}

const hours = Array.from({ length: 24 }, (_, i) => i)

export function DayView({ currentDate, posts, onDeletePost }: DayViewProps) {
  const dayPosts = posts.filter((post) => isSameDay(post.scheduledFor, currentDate))

  const getPostsForHour = (hour: number) => {
    return dayPosts.filter((post) => post.scheduledFor.getHours() === hour)
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Time slots */}
      <div className="lg:col-span-2 border border-border rounded-lg overflow-hidden">
        <div className="bg-secondary/50 p-3 border-b border-border">
          <h3 className="font-semibold">{format(currentDate, "EEEE, MMMM d, yyyy")}</h3>
        </div>
        <ScrollArea className="h-[600px]">
          <div className="divide-y divide-border">
            {hours.map((hour) => {
              const hourPosts = getPostsForHour(hour)
              return (
                <div key={hour} className="flex">
                  <div className="w-20 p-3 text-sm text-muted-foreground text-right border-r border-border shrink-0">
                    {format(new Date().setHours(hour, 0), "h:mm a")}
                  </div>
                  <div className="flex-1 p-2 min-h-[60px]">
                    {hourPosts.map((post) => (
                      <Card key={post.id} className="mb-2 bg-card/50">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {post.platforms.map((p) => (
                                  <span
                                    key={p}
                                    className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-xs"
                                  >
                                    {platformIcons[p]}
                                  </span>
                                ))}
                                <Badge
                                  variant={
                                    post.status === "scheduled"
                                      ? "default"
                                      : post.status === "published"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {post.status}
                                </Badge>
                              </div>
                              <p className="text-sm">{post.content}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => onDeletePost?.(post.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Day summary */}
      <div className="space-y-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Day Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total posts</span>
                <span className="font-medium">{dayPosts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="font-medium">{dayPosts.filter((p) => p.status === "scheduled").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Drafts</span>
                <span className="font-medium">{dayPosts.filter((p) => p.status === "draft").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Published</span>
                <span className="font-medium">{dayPosts.filter((p) => p.status === "published").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Platforms</h4>
            <div className="space-y-2">
              {["instagram", "twitter", "linkedin"].map((platform) => {
                const count = dayPosts.filter((p) => p.platforms.includes(platform)).length
                return (
                  <div key={platform} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-xs">
                        {platformIcons[platform]}
                      </span>
                      <span className="text-muted-foreground capitalize">{platform}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
