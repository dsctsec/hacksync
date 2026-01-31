"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, Eye, Heart, MessageSquare, TrendingUp, TrendingDown, Download, ExternalLink } from "lucide-react"
import { API_FETCH_OPTIONS, API_URL } from "@/lib/api-config"

type EngagementPoint = {
  name: string
  facebook: number
  twitter: number
  linkedin: number
  reddit?: number
}

type RedditTimelineBucket = {
  date: string
  label: string
  postCount: number
  posts: Array<{
    id: string
    title: string
    author: string
    createdAt: string
    permalink: string
    score: number
    numComments: number
  }>
}

const REDDIT_COLOR = "oklch(0.68 0.12 25)"
const formatEngagementTooltip = (value: number | string, name: string) => {
  const numericValue = typeof value === "number" ? value : Number(value)

  if (name === "reddit") {
    return [Number.isFinite(numericValue) ? `${numericValue} posts` : value, "Reddit Posts"]
  }

  return [
    Number.isFinite(numericValue) ? numericValue.toLocaleString() : value,
    name.charAt(0).toUpperCase() + name.slice(1),
  ]
}

const DEFAULT_ENGAGEMENT_DATA: EngagementPoint[] = [
  { name: "Jan 9", facebook: 0, twitter: 0, linkedin: 0 },
  { name: "Jan 10", facebook: 0, twitter: 0, linkedin: 0 },
  { name: "Jan 11", facebook: 0, twitter: 0, linkedin: 0 },
  { name: "Jan 12", facebook: 0, twitter: 0, linkedin: 0 },
  { name: "Jan 13", facebook: 0, twitter: 0, linkedin: 0 },
  { name: "Jan 14", facebook: 0, twitter: 0, linkedin: 0 },
  { name: "Jan 15", facebook: 4, twitter: 5, linkedin: 4 },
]

const mergeEngagementWithReddit = (
  baseline: EngagementPoint[],
  timeline: RedditTimelineBucket[],
): EngagementPoint[] => {
  const baselineNames = new Set(baseline.map((point) => point.name))
  const redditCountByLabel = new Map<string, number>()

  timeline.forEach((bucket) => {
    redditCountByLabel.set(bucket.label, bucket.postCount)
  })

  const mergedBaseline = baseline.map((point) => ({
    ...point,
    reddit: redditCountByLabel.get(point.name) ?? 0,
  }))

  const additionalPoints = timeline
    .filter((bucket) => !baselineNames.has(bucket.label))
    .map((bucket) => ({
      name: bucket.label,
      facebook: 0,
      twitter: 0,
      linkedin: 0,
      reddit: bucket.postCount,
    }))

  return [...mergedBaseline, ...additionalPoints]
}

const audienceData = [
  { name: "18-24", value: 25 },
  { name: "25-34", value: 35 },
  { name: "35-44", value: 22 },
  { name: "45-54", value: 12 },
  { name: "55+", value: 6 },
]

const releventInfluencers = [
  {
    name: "Mayank Shah",
    handle: "FlavoursOfTravels",
    followers: "267K",
    link: "https://www.instagram.com/flavoursoftravels/profilecard/",
  },
  {
    name: "Swarali Kulkarni",
    handle: "MumbaiFoodJunkie",
    followers: "106K",
    link: "https://www.instagram.com/mumbaifoodjunkie",
  },
  {
    name: "Akshay Jain",
    handle: "TastyHealthyYummy",
    followers: "156K",
    link: "https://www.instagram.com/tastyhealthyyummy/profilecard/",
  },
  {
    name: "Abhay Sharma",
    handle: "BombayFoodie_tales",
    followers: "157K",
    link: "https://www.instagram.com/bombayfoodie_tales/profilecard/",
  },
  {
    name: "Ronak Rathod",
    handle: "SpoonsofMumbai",
    followers: "175K",
    link: "https://www.instagram.com/spoonsofmumbai",
  },
  {
    name: "Anitaa Pemgirikar",
    handle: "the_foodhub_mumbai",
    followers: "89K",
    link: "https://www.instagram.com/the_foodhub_mumbai/profilecar",
  },
];

const influencerBadgeGradients = [
  "from-rose-500/80 to-orange-400/70",
  "from-sky-500/80 to-cyan-400/70",
  "from-emerald-500/80 to-lime-400/70",
  "from-violet-500/80 to-fuchsia-400/70",
  "from-amber-500/80 to-pink-400/70",
]

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"


