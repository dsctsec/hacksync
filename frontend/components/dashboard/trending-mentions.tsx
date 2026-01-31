"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const trends = [
  {
    keyword: "#ProductLaunch",
    mentions: 1234,
    change: 23,
    sentiment: "positive",
  },
  {
    keyword: "@SocialNest",
    mentions: 856,
    change: 12,
    sentiment: "positive",
  },
  {
    keyword: "#SocialMedia",
    mentions: 543,
    change: -5,
    sentiment: "neutral",
  },
  {
    keyword: "Brand Name",
    mentions: 321,
    change: 0,
    sentiment: "neutral",
  },
]

export function TrendingMentions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Trending Mentions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trends.map((trend) => (
            <div key={trend.keyword} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{trend.keyword}</p>
                  <p className="text-xs text-muted-foreground">{trend.mentions.toLocaleString()} mentions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    trend.sentiment === "positive"
                      ? "bg-success/20 text-success border-0"
                      : trend.sentiment === "negative"
                        ? "bg-destructive/20 text-destructive border-0"
                        : "bg-muted text-muted-foreground border-0"
                  }
                >
                  {trend.change > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : trend.change < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <Minus className="h-3 w-3 mr-1" />
                  )}
                  {trend.change > 0 ? "+" : ""}
                  {trend.change}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
