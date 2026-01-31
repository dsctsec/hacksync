"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { InboxSidebar } from "@/components/inbox/inbox-sidebar"
import { MessageList } from "@/components/inbox/message-list"
import { MessageDetail } from "@/components/inbox/message-detail"
import type { InboxMessage } from "@/lib/inbox-data"
import { Search, Inbox } from "lucide-react"
import { fetchRedditInbox } from "@/lib/inbox-api"
import { useToast } from "@/hooks/use-toast"

export default function InboxPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const counts = useMemo(
    () => ({
      all: messages.filter((m) => m.status !== "resolved").length,
      unread: messages.filter((m) => m.status === "unread").length,
      dms: messages.filter((m) => m.type === "dm" && m.status !== "resolved").length,
      mentions: messages.filter((m) => m.type === "mention" && m.status !== "resolved").length,
      comments: messages.filter((m) => m.type === "comment" && m.status !== "resolved").length,
      resolved: messages.filter((m) => m.status === "resolved").length,
    }),
    [messages],
  )

  const filteredMessages = useMemo(() => {
    let filtered = messages

    // Apply type/status filter
    if (activeFilter === "unread") {
      filtered = filtered.filter((m) => m.status === "unread")
    } else if (activeFilter === "resolved") {
      filtered = filtered.filter((m) => m.status === "resolved")
    } else if (activeFilter !== "all") {
      filtered = filtered.filter((m) => m.type === activeFilter)
    } else {
      filtered = filtered.filter((m) => m.status !== "resolved")
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.content.toLowerCase().includes(query) ||
          m.sender.name.toLowerCase().includes(query) ||
          m.sender.username.toLowerCase().includes(query),
      )
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [messages, activeFilter, searchQuery])

  useEffect(() => {
    let isMounted = true

    const loadInbox = async () => {
      setIsLoading(true)
      try {
        const inbox = await fetchRedditInbox(50)
        if (isMounted) {
          setMessages(inbox)
        }
      } catch (error: any) {
        if (isMounted) {
          toast({
            title: "Inbox load failed",
            description: error?.message || "Unable to fetch Reddit inbox.",
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInbox()

    return () => {
      isMounted = false
    }
  }, [toast])

  const handleSelectMessage = (message: InboxMessage) => {
    setSelectedMessage(message)
    // Mark as read
    if (message.status === "unread") {
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, status: "read" } : m)))
    }
  }

  const handleStatusChange = (id: string, status: InboxMessage["status"]) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
    if (selectedMessage?.id === id) {
      if (status === "resolved" && activeFilter !== "resolved") {
        setSelectedMessage(null)
      } else {
        setSelectedMessage((prev) => (prev ? { ...prev, status } : null))
      }
    }
  }

  const handleReply = (id: string, text: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: "replied",
              replies: [
                ...(m.replies || []),
                { id: `${Date.now()}`, text, timestamp: new Date() },
              ],
            }
          : m,
      ),
    )

    if (selectedMessage?.id === id) {
      setSelectedMessage((prev) =>
        prev
          ? {
              ...prev,
              status: "replied",
              replies: [
                ...(prev.replies || []),
                { id: `${Date.now()}`, text, timestamp: new Date() },
              ],
            }
          : null,
      )
    }
  }

  const handleAssign = (id: string, assignee: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, assignedTo: assignee } : m)))
  }

  return (
    <div className="p-6 h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <p className="text-muted-foreground">Manage all your messages, mentions, and comments</p>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2">
          <Card className="bg-card border-border p-3">
            <InboxSidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />
          </Card>
        </div>

        {/* Message List */}
        <div className="col-span-12 md:col-span-9 lg:col-span-4">
          <Card className="bg-card border-border h-full flex flex-col">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="pl-9 bg-secondary/50"
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium">Loading inbox</h3>
                  <p className="text-sm text-muted-foreground">Fetching Reddit messages...</p>
                </div>
              ) : (
                <MessageList
                  messages={filteredMessages}
                  selectedId={selectedMessage?.id || null}
                  onSelect={handleSelectMessage}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="bg-card border-border h-full">
            {selectedMessage ? (
              <MessageDetail
                message={selectedMessage}
                onStatusChange={handleStatusChange}
                onAssign={handleAssign}
                onReply={handleReply}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium">Select a message</h3>
                <p className="text-sm text-muted-foreground">Choose a message from the list to view details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
