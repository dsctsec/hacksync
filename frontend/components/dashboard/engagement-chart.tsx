"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Mon", engagement: 0 },
  { name: "Tue", engagement: 0 },
  { name: "Wed", engagement: 0 },
  { name: "Thu", engagement: 75 },
]

export function EngagementChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Weekly Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] -ml-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.7 0.18 165)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.7 0.18 165)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.005 285)",
                  border: "1px solid oklch(0.25 0.01 285)",
                  borderRadius: "8px",
                  color: "oklch(0.95 0 0)",
                }}
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="oklch(0.7 0.18 165)"
                strokeWidth={2}
                fill="url(#engagementGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
