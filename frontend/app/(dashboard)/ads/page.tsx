"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Upload, 
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  Legend,
  CartesianGrid
} from "recharts"
import { API_ENDPOINTS, API_FETCH_OPTIONS, API_FETCH_OPTIONS_FORM } from "@/lib/api-config"
import { useToast } from "@/hooks/use-toast"
import geminiService, { AdRecommendation } from "@/lib/services/gemini-service"

interface PlatformReport {
  platform: string
  totalImpressions: number
  totalClicks: number
  totalSpend: number
  totalConversions: number
  averageCTR: number
  averageCPC: number
  averageCPM: number
  conversionRate: number
  costPerConversion: number
  campaignCount: number
  adSetCount: number
  adCount: number
}

interface OverallReport {
  totalImpressions: number
  totalClicks: number
  totalSpend: number
  totalConversions: number
  averageCTR: number
  averageCPC: number
  averageCPM: number
  conversionRate: number
  costPerConversion: number
  platformReports: PlatformReport[]
  dateRange: {
    start: string
    end: string
  }
  campaignCount: number
  adSetCount: number
  adCount: number
}

const COLORS = [
  "oklch(0.65 0.15 250)",
  "oklch(0.7 0.18 165)",
  "oklch(0.6 0.2 30)",
  "oklch(0.55 0.18 280)",
  "oklch(0.75 0.15 200)",
  "oklch(0.65 0.2 100)",
]

const PLATFORM_OPTIONS = [
  "auto",
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Twitter",
  "TikTok",
  "Google Ads",
  "YouTube",
  "Pinterest",
  "Snapchat",
  "Other",
]