const postPerformanceData = [
  { name: "Mon", posts: 3, engagement: 4500 },
  { name: "Tue", posts: 5, engagement: 7200 },
  { name: "Wed", posts: 4, engagement: 6800 },
  { name: "Thu", posts: 6, engagement: 9100 },
  { name: "Fri", posts: 4, engagement: 5600 },
  { name: "Sat", posts: 2, engagement: 3200 },
  { name: "Sun", posts: 1, engagement: 2100 },
]



const COLORS = [
  "oklch(0.7 0.18 165)",
  "oklch(0.65 0.15 250)",
  "oklch(0.75 0.15 50)",
  "oklch(0.6 0.2 330)",
  "oklch(0.7 0.15 200)",
]

const topPosts = [
  {
    id: 1,
    content: "Ettara Coffee House — Where every cup tells a story.",
    platform: "instagram",
    engagement: 2,
    reach: 50,
  },
  {
    id: 2,
    content: "Sip the moment at Ettara",
    platform: "Twitter/X",
    engagement: 1,
    reach: 32,
  },
  {
    id: 3,
    content: "Your daily coffee, the Ettara way.",
    platform: "instagram",
    engagement: 1,
    reach: 28,
  },
];

const platformIcons: Record<string, string> = {
  instagram: "📷",
  twitter: "𝕏",
  linkedin: "in",
}

