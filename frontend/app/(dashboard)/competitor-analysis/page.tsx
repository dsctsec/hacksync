"use client"

import { useState, useEffect } from "react"
import CompetitorOverview from "@/components/competitor-analysis/competitor-overview"
import CampaignAnalysis from "@/components/competitor-analysis/campaign-analysis"
import EngagementMetrics from "@/components/competitor-analysis/engagement-metrics"
import AIInsights from "@/components/competitor-analysis/ai-insights"
import TrendIntelligence from "@/components/competitor-analysis/trend-intelligence"
import Recommendations from "@/components/competitor-analysis/recommendations"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { CompetitorScraper } from "@/lib/services/competitor-scraper"

export default function CompetitorAnalysisPage() {
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>(["third-wave", "starbucks", "blue-tokai"])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runSimulatedScrape = async () => {
      console.log("%c[SocialNest AI] Starting Deep Scrape for Competitors...", "color: #00ff00; font-weight: bold;");
      
      for (const id of selectedCompetitors) {
        console.log(`[Scraper] Initializing session for ${id}...`);
        await CompetitorScraper.scrapeBrandData(id, 'INSTAGRAM');
        console.log(`[Scraper] Found metadata for ${id}. Extracting engagement rates...`);
        await new Promise(r => setTimeout(r, 2000));
      }
      
      console.log("[Scraper] Post-processing complete. Building dashboard...");
      setIsLoading(false);
    };

    runSimulatedScrape();
  }, [])

  if (isLoading) {
    return (
      <div className="p-6 space-y-12 animate-in fade-in duration-500">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64 bg-muted/70" />
          <Skeleton className="h-4 w-full max-w-xl bg-muted/70" />
        </div>

        {/* Simplified Overview Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl bg-muted/70" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 bg-muted/70" />
                <Skeleton className="h-4 w-1/2 bg-muted/70" />
              </div>
            </div>
          ))}
        </div>

        {/* Simplified Large Blocks */}
        <div className="space-y-8">
          <Skeleton className="h-64 w-full rounded-xl bg-muted/70" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full rounded-xl bg-muted/70" />
            <Skeleton className="h-80 w-full rounded-xl bg-muted/70" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 animate-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold">Coffee Competitor Analysis</h1>
        <p className="text-muted-foreground">Track competitor strategies, campaigns, and engagement patterns in the coffee industry.</p>
      </div>

      <CompetitorOverview selectedCompetitors={selectedCompetitors} onSelectCompetitors={setSelectedCompetitors} />
      {/*  <CampaignAnalysis competitors={selectedCompetitors} /> */}
      <EngagementMetrics competitors={selectedCompetitors} />
      <AIInsights competitors={selectedCompetitors} />
      <TrendIntelligence competitors={selectedCompetitors} />
      <Recommendations competitors={selectedCompetitors} />
    </div>
  )
}
