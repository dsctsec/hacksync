"use client"

import React, { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  Loader2, 
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  BarChart3,
  PieChart,
  Copy,
  Check
} from "lucide-react"

interface AnalyticsData {
  summary?: {
    totalEngagement?: number
    totalReach?: number
    avgEngagementRate?: string
    followerGrowth?: string
  }
  platformBreakdown?: {
    [key: string]: {
      followers?: number
      avgLikes?: number
      avgComments?: number
      avgRetweets?: number
      topContentType?: string
      bestPostingTime?: string
    }
  }
  audienceInsights?: {
    ageGroups?: { [key: string]: string }
    topLocations?: string[]
    interests?: string[]
  }
  recommendations?: string[]
}

interface AnalyticsInsightsViewerProps {
  data: AnalyticsData
  brandName?: string
}

export function AnalyticsInsightsViewer({ data, brandName }: AnalyticsInsightsViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const decodeEscapedUnicode = (value: string) => {
    return value
      .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
      .replace(/\\x([0-9a-fA-F]{2})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
  }

  const handleExportPDF = async () => {
    if (!contentRef.current) return
    
    setIsExporting(true)
    
    try {
      const { jsPDF } = await import('jspdf')
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // PDF settings
      const pageWidth = 210
      const pageHeight = 297
      const margin = 20
      const maxWidth = pageWidth - (margin * 2)
      let y = margin
      
      // Helper to check page break
      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          pdf.addPage()
          y = margin
        }
      }
      
      // Title
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
  pdf.text(decodeEscapedUnicode(`Analytics Insights${brandName ? ` - ${brandName}` : ''}`), margin, y)
      y += 10
      
      // Date
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(128, 128, 128)
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y)
      y += 15
      pdf.setTextColor(0, 0, 0)
      
      // Summary section
      if (data.summary) {
        checkPageBreak(30)
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Summary', margin, y)
        y += 8
        
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        const summaryItems = [
          `Total Engagement: ${data.summary.totalEngagement?.toLocaleString() || 'N/A'}`,
          `Total Reach: ${data.summary.totalReach?.toLocaleString() || 'N/A'}`,
          `Engagement Rate: ${data.summary.avgEngagementRate || 'N/A'}`,
          `Follower Growth: ${data.summary.followerGrowth || 'N/A'}`
        ]
        for (const item of summaryItems) {
          pdf.text(decodeEscapedUnicode(`• ${item}`), margin + 5, y)
          y += 6
        }
        y += 5
      }
      
      // Platform breakdown
      if (data.platformBreakdown && Object.keys(data.platformBreakdown).length > 0) {
        const platforms = Object.entries(data.platformBreakdown)
        checkPageBreak(20 + platforms.length * 6)
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Platform Performance', margin, y)
        y += 8
        
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        for (const [platformName, platformData] of platforms) {
          const line = `${platformName}: ${platformData.followers?.toLocaleString() || 0} followers, ${platformData.avgLikes || 0} avg likes`
          pdf.text(decodeEscapedUnicode(`• ${line}`), margin + 5, y)
          y += 6
        }
        y += 5
      }
      
      // Recommendations
      if (data.recommendations && data.recommendations.length > 0) {
        checkPageBreak(20 + data.recommendations.length * 10)
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Recommendations', margin, y)
        y += 8
        
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        for (let i = 0; i < data.recommendations.length; i++) {
          const rec = data.recommendations[i]
          const splitText = pdf.splitTextToSize(decodeEscapedUnicode(`${i + 1}. ${rec}`), maxWidth - 10)
          checkPageBreak(splitText.length * 5)
          pdf.text(splitText, margin + 5, y)
          y += splitText.length * 5 + 2
        }
      }
      
      const fileName = `${brandName || 'analytics'}-insights-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('PDF export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopy = async () => {
    const text = generateTextReport(data, brandName)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateTextReport = (data: AnalyticsData, brandName?: string): string => {
    let report = `# Analytics Insights Report${brandName ? ` - ${brandName}` : ''}\n\n`
    report += `Generated on ${new Date().toLocaleDateString()}\n\n`
    
    if (data.summary) {
      report += `## Summary\n`
      report += `- Total Engagement: ${data.summary.totalEngagement?.toLocaleString() || 'N/A'}\n`
      report += `- Total Reach: ${data.summary.totalReach?.toLocaleString() || 'N/A'}\n`
      report += `- Engagement Rate: ${data.summary.avgEngagementRate || 'N/A'}\n`
      report += `- Follower Growth: ${data.summary.followerGrowth || 'N/A'}\n\n`
    }
    
    if (data.recommendations) {
      report += `## Recommendations\n`
      data.recommendations.forEach((rec, i) => {
        report += `${i + 1}. ${rec}\n`
      })
    }
    
    return report
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return '📸'
      case 'twitter': return '🐦'
      case 'linkedin': return '💼'
      case 'facebook': return '👥'
      case 'tiktok': return '🎵'
      default: return '📊'
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {brandName && <Badge variant="outline">{brandName}</Badge>}
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Last 14 days
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy Report'}
          </Button>
          <Button onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div 
        ref={contentRef} 
        className="bg-white dark:bg-gray-900 rounded-lg p-6 space-y-6"
        style={{ colorScheme: 'light' }}
      >
        {/* Header */}
        <div className="text-center pb-4 border-b">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Insights Report
          </h1>
          {brandName && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">for {brandName}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Key Metrics Summary */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Key Performance Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Engagement</span>
                </div>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {data.summary?.totalEngagement?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Likes, comments, shares
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Reach</span>
                </div>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {data.summary?.totalReach?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Unique accounts reached
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Engagement Rate</span>
                </div>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {data.summary?.avgEngagementRate || '0%'}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Above industry average
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Follower Growth</span>
                </div>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {data.summary?.followerGrowth || '0%'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Net new followers
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Platform Breakdown */}
        {data.platformBreakdown && Object.keys(data.platformBreakdown).length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Platform Performance
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(data.platformBreakdown).map(([platform, stats]) => (
                <Card key={platform} className="overflow-hidden">
                  <CardHeader className="py-3 bg-gray-50 dark:bg-gray-800">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-xl">{getPlatformIcon(platform)}</span>
                      <span className="capitalize">{platform}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Followers</span>
                      <span className="font-semibold">{stats.followers?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg. Likes</span>
                      <span className="font-semibold">{stats.avgLikes?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {platform === 'twitter' ? 'Avg. Retweets' : 'Avg. Comments'}
                      </span>
                      <span className="font-semibold">
                        {(stats.avgRetweets || stats.avgComments)?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Best Content</span>
                        <Badge variant="secondary" className="capitalize">{stats.topContentType || 'posts'}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-muted-foreground">Best Time</span>
                        <span className="font-medium text-primary">{stats.bestPostingTime || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Audience Insights */}
        {data.audienceInsights && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Audience Insights
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Age Distribution */}
              {data.audienceInsights.ageGroups && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Age Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(data.audienceInsights.ageGroups).map(([age, percentage]) => (
                      <div key={age} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{age}</span>
                          <span className="font-medium">{percentage}</span>
                        </div>
                        <Progress value={parseInt(percentage)} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Locations & Interests */}
              <div className="space-y-4">
                {data.audienceInsights.topLocations && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Top Locations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {data.audienceInsights.topLocations.map((location, i) => (
                          <Badge key={i} variant="outline">
                            📍 {location}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {data.audienceInsights.interests && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Audience Interests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {data.audienceInsights.interests.map((interest, i) => (
                          <Badge key={i} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Strategic Recommendations
            </h2>
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {data.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary Stats Footer */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                {Object.keys(data.platformBreakdown || {}).length}
              </p>
              <p className="text-xs text-muted-foreground">Platforms Analyzed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">14</p>
              <p className="text-xs text-muted-foreground">Days of Data</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {data.recommendations?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Action Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">
                {data.summary?.avgEngagementRate || '0%'}
              </p>
              <p className="text-xs text-muted-foreground">Avg Performance</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-sm text-gray-500">
            Generated by NestGPT • SocialNest Marketing Platform
          </p>
        </div>
      </div>
    </div>
  )
}
