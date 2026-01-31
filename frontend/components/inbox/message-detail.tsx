"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow, format } from "date-fns"
import type { InboxMessage } from "@/lib/inbox-data"
import { platformIcons, teamMembers } from "@/lib/inbox-data"
import { Send, CheckCircle, UserPlus, MoreHorizontal, ExternalLink, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { replyToRedditInbox } from "@/lib/inbox-api"

interface MessageDetailProps {
  message: InboxMessage
  onStatusChange: (id: string, status: InboxMessage["status"]) => void
  onAssign: (id: string, assignee: string) => void
  onReply: (id: string, text: string) => void
}

export function MessageDetail({ message, onStatusChange, onAssign, onReply }: MessageDetailProps) {
  const { toast } = useToast()
  const [reply, setReply] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSendReply = async () => {
    if (!reply.trim()) return
    setIsSending(true)
    try {
      if (message.platform !== "reddit") {
        throw new Error("Reply is only available for Reddit inbox right now.")
      }

      if (!message.sourceId) {
        throw new Error("Missing Reddit message identifier.")
      }

      await replyToRedditInbox(message.sourceId, reply.trim())
      const sentText = reply.trim()
      setReply("")
      onReply(message.id, sentText)
      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Reply failed",
        description: error?.message || "Unable to send reply.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleMarkResolved = () => {
    onStatusChange(message.id, "resolved")
    toast({
      title: "Marked as resolved",
      description: "This conversation has been marked as resolved.",
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {message.sender.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{message.sender.name}</h3>
                <span className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-xs">
                  {platformIcons[message.platform]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">@{message.sender.username}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(message.timestamp, "PPP 'at' p")} ({formatDistanceToNow(message.timestamp, { addSuffix: true })}
                )
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                message.status === "unread"
                  ? "default"
                  : message.status === "replied"
                    ? "secondary"
                    : message.status === "resolved"
                      ? "outline"
                      : "secondary"
              }
            >
              {message.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on {message.platform}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMarkResolved}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as resolved
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {message.postContent && (
          <Card className="bg-secondary/30">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-1">In reply to your post:</p>
              <p className="text-sm">{message.postContent}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">
              {message.sender.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="bg-secondary rounded-lg px-4 py-2 max-w-[80%]">
            <p className="text-sm">{message.content}</p>
          </div>
        </div>

        {(message.replies || []).map((item) => (
          <div key={item.id} className="flex justify-end gap-3">
            <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
              <p className="text-sm">{item.text}</p>
              <p className="text-[10px] opacity-80 mt-1">
                {format(item.timestamp, "PPP 'at' p")}
              </p>
            </div>
          </div>
        ))}

        {/* Assign to team member */}
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Assign to:</span>
          <Select defaultValue={message.assignedTo} onValueChange={(value) => onAssign(message.id, value)}>
            <SelectTrigger className="w-[180px] bg-secondary/50">
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reply Input */}
      <div className="p-4 border-t border-border">
        <div className="space-y-3">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={`Reply to ${message.sender.name}...`}
            className="min-h-[80px] resize-none bg-secondary/50"
          />
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleMarkResolved}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Resolved
            </Button>
            <Button onClick={handleSendReply} disabled={!reply.trim() || isSending}>
              {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Send Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