export default function AnalyticsPage() {
  const [chartData, setChartData] = useState<EngagementPoint[]>(() =>
    mergeEngagementWithReddit(DEFAULT_ENGAGEMENT_DATA, [])
  )
  const [redditTimeline, setRedditTimeline] = useState<RedditTimelineBucket[]>([])
  const [redditStatus, setRedditStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [redditError, setRedditError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const fetchRedditEngagement = async () => {
      setRedditStatus("loading")
      setRedditError(null)

      try {
        const response = await fetch(
          `${API_URL}/reddit/subreddits/Ettara/engagement?days=14&limit=80&sort=new`,
          {
            ...API_FETCH_OPTIONS,
            cache: "no-store",
            headers: {
              ...((API_FETCH_OPTIONS.headers as Record<string, string>) || {}),
              Accept: "application/json",
            },
          },
        )
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to fetch Reddit engagement data")
        }

        if (!isActive) return

        const timeline: RedditTimelineBucket[] = Array.isArray(payload?.timeline) ? payload.timeline : []

        setRedditTimeline(timeline)
        setChartData(mergeEngagementWithReddit(DEFAULT_ENGAGEMENT_DATA, timeline))
        setRedditStatus("success")
      } catch (error: any) {
        if (!isActive) return
        setRedditStatus("error")
        setRedditError(error?.message || "Unable to load Reddit engagement")
        setChartData(mergeEngagementWithReddit(DEFAULT_ENGAGEMENT_DATA, []))
      }
    }

    fetchRedditEngagement()

    return () => {
      isActive = false
    }
  }, [])

  const redditSummary = useMemo(() => {
    if (!redditTimeline.length) {
      return { totalPosts: 0, rangeLabel: null as string | null }
    }

    const totalPosts = redditTimeline.reduce((sum, bucket) => sum + bucket.postCount, 0)
    const firstLabel = redditTimeline[0]?.label
    const lastLabel = redditTimeline[redditTimeline.length - 1]?.label

    return {
      totalPosts,
      rangeLabel: firstLabel && lastLabel ? `${firstLabel} - ${lastLabel}` : firstLabel || null,
    }
  }, [redditTimeline])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your social media performance across all platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[140px] bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Followers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <div className="flex items-center text-xs text-success mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +600% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reach
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75</div>
            <div className="flex items-center text-xs text-success mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +7500% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engagement Rate
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.5%</div>
            <div className="flex items-center text-xs text-success mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +50% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Engagements
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75</div>
            <div className="flex items-center text-xs text-success mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +7500% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Engagement Over Time */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Engagement Over Time</CardTitle>
              <CardDescription>
                Engagement metrics across all connected platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="facebookGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.7 0.18 165)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.7 0.18 165)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="twitterGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.65 0.15 250)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.65 0.15 250)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="linkedinGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.75 0.15 50)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.75 0.15 50)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="redditGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={REDDIT_COLOR}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={REDDIT_COLOR}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      stroke="oklch(0.65 0 0)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="primary"
                      stroke="oklch(0.65 0 0)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => value.toString()}
                    />
                    <YAxis
                      yAxisId="reddit"
                      orientation="right"
                      stroke={REDDIT_COLOR}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.16 0.005 285)",
                        border: "1px solid oklch(0.25 0.01 285)",
                        borderRadius: "8px",
                        color: "oklch(0.95 0 0)",
                      }}
                      formatter={formatEngagementTooltip}
                    />
                    <Area
                      type="monotone"
                      dataKey="facebook"
                      yAxisId="primary"
                      stroke="oklch(0.7 0.18 165)"
                      strokeWidth={2}
                      fill="url(#facebookGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="twitter"
                      yAxisId="primary"
                      stroke="oklch(0.65 0.15 250)"
                      strokeWidth={2}
                      fill="url(#twitterGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="linkedin"
                      yAxisId="primary"
                      stroke="oklch(0.75 0.15 50)"
                      strokeWidth={2}
                      fill="url(#linkedinGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="reddit"
                      yAxisId="reddit"
                      stroke={REDDIT_COLOR}
                      strokeWidth={2}
                      fill="url(#redditGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: "oklch(0.7 0.18 165)" }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Facebook
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: "oklch(0.65 0.15 250)" }}
                  />
                  <span className="text-sm text-muted-foreground">Twitter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: "oklch(0.75 0.15 50)" }}
                  />
                  <span className="text-sm text-muted-foreground">
                    LinkedIn
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: REDDIT_COLOR }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Reddit (r/Ettara)
                  </span>
                </div>
              </div>
              <div className="text-center text-xs text-muted-foreground mt-2">
                {redditStatus === "loading" &&
                  "Syncing Reddit engagement from r/Ettara..."}
                {redditStatus === "error" &&
                  `Unable to load Reddit engagement${
                    redditError ? ` - ${redditError}` : ""
                  }`}
                {redditStatus === "success" &&
                  (redditSummary.totalPosts > 0
                    ? `r/Ettara published ${redditSummary.totalPosts} posts${
                        redditSummary.rangeLabel
                          ? ` between ${redditSummary.rangeLabel}`
                          : ""
                      }.`
                    : "No recent Reddit activity detected for r/Ettara.")}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Influencer Spotlight */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">
                  Relevant Influencers
                </CardTitle>
                <CardDescription>
                  Creators already resonating with your audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {releventInfluencers.map((influencer, index) => (
                    <div
                      key={influencer.handle}
                      className="group rounded-2xl border border-border/60 bg-secondary/40 p-4 transition hover:border-primary/50 hover:bg-secondary/60"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-base font-semibold text-white shadow-lg shadow-black/20 ${
                            influencerBadgeGradients[
                              index % influencerBadgeGradients.length
                            ]
                          }`}
                        >
                          {getInitials(influencer.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight text-sm">
                            {influencer.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{influencer.handle}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          <span className="text-base font-semibold text-foreground">
                            {influencer.followers}
                          </span>{" "}
                          followers
                        </span>
                        <a
                          href={influencer.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary/80"
                        >
                          View profile
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Posts */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">
                  Top Performing Posts
                </CardTitle>
                <CardDescription>Your best content this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPosts.map((post, index) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                    >
                      <span className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-background text-xs">
                            {platformIcons[post.platform]}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {post.platform}
                          </span>
                        </div>
                        <p className="text-sm truncate">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            <Heart className="h-3 w-3 inline mr-1" />
                            {post.engagement.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            <Eye className="h-3 w-3 inline mr-1" />
                            {post.reach.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Age Demographics */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Age Demographics</CardTitle>
                <CardDescription>
                  Age distribution of your audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={audienceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {audienceData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.16 0.005 285)",
                          border: "1px solid oklch(0.25 0.01 285)",
                          borderRadius: "8px",
                          color: "oklch(0.95 0 0)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Follower Growth */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Follower Growth</CardTitle>
                <CardDescription>Net new followers over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="growthGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="oklch(0.7 0.18 165)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="oklch(0.7 0.18 165)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        stroke="oklch(0.65 0 0)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="oklch(0.65 0 0)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
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
                        dataKey="facebook"
                        stroke="oklch(0.7 0.18 165)"
                        strokeWidth={2}
                        fill="url(#growthGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Post Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">
                Post Performance by Day
              </CardTitle>
              <CardDescription>
                Number of posts and engagement by day of week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={postPerformanceData}>
                    <XAxis
                      dataKey="name"
                      stroke="oklch(0.65 0 0)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="oklch(0.65 0 0)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="oklch(0.65 0 0)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.16 0.005 285)",
                        border: "1px solid oklch(0.25 0.01 285)",
                        borderRadius: "8px",
                        color: "oklch(0.95 0 0)",
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="posts"
                      fill="oklch(0.65 0.15 250)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="engagement"
                      fill="oklch(0.7 0.18 165)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: "oklch(0.65 0.15 250)" }}
                  />
                  <span className="text-sm text-muted-foreground">Posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: "oklch(0.7 0.18 165)" }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Engagement
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
