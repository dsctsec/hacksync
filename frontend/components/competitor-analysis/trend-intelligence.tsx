"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Music } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface TrendIntelligenceProps {
  competitors: string[]
}

const hashtags = [
  { tag: "#BaristaOriginals", shared: 24, unique: 12, competitors: "Starbucks India" },
  { tag: "#BlueTokai", shared: 18, unique: 6, competitors: "Blue Tokai" },
  { tag: "#ThirdWaveCoffee", shared: 22, unique: 4, competitors: "Third Wave Coffee" },
  { tag: "#SpecialtyCoffee", shared: 15, unique: 8, competitors: "Blue Tokai, Third Wave" },
]

const trendingFormats = [
  { format: "Brewing Tips (Reels)", adoption: 92, topCompetitor: "Blue Tokai" },
  { format: "Cafe Aesthetics (Carousel)", adoption: 85, topCompetitor: "Third Wave" },
  { format: "Seasonal Drinks (Stories)", adoption: 78, topCompetitor: "Starbucks India" },
  { format: "Farmer Stories (Video)", adoption: 64, topCompetitor: "Blue Tokai" },
]

const audio = [
  { track: "Morning Coffee Lo-Fi", competitors: "Starbucks, Third Wave", uses: 45 },
  { track: "Trending Reels Audio 2024", competitors: "Blue Tokai", uses: 32 },
  { track: "Acoustic Cafe Vibes", competitors: "Third Wave Coffee", uses: 28 },
]

export default function TrendIntelligence({ competitors }: TrendIntelligenceProps) {
  const [isSyncing, setIsSyncing] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
      <h2 className="text-2xl font-bold text-foreground">Trend & Hashtag Intelligence</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Hashtag Strategy</h3>
          <div className="space-y-3">
            {isSyncing ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-muted/70" />
                    <Skeleton className="h-3 w-24 bg-muted/70" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-16 ml-auto bg-muted/70" />
                    <Skeleton className="h-3 w-12 ml-auto bg-muted/70" />
                  </div>
                </div>
              ))
            ) : (
              hashtags.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg animate-in fade-in duration-500">
                  <div>
                    <p className="font-mono text-sm text-primary font-semibold">{h.tag}</p>
                    <p className="text-xs text-muted-foreground">{h.competitors}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">{h.shared} shared</div>
                    <div className="text-xs text-muted-foreground">{h.unique} unique</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Content Format Trends</h3>
          <div className="space-y-4">
            {isSyncing ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-40 bg-muted/70" />
                    <Skeleton className="h-4 w-12 bg-muted/70" />
                  </div>
                  <Skeleton className="h-2 w-full bg-muted/70" />
                </div>
              ))
            ) : (
              trendingFormats.map((fmt, i) => (
                <div key={i} className="space-y-1 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-foreground">{fmt.format}</span>
                    <span className="text-xs text-muted-foreground">{fmt.adoption}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${fmt.adoption}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{fmt.topCompetitor}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Trending Audio & Music</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isSyncing ? (
            [1, 2, 3].map((i) => (
              <Card key={i} className="bg-secondary/50 p-4 border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full bg-muted/70" />
                  <Skeleton className="h-4 w-32 bg-muted/70" />
                </div>
                <Skeleton className="h-3 w-40 bg-muted/70" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-12 bg-muted/70" />
                  <Skeleton className="h-4 w-8 bg-muted/70" />
                </div>
              </Card>
            ))
          ) : (
            audio.map((aud, i) => (
              <div key={i} className="bg-secondary p-4 rounded-lg border border-border animate-in fade-in duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{aud.track}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Used by: {aud.competitors}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Uses</span>
                  <span className="font-mono text-sm text-primary font-semibold">{aud.uses}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
