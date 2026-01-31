"use client"

import { useMemo } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  isToday,
} from "date-fns"
import { cn } from "@/lib/utils"
import type { ScheduledPost } from "@/lib/calendar-data"
import { platformIcons } from "@/lib/calendar-data"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Clock } from "lucide-react"

interface MonthViewProps {
  currentDate: Date
  posts: ScheduledPost[]
  onPostClick?: (post: ScheduledPost) => void
  onDeletePost?: (postId: string) => void
}

export function MonthView({ currentDate, posts, onDeletePost }: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  const getPostsForDay = (day: Date) => {
    return posts.filter((post) => isSameDay(post.scheduledFor, day))
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 bg-secondary/50">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-border">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayPosts = getPostsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] p-2 border-b border-r border-border",
                !isCurrentMonth && "bg-secondary/30",
                index % 7 === 6 && "border-r-0",
              )}
            >
              <div
                className={cn(
                  "text-sm font-medium mb-1",
                  !isCurrentMonth && "text-muted-foreground",
                  isToday(day) &&
                    "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center",
                )}
              >
                {format(day, "d")}
              </div>

              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((post) => (
                  <PostItem key={post.id} post={post} onDeletePost={onDeletePost} />
                ))}
                {dayPosts.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{dayPosts.length - 3} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PostItem({ post, onDeletePost }: { post: ScheduledPost; onDeletePost?: (postId: string) => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "w-full text-left p-1.5 rounded text-xs truncate transition-colors",
            post.status === "scheduled" && "bg-primary/20 text-primary hover:bg-primary/30",
            post.status === "draft" && "bg-secondary text-muted-foreground hover:bg-secondary/80",
            post.status === "published" && "bg-success/20 text-success hover:bg-success/30",
            post.status === "failed" && "bg-destructive/20 text-destructive hover:bg-destructive/30",
          )}
        >
          <div className="flex items-center gap-1">
            <span className="shrink-0">{format(post.scheduledFor, "HH:mm")}</span>
            <span className="truncate">{post.content.slice(0, 30)}...</span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scheduled Post</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="h-4 w-4" />
              {format(post.scheduledFor, "PPP 'at' p")}
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {post.platforms.map((p) => (
              <span key={p} className="flex h-6 w-6 items-center justify-center rounded bg-secondary text-xs">
                {platformIcons[p]}
              </span>
            ))}
            <Badge
              variant={
                post.status === "scheduled"
                  ? "default"
                  : post.status === "published"
                    ? "secondary"
                    : post.status === "draft"
                      ? "outline"
                      : "destructive"
              }
            >
              {post.status}
            </Badge>
            {post.campaign && (
              <Badge variant="outline" className="ml-auto">
                {post.campaign}
              </Badge>
            )}
          </div>
          <p className="text-sm">{post.content}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDeletePost?.(post.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
