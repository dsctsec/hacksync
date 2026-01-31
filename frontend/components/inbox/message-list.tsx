"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import type { InboxMessage } from "@/lib/inbox-data"
import { platformIcons } from "@/lib/inbox-data"
import { AtSign, MessageCircle, Mail } from "lucide-react"

interface MessageListProps {
  messages: InboxMessage[]
  selectedId: string | null
  onSelect: (message: InboxMessage) => void
}

const typeIcons = {
  dm: Mail,
  mention: AtSign,
  comment: MessageCircle,
}

export function MessageList({ messages, selectedId, onSelect }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium">No messages</h3>
        <p className="text-sm text-muted-foreground">Your inbox is empty</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {messages.map((message) => {
        const TypeIcon = typeIcons[message.type]
        return (
          <button
            key={message.id}
            className={cn(
              "w-full text-left p-4 hover:bg-secondary/50 transition-colors",
              selectedId === message.id && "bg-secondary",
              message.status === "unread" && "bg-primary/5",
            )}
            onClick={() => onSelect(message)}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback>
                  {message.sender.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm truncate">{message.sender.name}</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-xs shrink-0">
                      {platformIcons[message.platform]}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <TypeIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground capitalize">{message.type}</span>
                  {message.status === "unread" && (
                    <Badge className="h-4 text-[10px] bg-primary text-primary-foreground">New</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{message.content}</p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
