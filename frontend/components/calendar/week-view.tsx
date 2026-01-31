"use client"

import { useMemo } from "react"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import type { ScheduledPost } from "@/lib/calendar-data"
import { platformIcons } from "@/lib/calendar-data"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WeekViewProps {
  currentDate: Date
  posts: ScheduledPost[]
}

const hours = Array.from({ length: 24 }, (_, i) => i)

export function WeekView({ currentDate, posts }: WeekViewProps) {
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate])

  const getPostsForDayAndHour = (day: Date, hour: number) => {
    return posts.filter((post) => {
      return isSameDay(post.scheduledFor, day) && post.scheduledFor.getHours() === hour
    })
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-8 bg-secondary/50 border-b border-border">
        <div className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-border" />
        {days.map((day) => (
          <div key={day.toISOString()} className="p-2 text-center border-r border-border last:border-r-0">
            <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
            <div
              className={cn(
                "text-sm font-medium mt-1",
                isToday(day) &&
                  "bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center mx-auto",
              )}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-8">
          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="p-2 text-xs text-muted-foreground text-right border-r border-b border-border pr-2">
                {format(new Date().setHours(hour, 0), "ha")}
              </div>
              {days.map((day) => {
                const hourPosts = getPostsForDayAndHour(day, hour)
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="min-h-[50px] p-1 border-r border-b border-border last:border-r-0"
                  >
                    {hourPosts.map((post) => (
                      <div
                        key={post.id}
                        className={cn(
                          "p-1.5 rounded text-xs mb-1",
                          post.status === "scheduled" && "bg-primary/20 text-primary",
                          post.status === "draft" && "bg-secondary text-muted-foreground",
                          post.status === "published" && "bg-success/20 text-success",
                        )}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {post.platforms.slice(0, 2).map((p) => (
                            <span key={p} className="text-[10px]">
                              {platformIcons[p]}
                            </span>
                          ))}
                        </div>
                        <p className="truncate">{post.content.slice(0, 25)}...</p>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
