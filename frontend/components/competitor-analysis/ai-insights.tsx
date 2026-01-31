"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Lightbulb, AlertCircle, Leaf, Users as UsersIcon, BookOpen } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface AIInsightsProps {
  competitors: string[]
}

const aiInsights = [
  {
    id: 1,
    competitor: "Starbucks India",
    insight: "Positions as the 'Third Place'—a social hub beyond home and work. Heavy focus on seasonal scarcity (e.g., Red Cups) and community connection.",
    category: "Positioning",
    icon: Leaf,
  },
  {
    id: 2,
    competitor: "Blue Tokai",
    insight: "Farm-to-cup transparency. Content educates on 'Sourced per Order' and roasting dates, appealing to connoisseurs and ethical consumers.",
    category: "Transparency",
    icon: UsersIcon,
  },
  {
    id: 3,
    competitor: "Third Wave Coffee",
    insight: "Curated experiences. 'Instagrammable' cafe aesthetics driving UGC. Focus on 'Perfectly Crafted' artisanal messaging.",
    category: "Brand Value",
    icon: BookOpen,
  },
]

const opportunities = [
  "Leverage 'Crop-to-Cup' storytelling (Blue Tokai model) to build trust.",
  "Replicate Third Wave's 'Instagrammable' cafe corners to drive UGC.",
  "Adopt Starbucks' 'Third Place' community event strategy (e.g., open mics).",
]

const risks = [
  "Oversaturating 'premium' messaging without local relevance (Starbucks risk).",
  "Ignoring the 'at-home' brewer market segment (Blue Tokai strength).",
  "Rapid expansion diluting the 'artisanal' brand perception.",
]

export default function AIInsights({ competitors }: AIInsightsProps) {
  const [isSyncing, setIsSyncing] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      <h2 className="text-2xl font-bold text-foreground">Messaging & Positioning Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" /> Key Insights
          </h3>
          <div className="space-y-3">
            {isSyncing ? (
              [1, 2, 3].map((i) => (
                <Card key={i} className="p-4 bg-secondary/30 border-border">
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg bg-muted/70" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-20 bg-muted/70" />
                      <Skeleton className="h-4 w-full bg-muted/70" />
                      <Skeleton className="h-3 w-24 bg-muted/70" />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              aiInsights.map((insight) => {
                const IconComponent = insight.icon
                return (
                <Card key={insight.id} className="p-4 bg-secondary/50 border-border animate-in fade-in duration-500">
                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 h-fit">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-primary mb-1">{insight.category}</p>
                      <p className="text-sm text-foreground">{insight.insight}</p>
                      <p className="text-xs text-muted-foreground mt-2">Source: {insight.competitor}</p>
                    </div>
                  </div>
                </Card>
              )
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-500" /> Opportunities
            </h3>
            <Card className="p-4 space-y-2 bg-green-500/10 border-green-500/20">
              {isSyncing ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full bg-muted/70" />)
              ) : (
                opportunities.map((opp, i) => (
                  <div key={i} className="flex gap-2 animate-in fade-in duration-500">
                    <span className="text-green-500 font-bold">✓</span>
                    <p className="text-sm text-foreground">{opp}</p>
                  </div>
                ))
              )}
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" /> Risks to Avoid
            </h3>
            <Card className="p-4 space-y-2 bg-destructive/10 border-destructive/20">
              {isSyncing ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full bg-muted/70" />)
              ) : (
                risks.map((risk, i) => (
                  <div key={i} className="flex gap-2 animate-in fade-in duration-500">
                    <span className="text-destructive font-bold">!</span>
                    <p className="text-sm text-foreground">{risk}</p>
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
