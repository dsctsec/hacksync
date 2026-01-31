"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle, Clock, Zap } from "lucide-react"

interface RecommendationsProps {
  competitors: string[]
}

const recommendations = [
  {
    id: 1,
    title: "Emulate Blue Tokai's Transparency Model",
    description: "Post detailed content about bean sourcing, roast dates, and farm partnerships. This builds trust with serious coffee drinkers.",
    priority: "high",
    impact: "Can increase trust and attract high-value connoisseur customers.",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 2,
    title: "Adopt Starbucks' Community Hub Strategy",
    description: "Promote your physical spaces as 'Third Places' for work and connection. Highlight Wi-Fi, ambiance, and community events.",
    priority: "high",
    impact: "Drive foot traffic and longer store visits during off-peak hours.",
    icon: <CheckCircle className="w-5 h-5" />,
  },
  {
    id: 3,
    title: "Replicate Third Wave's 'Instagrammable' Corners",
    description: "Design distinct, photogenic spots in-store. Encourage customers to tag you. Third Wave sees massive organic reach this way.",
    priority: "medium",
    impact: "Boost free organic reach via User-Generated Content (UGC).",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    id: 4,
    title: "Launch 'Home Brewing' Educational Series",
    description: "Capitalize on the home-brewing trend like Blue Tokai. Tutorials on Aeropress/Pour-over engage hobbyists deeply.",
    priority: "high",
    impact: "Establish authority and sell more roasted bean packs/merch.",
    icon: <CheckCircle className="w-5 h-5" />,
  },
  {
    id: 5,
    title: "Leverage Seasonal FOMO Campaigns",
    description: "Like Starbucks' Red Cups, create limited-time seasonal drinks. Use countdowns and exclusive drops to drive urgency.",
    priority: "medium",
    impact: "Spike sales during seasonal transitions and holidays.",
    icon: <CheckCircle className="w-5 h-5" />,
  },
]

export default function Recommendations({ competitors }: RecommendationsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Actionable Recommendations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <Card
            key={rec.id}
            className={`p-6 border-2 transition-all ${rec.priority === "high" ? "border-primary/30 bg-primary/5" : "border-border"}`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${
                  rec.priority === "high" ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
                }`}
              >
                {rec.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{rec.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {rec.priority === "high" ? "🔴 High Priority" : "🟡 Medium Priority"}
                </p>
              </div>
            </div>
            <p className="text-sm text-foreground mb-3">{rec.description}</p>
            <div className="bg-secondary/50 p-3 rounded border border-border/50">
              <p className="text-xs font-semibold text-accent mb-1">Potential Impact:</p>
              <p className="text-sm text-foreground">{rec.impact}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
