"use client"

import { useState, useMemo } from "react"
import type { FormEvent } from "react"
import { addMonths, subMonths } from "date-fns"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { MonthView } from "@/components/calendar/month-view"
import { WeekView } from "@/components/calendar/week-view"
import { DayView } from "@/components/calendar/day-view"
import { useScheduledPosts } from "@/lib/scheduled-posts-context"
import type { ScheduledPost } from "@/lib/calendar-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 15))
  const { posts, addPost, removePost } = useScheduledPosts()
  const [view, setView] = useState<"day" | "week" | "month">("month")
  const [platformFilter, setPlatformFilter] = useState<string[]>([
    "instagram",
    "twitter",
    "linkedin",
    "facebook",
    "bluesky",
  ])
  const [statusFilter, setStatusFilter] = useState<string[]>(["scheduled", "draft", "published"])
  const [newEvent, setNewEvent] = useState({
    date: "2026-01-16",
    time: "11:00",
    title: "",
    description: "",
    platform: "instagram",
    status: "scheduled" as ScheduledPost["status"],
  })

  const platformOptions = ["instagram", "twitter", "linkedin", "facebook", "bluesky"]
  const statusOptions: ScheduledPost["status"][] = ["scheduled", "draft", "published"]

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const platformMatch = post.platforms.some((p) => platformFilter.includes(p))
      const statusMatch = statusFilter.includes(post.status)
      return platformMatch && statusMatch
    })
  }, [platformFilter, statusFilter, posts])

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date(2026, 0, 15))
  }

  const handleDeletePost = (postId: string) => {
    removePost(postId)
  }

  const handleAddEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!newEvent.date) {
      return
    }

    const [year, month, day] = newEvent.date.split("-").map(Number)
    const timeValue = newEvent.time || "09:00"
    const [hour, minute] = timeValue.split(":").map(Number)
    const scheduledFor = new Date(year, (month || 1) - 1, day, hour || 0, minute || 0)

    const contentParts = [newEvent.title.trim(), newEvent.description.trim()].filter(Boolean)
    const content = contentParts.join(" — ") || "Untitled Event"

    const createdPost: ScheduledPost = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      content,
      platforms: [newEvent.platform],
      scheduledFor,
      status: newEvent.status,
    }

    addPost(createdPost)
    setNewEvent((prev) => ({ ...prev, title: "", description: "" }))
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Calendar</h1>
        <p className="text-muted-foreground">Plan and schedule your content across all platforms</p>
      </div>

      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        view={view}
        onViewChange={setView}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {/* <div className="grid gap-6"> */}
        <div>
          {view === "month" && (
            <MonthView currentDate={currentDate} posts={filteredPosts} onDeletePost={handleDeletePost} />
          )}
          {view === "week" && <WeekView currentDate={currentDate} posts={filteredPosts} />}
          {view === "day" && (
            <DayView currentDate={currentDate} posts={filteredPosts} onDeletePost={handleDeletePost} />
          )}
        </div>

       <Card className="h-fit">
          <CardHeader>
            <CardTitle>Quick add event</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleAddEvent}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time">Time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-title">Title</Label>
                <Input
                  id="event-title"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  rows={3}
                  placeholder="Add context for your team"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event-platform">Platform</Label>
                  <select
                    id="event-platform"
                    className="w-full rounded-md border border-input bg-background p-2 text-sm"
                    value={newEvent.platform}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, platform: e.target.value }))}
                  >
                    {platformOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-status">Status</Label>
                  <select
                    id="event-status"
                    className="w-full rounded-md border border-input bg-background p-2 text-sm"
                    value={newEvent.status}
                    onChange={(e) =>
                      setNewEvent((prev) => ({ ...prev, status: e.target.value as ScheduledPost["status"] }))
                    }
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Add event
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
