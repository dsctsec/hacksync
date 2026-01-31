export interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduledFor: Date
  status: "scheduled" | "draft" | "published" | "failed"
  campaign?: string
  media?: string[]
}

// Sample data for the calendar
export const samplePosts: ScheduledPost[] = [
  {
    id: "hacksync-2026-01-16",
    content: "Win HackSync",
    platforms: [],
    scheduledFor: new Date(2026, 0, 16, 14, 30),
    status: "scheduled",
    campaign: "HackSync",
  },
]

export const campaigns = [
  { id: "product-launch", name: "Product Launch", color: "bg-chart-1" },
  { id: "content-marketing", name: "Content Marketing", color: "bg-chart-2" },
  { id: "engagement", name: "Engagement", color: "bg-chart-3" },
  { id: "case-studies", name: "Case Studies", color: "bg-chart-4" },
]

export const platformIcons: Record<string, string> = {
  instagram: "📷",
  twitter: "𝕏",
  linkedin: "in",
  facebook: "f",
  bluesky: "🦋",
}
