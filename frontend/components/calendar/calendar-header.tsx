"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import Link from "next/link"

interface CalendarHeaderProps {
  currentDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  view: "day" | "week" | "month"
  onViewChange: (view: "day" | "week" | "month") => void
  platformFilter: string[]
  onPlatformFilterChange: (platforms: string[]) => void
  statusFilter: string[]
  onStatusFilterChange: (statuses: string[]) => void
}

export function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  view,
  onViewChange,
  platformFilter,
  onPlatformFilterChange,
  statusFilter,
  onStatusFilterChange,
}: CalendarHeaderProps) {
  const platforms = ["instagram", "twitter", "linkedin", "facebook", "bluesky"]
  const statuses = ["scheduled", "draft", "published"]

  const togglePlatform = (platform: string) => {
    if (platformFilter.includes(platform)) {
      onPlatformFilterChange(platformFilter.filter((p) => p !== platform))
    } else {
      onPlatformFilterChange([...platformFilter, platform])
    }
  }

  const toggleStatus = (status: string) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter((s) => s !== status))
    } else {
      onStatusFilterChange([...statusFilter, status])
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <h2 className="text-lg font-semibold ml-2">{format(currentDate, "MMMM yyyy")}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Select value={view} onValueChange={(v) => onViewChange(v as "day" | "week" | "month")}>
          <SelectTrigger className="w-[100px] bg-secondary/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Platforms</DropdownMenuLabel>
            {platforms.map((platform) => (
              <DropdownMenuCheckboxItem
                key={platform}
                checked={platformFilter.includes(platform)}
                onCheckedChange={() => togglePlatform(platform)}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {statuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" asChild>
          <Link href="/create">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>
    </div>
  )
}
