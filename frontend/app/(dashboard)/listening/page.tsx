"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Bell, ThumbsUp, ThumbsDown, Minus, Sparkles, Loader2, RefreshCw, MessageSquare, TrendingUp, ExternalLink } from "lucide-react"

interface AnalyzedMention {
  id: string
  platform: string
  author: string
  content: string
  sentiment: "positive" | "negative" | "neutral"
  timestamp: string
  permalink: string
  topics: string[]
  score: number
}

interface KeyInsight {
  category: string
  insight: string
  importance: "high" | "medium" | "low"
}

interface TopTopic {
  topic: string
  count: number
}

interface AnalysisResult {
  mentions: AnalyzedMention[]
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  keyInsights: KeyInsight[]
  topTopics: TopTopic[]
  totalComments: number
}

interface RedditComment {
  id: string
  author: string
  body: string
  score: number
  created: string
  permalink: string
  parentId: string
  depth: number
}

export default function ListeningPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [comments, setComments] = useState<RedditComment[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dataFetched, setDataFetched] = useState(false)

  // Fetch comments from Reddit
  const fetchComments = async () => {
    setIsFetching(true)
    setError(null)
    
    try {
      const response = await fetch("/api/listening")
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch comments")
      }
      
      setComments(data.comments || [])
      setDataFetched(true)
    } catch (err: any) {
      setError(err.message || "Failed to fetch Reddit comments")
    } finally {
      setIsFetching(false)
    }
  }

  // Analyze comments with Gemini
  const analyzeComments = async () => {
    if (comments.length === 0) {
      setError("No comments to analyze. Please fetch comments first.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/listening", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comments }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to analyze comments")
      }

      setAnalysis(data.analysis)
    } catch (err: any) {
      setError(err.message || "Failed to analyze comments")
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchComments()
  }, [])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    return "Just now"
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/50"
      case "medium":
        return "bg-warning/20 text-warning border-warning/50"
      default:
        return "bg-muted text-muted-foreground border-muted"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Social Listening</h1>
          <p className="text-muted-foreground">Monitor mentions and sentiment from r/ettara subreddit</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchComments} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Data
          </Button>
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Alert Settings
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Status & Analyze Button */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Reddit Comments Fetched</h3>
                <p className="text-sm text-muted-foreground">
                  {isFetching ? (
                    "Fetching comments from r/ettara..."
                  ) : dataFetched ? (
                    `${comments.length} comments collected from r/ettara`
                  ) : (
                    "Click refresh to fetch comments"
                  )}
                </p>
              </div>
            </div>
            <Button
              onClick={analyzeComments}
              disabled={isLoading || comments.length === 0 || isFetching}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          {isLoading && (
            <div className="mt-4">
              <Progress value={33} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">Using Gemini AI to analyze sentiment and extract insights...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Sentiment Analysis */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Sentiment Analysis</CardTitle>
                <CardDescription>Overall sentiment breakdown from {analysis.totalComments} comments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-success" />
                      <span>Positive</span>
                    </div>
                    <span className="font-medium">{analysis.sentiment.positive}%</span>
                  </div>
                  <Progress value={analysis.sentiment.positive} className="h-2 bg-secondary [&>div]:bg-success" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span>Neutral</span>
                    </div>
                    <span className="font-medium">{analysis.sentiment.neutral}%</span>
                  </div>
                  <Progress value={analysis.sentiment.neutral} className="h-2 bg-secondary [&>div]:bg-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-destructive" />
                      <span>Negative</span>
                    </div>
                    <span className="font-medium">{analysis.sentiment.negative}%</span>
                  </div>
                  <Progress value={analysis.sentiment.negative} className="h-2 bg-secondary [&>div]:bg-destructive" />
                </div>
              </CardContent>
            </Card>

            {/* Top Topics */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Trending Topics</CardTitle>
                <CardDescription>Most discussed topics in comments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.topTopics.slice(0, 6).map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{topic.topic}</span>
                      </div>
                      <Badge variant="secondary">{topic.count} mentions</Badge>
                    </div>
                  ))}
                  {analysis.topTopics.length === 0 && (
                    <p className="text-sm text-muted-foreground">No topics identified yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Key Insights</CardTitle>
                <CardDescription>AI-generated insights from comments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.keyInsights.slice(0, 4).map((insight, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getImportanceColor(insight.importance)}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {insight.importance}
                        </Badge>
                      </div>
                      <p className="text-sm">{insight.insight}</p>
                    </div>
                  ))}
                  {analysis.keyInsights.length === 0 && (
                    <p className="text-sm text-muted-foreground">No insights generated yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Mentions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Analyzed Mentions</CardTitle>
              <CardDescription>Comments from r/ettara with sentiment analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="bg-secondary mb-4">
                  <TabsTrigger value="all">All ({analysis.mentions.length})</TabsTrigger>
                  <TabsTrigger value="positive">
                    Positive ({analysis.mentions.filter((m) => m.sentiment === "positive").length})
                  </TabsTrigger>
                  <TabsTrigger value="neutral">
                    Neutral ({analysis.mentions.filter((m) => m.sentiment === "neutral").length})
                  </TabsTrigger>
                  <TabsTrigger value="negative">
                    Negative ({analysis.mentions.filter((m) => m.sentiment === "negative").length})
                  </TabsTrigger>
                </TabsList>

                {["all", "positive", "neutral", "negative"].map((tabValue) => (
                  <TabsContent key={tabValue} value={tabValue} className="space-y-3">
                    {analysis.mentions
                      .filter((m) => tabValue === "all" || m.sentiment === tabValue)
                      .slice(0, 20)
                      .map((mention) => (
                        <div key={mention.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                          <span className="flex h-8 w-8 items-center justify-center rounded bg-background text-sm font-bold text-orange-500">
                            r/
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-sm">u/{mention.author}</span>
                              <Badge
                                variant="secondary"
                                className={
                                  mention.sentiment === "positive"
                                    ? "bg-success/20 text-success"
                                    : mention.sentiment === "negative"
                                      ? "bg-destructive/20 text-destructive"
                                      : "bg-muted text-muted-foreground"
                                }
                              >
                                {mention.sentiment}
                              </Badge>
                              {mention.topics.slice(0, 2).map((topic, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {formatTimestamp(mention.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm line-clamp-3">{mention.content}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-muted-foreground">Score: {mention.score}</span>
                              {mention.permalink && (
                                <a
                                  href={mention.permalink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  View on Reddit
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    {analysis.mentions.filter((m) => tabValue === "all" || m.sentiment === tabValue).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No {tabValue === "all" ? "" : tabValue} mentions found
                      </p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State - Before Analysis */}
      {!analysis && !isLoading && dataFetched && (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ready to Analyze</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {comments.length} comments loaded from r/ettara. Click the Analyze button to get AI-powered insights.
                </p>
              </div>
              <Button onClick={analyzeComments} disabled={comments.length === 0}>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Comments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State - Initial Fetch */}
      {isFetching && !dataFetched && (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Fetching Comments</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Loading comments from r/ettara subreddit...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
