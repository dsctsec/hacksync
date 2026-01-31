import { API_ENDPOINTS, API_FETCH_OPTIONS } from "./api-config"
import type { InboxMessage } from "./inbox-data"

interface InboxApiMessage {
  id: string
  sourceId?: string
  type: "dm" | "mention" | "comment"
  platform: "reddit"
  sender: {
    name: string
    username: string
    avatar?: string
  }
  content: string
  timestamp: string
  status: "unread" | "read" | "replied" | "resolved"
  assignedTo?: string
  postContent?: string
  permalink?: string
  subreddit?: string
}

interface InboxResponse {
  success: boolean
  count: number
  messages: InboxApiMessage[]
  error?: string
}

const toDate = (value: string) => {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

export const fetchRedditInbox = async (limit = 50): Promise<InboxMessage[]> => {
  const url = `${API_ENDPOINTS.reddit.inbox}?limit=${limit}`
  const response = await fetch(url, API_FETCH_OPTIONS)
  const data: InboxResponse = await response.json()

  if (!response.ok || !data?.success) {
    throw new Error(data?.error || "Failed to fetch inbox")
  }

  return (data.messages || []).map((message) => ({
    ...message,
    timestamp: toDate(message.timestamp),
    replies: [],
  }))
}

export const replyToRedditInbox = async (thingId: string, text: string) => {
  const response = await fetch(API_ENDPOINTS.reddit.reply, {
    method: "POST",
    ...API_FETCH_OPTIONS,
    body: JSON.stringify({ thingId, text }),
  })
  const data = await response.json()

  if (!response.ok || !data?.success) {
    throw new Error(data?.error || "Failed to send reply")
  }

  return data
}
