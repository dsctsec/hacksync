import { Users, Eye, Heart } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ConnectedAccounts } from "@/components/dashboard/connected-accounts"
import { ScheduledPosts } from "@/components/dashboard/scheduled-posts"
import { EngagementChart } from "@/components/dashboard/engagement-chart"
import { TrendingMentions } from "@/components/dashboard/trending-mentions"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, John</h1>
        <p className="text-muted-foreground">Here's what's happening with your social presence today.</p>
      </div>

      <QuickActions />
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <EngagementChart />
          <div className="grid gap-4 md:grid-cols-3">
            <StatsCard
              title="Total Followers"
              value="6"
              change="+2.5% from last week"
              changeType="positive"
              icon={Users}
            />
            <StatsCard
              title="Total Impressions"
              value="75"
              change="+7500% from last week"
              changeType="positive"
              icon={Eye}
            />
            <StatsCard
              title="Engagement Rate"
              value="0.5%"
              change="50% from last week"
              changeType="positive"
              icon={Heart}
            />
          </div>
          <ScheduledPosts />
        </div>

        <div className="space-y-6">
          <ConnectedAccounts />
          <TrendingMentions />
        </div>
      </div>
    </div>
  )
}
