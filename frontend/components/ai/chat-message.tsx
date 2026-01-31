"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Copy, Check, Send, RefreshCw, Sparkles } from "lucide-react"
import { useState } from "react"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
  onSendToCreate?: () => void
  isGenerating?: boolean
}

export function ChatMessage({ role, content, timestamp, onSendToCreate, isGenerating }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("flex gap-3", role === "user" && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(role === "assistant" && "bg-primary text-primary-foreground")}>
          {role === "assistant" ? <Sparkles className="h-4 w-4" /> : "YY"}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex flex-col gap-1 max-w-[80%]", role === "user" && "items-end")}>
        <div
          className={cn(
            "rounded-lg px-4 py-2",
            role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary",
          )}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating...</span>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          )}
        </div>
        {role === "assistant" && content && !isGenerating && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
            {onSendToCreate && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onSendToCreate}>
                <Send className="h-3 w-3 mr-1" />
                Send to Create
              </Button>
            )}
          </div>
        )}
        {timestamp && (
          <span className="text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  )
}
