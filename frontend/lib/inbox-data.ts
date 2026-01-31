export interface InboxMessage {
  id: string
  type: "dm" | "mention" | "comment"
  platform: "instagram" | "twitter" | "linkedin" | "facebook" | "reddit"
  sender: {
    name: string
    username: string
    avatar?: string
  }
  content: string
  timestamp: Date
  status: "unread" | "read" | "replied" | "resolved"
  assignedTo?: string
  postContent?: string
  sourceId?: string
  permalink?: string
  subreddit?: string
  replies?: Array<{
    id: string
    text: string
    timestamp: Date
  }>
}

export const teamMembers = [
  { id: "1", name: "Vaibhav", role: "Store Lead" },
  { id: "2", name: "Devansh", role: "Community Manager" },
  { id: "3", name: "Yanshuman", role: "Guest Experience" },
  { id: "4", name: "Vinayak", role: "Roastery Ops" },
]

export const platformIcons: Record<string, string> = {
  instagram: "📷",
  twitter: "𝕏",
  linkedin: "in",
  facebook: "f",
  reddit: "👽",
}
