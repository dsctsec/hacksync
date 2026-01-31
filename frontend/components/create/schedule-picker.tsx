"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CalendarIcon, Clock, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface SchedulePickerProps {
  publishType: "now" | "schedule"
  onPublishTypeChange: (type: "now" | "schedule") => void
  scheduledDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
  scheduledTime: string
  onTimeChange: (time: string) => void
}

const timeSlots = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
]

export function SchedulePicker({
  publishType,
  onPublishTypeChange,
  scheduledDate,
  onDateChange,
  scheduledTime,
  onTimeChange,
}: SchedulePickerProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader >
        <CardTitle className="text-base">Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <RadioGroup className="flex gap-6" value={publishType} onValueChange={(v) => onPublishTypeChange(v as "now" | "schedule")}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="now" id="now" />
            <Label htmlFor="now" className="cursor-pointer text-[0.8rem]">
              Publish immediately
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="schedule" id="schedule" />
            <Label htmlFor="schedule" className="cursor-pointer text-[0.8rem]">
              Schedule for later
            </Label>
          </div>
        </RadioGroup>

        {publishType === "schedule" && (
          <div className=" grid gap-4">
            <div className="flex gap-3 flex-1 items-end">
              <div className="space-y-1.5 flex-1">
                <Label className="text-sm">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-secondary/50",
                        !scheduledDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={onDateChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5 flex-1">
                <Label className="text-sm">Time</Label>
                <Select value={scheduledTime} onValueChange={onTimeChange}>
                  <SelectTrigger className="bg-secondary/50">
                    <Clock className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 flex-1">
              <div className="flex items-center gap-1.5 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">AI Recommendation</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                Based on your audience, Wednesday at 12:00 PM has the highest engagement rate.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