export default function AdsPage() {
  const { toast } = useToast()
  const [report, setReport] = useState<OverallReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState("auto")
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<AdRecommendation[]>([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.ads.report, API_FETCH_OPTIONS)
      if (!response.ok) {
        throw new Error("Failed to fetch report")
      }
      const data = await response.json()
      if (data.success) {
        setReport(data.report)
      }
    } catch (error) {
      console.error("Error fetching report:", error)
      toast({
        title: "Error",
        description: "Failed to load ad performance report",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
      setUploadErrors([])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadErrors([])

    try {
      const formData = new FormData()
      formData.append("csv", selectedFile)
      if (selectedPlatform !== "auto") {
        formData.append("platform", selectedPlatform)
      }

      const response = await fetch(API_ENDPOINTS.ads.upload, {
        ...API_FETCH_OPTIONS_FORM,
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      if (data.success) {
        toast({
          title: "Success",
          description: `Successfully imported ${data.saved} records`,
          variant: "default",
        })
        setSelectedFile(null)
        if (data.errors && data.errors.length > 0) {
          setUploadErrors(data.errors)
        }
        // Refresh report
        await fetchReport()
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload CSV",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadErrors([])
  }

  const handleGenerateRecommendations = async () => {
    if (!report) return

    setRecommendationsLoading(true)
    try {
      const topPlatforms = report.platformReports
        .slice(0, 3)
        .map((platform) => `${platform.platform} ($${platform.totalSpend.toFixed(2)})`)
        .join(", ")

      const summary = [
        `Total spend: $${report.totalSpend.toFixed(2)}`,
        `Total impressions: ${report.totalImpressions.toLocaleString()}`,
        `Total clicks: ${report.totalClicks.toLocaleString()}`,
        `Total conversions: ${report.totalConversions.toLocaleString()}`,
        `Average CTR: ${report.averageCTR.toFixed(2)}%`,
        `Average CPC: $${report.averageCPC.toFixed(2)}`,
        `Average CPM: $${report.averageCPM.toFixed(2)}`,
        `Conversion rate: ${report.conversionRate.toFixed(2)}%`,
        `Top platforms by spend: ${topPlatforms || "N/A"}`,
      ].join("\n")

      const platformContext = selectedPlatform === "auto" ? undefined : selectedPlatform
      const suggestions = await geminiService.generateAdRecommendations(summary, platformContext)
      setRecommendations(suggestions)
      toast({
        title: "Recommendations ready",
        description: "AI suggestions generated from your latest ad report.",
      })
    } catch (error) {
      console.error("Recommendation error:", error)
      toast({
        title: "AI recommendations failed",
        description: error instanceof Error ? error.message : "Unable to generate recommendations",
        variant: "destructive",
      })
    } finally {
      setRecommendationsLoading(false)
    }
  }

  // Prepare chart data
  const platformSpendData = report?.platformReports.map(p => ({
    platform: p.platform,
    spend: p.totalSpend,
    conversions: p.totalConversions,
    impressions: p.totalImpressions,
  })) || []

  const platformCTRData = report?.platformReports.map(p => ({
    platform: p.platform,
    ctr: p.averageCTR,
    conversionRate: p.conversionRate,
  })) || []

  const platformPieData = report?.platformReports.map(p => ({
    name: p.platform,
    value: p.totalSpend,
  })) || []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ads Manager</h1>
          <p className="text-muted-foreground">Upload CSV data and view comprehensive ad performance reports</p>
        </div>
      </div>

      {/* CSV Upload Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Ad Data (CSV)
          </CardTitle>
          <CardDescription>
            Upload a CSV file with the following columns: Date, Campaign Name, Ad Set Name, Ad Name, Impressions, Clicks, Spend (USD), CTR (%), CPC (USD), CPM (USD), Conversions
            <span className="block mt-1">New uploads are appended to existing data.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Platform for this upload</p>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-full md:w-[240px] bg-secondary/50">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform === "auto" ? "Auto-detect from CSV" : platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose a platform to apply to all rows, or use auto-detect.
            </p>
          </div>
          <div className="border-2 border-dashed rounded-lg p-6">
            <input
              type="file"
              id="csv-upload"
              accept=".csv,text/csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {!selectedFile ? (
              <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">CSV files only</p>
              </label>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>Uploading...</>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {uploadErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive mb-2">Upload Errors:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {uploadErrors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-muted-foreground">Loading report...</div>
        </div>
      ) : !report || report.totalSpend === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No ad data available. Upload a CSV file to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${report.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">
                  {report.campaignCount} campaigns
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(report.totalImpressions / 1000).toFixed(1)}K</div>
                <p className="text-xs text-muted-foreground">
                  CTR: {report.averageCTR.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalClicks.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  CPC: ${report.averageCPC.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalConversions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Cost/Conv: ${report.costPerConversion.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.conversionRate.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.totalClicks > 0 
                    ? `${report.totalConversions} conversions from ${report.totalClicks} clicks`
                    : "No clicks recorded"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average CPM</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${report.averageCPM.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cost per 1,000 impressions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Date Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.adCount} ads across {report.adSetCount} ad sets
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">AI Recommendations</CardTitle>
                <CardDescription>Get quick optimization ideas based on this report.</CardDescription>
              </div>
              <Button onClick={handleGenerateRecommendations} disabled={recommendationsLoading}>
                {recommendationsLoading ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {recommendationsLoading ? (
                <div className="text-sm text-muted-foreground">Analyzing your report...</div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <div key={`${recommendation.title}-${index}`} className="rounded-lg border p-3">
                      <p className="font-medium">{recommendation.title}</p>
                      <p className="text-sm text-muted-foreground">{recommendation.rationale}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Generate AI insights to optimize performance.</div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-secondary">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="platforms">Platform Performance</TabsTrigger>
              <TabsTrigger value="breakdown">Platform Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Spend by Platform</CardTitle>
                    <CardDescription>Total ad spend distribution across platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={platformSpendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 285)" />
                          <XAxis 
                            dataKey="platform" 
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
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "oklch(0.16 0.005 285)",
                              border: "1px solid oklch(0.25 0.01 285)",
                              borderRadius: "8px",
                              color: "oklch(0.95 0 0)",
                            }}
                            formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          />
                          <Bar
                            dataKey="spend"
                            fill="oklch(0.65 0.15 250)"
                            radius={[4, 4, 0, 0]}
                            name="Spend ($)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Spend Distribution</CardTitle>
                    <CardDescription>Platform spend as percentage of total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={platformPieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {platformPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "oklch(0.16 0.005 285)",
                              border: "1px solid oklch(0.25 0.01 285)",
                              borderRadius: "8px",
                              color: "oklch(0.95 0 0)",
                            }}
                            formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Performance Metrics by Platform</CardTitle>
                  <CardDescription>CTR and Conversion Rate comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformCTRData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 285)" />
                        <XAxis 
                          dataKey="platform" 
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
                          tickFormatter={(value) => `${value.toFixed(1)}%`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "oklch(0.16 0.005 285)",
                            border: "1px solid oklch(0.25 0.01 285)",
                            borderRadius: "8px",
                            color: "oklch(0.95 0 0)",
                          }}
                          formatter={(value: number) => `${value.toFixed(2)}%`}
                        />
                        <Legend />
                        <Bar
                          dataKey="ctr"
                          fill="oklch(0.65 0.15 250)"
                          radius={[4, 4, 0, 0]}
                          name="CTR (%)"
                        />
                        <Bar
                          dataKey="conversionRate"
                          fill="oklch(0.7 0.18 165)"
                          radius={[4, 4, 0, 0]}
                          name="Conversion Rate (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="platforms" className="space-y-4">
              <div className="grid gap-4">
                {report.platformReports.map((platform, idx) => (
                  <Card key={platform.platform} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{platform.platform}</CardTitle>
                        <Badge variant="outline">
                          {platform.campaignCount} campaigns
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Spend</p>
                          <p className="text-lg font-bold">${platform.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Impressions</p>
                          <p className="text-lg font-bold">{(platform.totalImpressions / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Clicks</p>
                          <p className="text-lg font-bold">{platform.totalClicks.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Conversions</p>
                          <p className="text-lg font-bold">{platform.totalConversions.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div>
                          <p className="text-xs text-muted-foreground">CTR</p>
                          <p className="text-sm font-medium">{platform.averageCTR.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">CPC</p>
                          <p className="text-sm font-medium">${platform.averageCPC.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">CPM</p>
                          <p className="text-sm font-medium">${platform.averageCPM.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cost/Conv</p>
                          <p className="text-sm font-medium">${platform.costPerConversion.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Platform Performance Breakdown</CardTitle>
                  <CardDescription>Detailed metrics comparison across all platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Platform</th>
                          <th className="text-right p-2 font-medium">Spend</th>
                          <th className="text-right p-2 font-medium">Impressions</th>
                          <th className="text-right p-2 font-medium">Clicks</th>
                          <th className="text-right p-2 font-medium">Conversions</th>
                          <th className="text-right p-2 font-medium">CTR</th>
                          <th className="text-right p-2 font-medium">CPC</th>
                          <th className="text-right p-2 font-medium">CPM</th>
                          <th className="text-right p-2 font-medium">Conv. Rate</th>
                          <th className="text-right p-2 font-medium">Cost/Conv</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.platformReports.map((platform) => (
                          <tr key={platform.platform} className="border-b">
                            <td className="p-2 font-medium">{platform.platform}</td>
                            <td className="p-2 text-right">${platform.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2 text-right">{(platform.totalImpressions / 1000).toFixed(1)}K</td>
                            <td className="p-2 text-right">{platform.totalClicks.toLocaleString()}</td>
                            <td className="p-2 text-right">{platform.totalConversions.toLocaleString()}</td>
                            <td className="p-2 text-right">{platform.averageCTR.toFixed(2)}%</td>
                            <td className="p-2 text-right">${platform.averageCPC.toFixed(2)}</td>
                            <td className="p-2 text-right">${platform.averageCPM.toFixed(2)}</td>
                            <td className="p-2 text-right">{platform.conversionRate.toFixed(2)}%</td>
                            <td className="p-2 text-right">${platform.costPerConversion.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
