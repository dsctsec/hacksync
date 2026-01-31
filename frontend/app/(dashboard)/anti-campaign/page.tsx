"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  AlertTriangle,
  Target,
  TrendingDown,
  Lightbulb,
  Loader2,
  Zap,
  Users,
  Building2,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'

interface BackfireScenario {
  scenario: string
  likelihood: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  mitigation: string
}

interface AnalysisResult {
  cliches: string[]
  competitorSimilarities: string[]
  potentialBackfires: BackfireScenario[]
  criticalFeedback: string
  recommendations: string[]
}

export default function AntiCampaignPage() {
  const { toast } = useToast()
  const [plan, setPlan] = useState('')
  const [brandName, setBrandName] = useState('')
  const [industry, setIndustry] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [channels, setChannels] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async () => {
    if (!plan.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a campaign plan to analyze',
        variant: 'destructive'
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const apiBase = typeof window !== 'undefined'
        ? (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api')
        : ''

      const response = await fetch(`${apiBase}/anti-campaign/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          campaignInfo: {
            brandName: brandName || undefined,
            industry: industry || undefined,
            targetAudience: targetAudience || undefined,
            channels: channels ? channels.split(',').map(c => c.trim()) : undefined,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAnalysis(data.analysis)
        toast({
          title: 'Analysis Complete',
          description: 'Your campaign has been critically analyzed.',
        })
      } else {
        throw new Error(data.error || 'Analysis failed')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to analyze campaign',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">Anti-Campaign Generator</h1>
        </div>
        <p className="text-muted-foreground">
          A contrarian AI that stress-tests your campaign strategy by finding weaknesses, clichés, and potential backfires
        </p>
      </div>

      <div className="flex-1 grid gap-6 lg:grid-cols-2 min-h-0 overflow-hidden">
        {/* Input Section */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>Campaign Plan</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 overflow-auto space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Paste your marketing plan here... (Markdown or plain text)"
                  className="min-h-[200px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand Name</Label>
                  <Input
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Your Brand"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Tech, Fashion"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Millennials, B2B decision makers"
                />
              </div>

              <div className="space-y-2">
                <Label>Channels (comma-separated)</Label>
                <Input
                  value={channels}
                  onChange={(e) => setChannels(e.target.value)}
                  placeholder="e.g., Instagram, LinkedIn, Email"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !plan.trim()}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Stress-Test Campaign
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Critical Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto space-y-6">
              {!analysis ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Analyze</h3>
                  <p className="text-muted-foreground">
                    Enter your campaign plan and click "Stress-Test Campaign" to get critical feedback
                  </p>
                </div>
              ) : (
                <>
                  {/* Critical Feedback */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Critical Feedback
                    </h3>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap">{analysis.criticalFeedback}</p>
                    </div>
                  </div>

                  {/* Clichés */}
                  {analysis.cliches.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-orange-500" />
                        Marketing Clichés Found
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.cliches.map((cliche, i) => (
                          <Badge key={i} variant="outline" className="text-orange-600 border-orange-300">
                            {cliche}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Competitor Similarities */}
                  {analysis.competitorSimilarities.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        Competitor Similarities
                      </h3>
                      <ul className="space-y-2">
                        {analysis.competitorSimilarities.map((similarity, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{similarity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Potential Backfires */}
                  {analysis.potentialBackfires.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                        What Could Go Wrong
                      </h3>
                      <div className="space-y-3">
                        {analysis.potentialBackfires.map((backfire, i) => (
                          <Card key={i} className="border-red-200 dark:border-red-800">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm flex-1">{backfire.scenario}</p>
                                <div className="flex gap-2 flex-shrink-0">
                                  <Badge variant="outline" className="text-xs">
                                    <span className="w-2 h-2 rounded-full bg-current mr-1 inline-block"
                                      style={{ backgroundColor: getLikelihoodColor(backfire.likelihood) }}
                                    />
                                    {backfire.likelihood} likelihood
                                  </Badge>
                                  <Badge variant="outline" className={`text-xs ${getImpactColor(backfire.impact)}`}>
                                    {backfire.impact} impact
                                  </Badge>
                                </div>
                              </div>
                              <div className="bg-muted rounded p-3">
                                <p className="text-xs font-medium mb-1 flex items-center gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  Mitigation:
                                </p>
                                <p className="text-xs text-muted-foreground">{backfire.mitigation}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
