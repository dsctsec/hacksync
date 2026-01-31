"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Zap, Heart, MessageCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface CampaignAnalysisProps {
  competitors: string[]
}

const campaigns = [
  {
    id: 1,
    competitor: "Starbucks India",
    title: "Barista Originals",
    contentType: "Video Series",
    style: "Storytelling",
    engagement: 145000,
    likes: 112000,
    comments: 8500,
  },
  {
    id: 2,
    competitor: "Blue Tokai",
    title: "Producer Series 2024",
    contentType: "Carousel",
    style: "Educational",
    engagement: 42000,
    likes: 38000,
    comments: 2100,
  },
  {
    id: 3,
    competitor: "Third Wave Coffee",
    title: "Community & Craft",
    contentType: "Reel",
    style: "Lifestyle",
    engagement: 35000,
    likes: 28000,
    comments: 1800,
  },
  {
    id: 4,
    competitor: "Starbucks India",
    title: "Seasonal Lattes Launch",
    contentType: "Carousel",
    style: "Product Launch",
    engagement: 186000,
    likes: 154000,
    comments: 12400,
  },
  {
    id: 5,
    competitor: "Blue Tokai",
    title: "Blue Tokai Origins",
    contentType: "Video Tour",
    style: "Behind-the-Scenes",
    engagement: 58000,
    likes: 45000,
    comments: 3200,
  },
]

export default function CampaignAnalysis({ competitors }: CampaignAnalysisProps) {
  const [isSyncing, setIsSyncing] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-2xl font-bold text-foreground mb-4">Campaign & Content Analysis</h2>
      <Card className="overflow-hidden border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left font-semibold text-foreground">Campaign</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Competitor</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Type</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Style</th>
                <th className="px-6 py-3 text-right font-semibold text-foreground">Engagement</th>
                <th className="px-6 py-3 text-right font-semibold text-foreground">Likes</th>
                <th className="px-6 py-3 text-right font-semibold text-foreground">Comments</th>
              </tr>
            </thead>
            <tbody>
              {isSyncing ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32 bg-muted/70" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24 bg-muted/70" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16 bg-muted/70" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20 bg-muted/70" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto bg-muted/70" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto bg-muted/70" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto bg-muted/70" /></td>
                  </tr>
                ))
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-border hover:bg-secondary/50 transition animate-in fade-in duration-500">
                    <td className="px-6 py-4 text-foreground font-medium">{campaign.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">{campaign.competitor}</td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">{campaign.contentType}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{campaign.style}</td>
                    <td className="px-6 py-4 text-right font-semibold text-primary">{campaign.engagement.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      <div className="flex items-center justify-end gap-1">
                        <Heart className="w-4 h-4" /> {campaign.likes.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      <div className="flex items-center justify-end gap-1">
                        <MessageCircle className="w-4 h-4" /> {campaign.comments.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
