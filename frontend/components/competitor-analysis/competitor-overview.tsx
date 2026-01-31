"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import Image from "next/image"

interface CompetitorOverviewProps {
  selectedCompetitors: string[]
  onSelectCompetitors: (competitors: string[]) => void
}

const competitors = [
  {
    id: "third-wave",
    name: "Third Wave Coffee",
    logo: "/ThirdWaveCoffee.jpeg",
    platforms: [
      { name: "Instagram", url: "https://www.instagram.com/thirdwavecoffeeindia" },
      { name: "Twitter", url: "https://twitter.com/thirdwaveindia" },
      { name: "Facebook", url: "https://www.facebook.com/thirdwavecoffeeindia" }
    ],
    postingFrequency: "1.2 posts/day",
    followerGrowth: 12.5,
    followers: "34.2K",
  },
  {
    id: "starbucks",
    name: "Starbucks India",
    logo: "/Starbucks.png",
    platforms: [
      { name: "Instagram", url: "https://www.instagram.com/starbucksindia" },
      { name: "Twitter", url: "https://twitter.com/StarbucksIndia" }
    ],
    postingFrequency: "2.8 posts/day",
    followerGrowth: 8.2,
    followers: "1.2M",
  },
  {
    id: "blue-tokai",
    name: "Blue Tokai",
    logo: "/BlueTokai.avif",
    platforms: [
      { name: "Instagram", url: "https://www.instagram.com/bluetokaicoffee" },
      { name: "Twitter", url: "https://twitter.com/bluetokaicoffee" }
    ],
    postingFrequency: "3.5 posts/day",
    followerGrowth: 18.4,
    followers: "108K",
  },
]

export default function CompetitorOverview({ selectedCompetitors, onSelectCompetitors }: CompetitorOverviewProps) {
  const toggleCompetitor = (id: string) => {
    if (selectedCompetitors.includes(id)) {
      onSelectCompetitors(selectedCompetitors.filter((c) => c !== id))
    } else {
      onSelectCompetitors([...selectedCompetitors, id])
    }
  }

  const handlePlatformClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation()
    window.open(url, "_blank")
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Competitor Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {competitors.map((competitor) => {
          return (
          <Card
            key={competitor.id}
            className={`p-6 cursor-pointer transition-all hover:border-primary/50 ${selectedCompetitors.includes(competitor.id) ? "ring-2 ring-primary border-primary/50" : "border-border"}`}
            onClick={() => toggleCompetitor(competitor.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border">
                  <Image 
                    src={competitor.logo} 
                    alt={competitor.name} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{competitor.name}</h3>
                  <p className="text-xs text-muted-foreground">{competitor.followers} Followers</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedCompetitors.includes(competitor.id)}
                onChange={() => toggleCompetitor(competitor.id)}
                className="w-4 h-4"
              />
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">Platforms:</span>
                <div className="flex gap-1 flex-wrap">
                  {competitor.platforms.map((p) => (
                    <span 
                      key={p.name} 
                      className="text-xs bg-secondary px-2 py-1 rounded hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                      onClick={(e) => handlePlatformClick(e, p.url)}
                      title={`Visit ${p.name}`}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Posting Frequency</span>
                <span className="font-mono text-foreground">{competitor.postingFrequency}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Follower Growth</span>
                <div className="flex items-center gap-1">
                  {competitor.followerGrowth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className={`font-mono font-semibold ${competitor.followerGrowth > 0 ? "text-green-500" : "text-destructive"}`}>
                    {Math.abs(competitor.followerGrowth)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )
        })}
      </div>
    </div>
  )
}
