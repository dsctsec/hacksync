"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface EngagementMetricsProps {
  competitors: string[]
}

const engagementData = [
  { date: "Mon", Starbucks: 0.35, ThirdWave: 0.42, BlueTokai: 0.55 },
  { date: "Tue", Starbucks: 0.38, ThirdWave: 0.39, BlueTokai: 0.48 },
  { date: "Wed", Starbucks: 0.32, ThirdWave: 0.45, BlueTokai: 0.52 },
  { date: "Thu", Starbucks: 0.41, ThirdWave: 0.38, BlueTokai: 0.49 },
  { date: "Fri", Starbucks: 0.45, ThirdWave: 0.48, BlueTokai: 0.58 },
  { date: "Sat", Starbucks: 0.52, ThirdWave: 0.55, BlueTokai: 0.65 },
  { date: "Sun", Starbucks: 0.48, ThirdWave: 0.51, BlueTokai: 0.62 },
]

const performanceData = [
  { metric: "Avg Likes (K)", Starbucks: 112, ThirdWave: 1.8, BlueTokai: 4.2 }, // Adjusted for scale visualization
  { metric: "Avg Comments", Starbucks: 85, ThirdWave: 32, BlueTokai: 58 }, // Scaled down for chart visibility
  { metric: "Avg Shares", Starbucks: 240, ThirdWave: 45, BlueTokai: 82 },
]

export default function EngagementMetrics({ competitors }: EngagementMetricsProps) {
  const [isSyncing, setIsSyncing] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      <h2 className="text-2xl font-bold text-foreground">Engagement & Performance</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Engagement Rate Trend (%)</h3>
          {isSyncing ? (
            <Skeleton className="h-[300px] w-full bg-muted/70" />
          ) : (
            <ResponsiveContainer width="100%" height={300} className="animate-in fade-in duration-700">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: `1px solid var(--border)`,
                    borderRadius: "0.625rem",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Starbucks" stroke="#00704A" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ThirdWave" stroke="#D4AF37" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="BlueTokai" stroke="#1E3A8A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Performance Metrics</h3>
          {isSyncing ? (
            <Skeleton className="h-[300px] w-full bg-muted/70" />
          ) : (
            <ResponsiveContainer width="100%" height={300} className="animate-in fade-in duration-700">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="metric" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: `1px solid var(--border)`,
                    borderRadius: "0.625rem",
                  }}
                />
                <Legend />
                <Bar dataKey="Starbucks" fill="#00704A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ThirdWave" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="BlueTokai" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* <Card className="p-6 border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Posting Frequency vs Engagement</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Starbucks India", frequency: "2.8 posts/day", engagement: "0.41% avg" },
            { label: "Third Wave Coffee", frequency: "1.2 posts/day", engagement: "0.45% avg" },
            { label: "Blue Tokai", frequency: "3.5 posts/day", engagement: "0.55% avg" },
          ].map((item, i) => (
            <div key={i} className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">{item.label}</p>
              {isSyncing ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-20 bg-muted/70" />
                  <Skeleton className="h-4 w-16 bg-muted/70" />
                </div>
              ) : (
                <div className="animate-in fade-in duration-500">
                  <p className="text-lg font-semibold text-foreground">{item.frequency}</p>
                  <p className="text-sm text-primary mt-2">{item.engagement}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card> */}
    </div>
  )
}
