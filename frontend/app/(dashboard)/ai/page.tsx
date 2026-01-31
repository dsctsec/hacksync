"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChatMessage } from "@/components/ai/chat-message"
import { SuggestionChips } from "@/components/ai/suggestion-chips"
import { PlatformOutput, type PlatformContent } from "@/components/ai/platform-output"
import { AICapabilities } from "@/components/ai/ai-capabilities"
import { MarketingPlanViewer } from "@/components/ai/marketing-plan-viewer"
import { AnalyticsInsightsViewer } from "@/components/ai/analytics-insights-viewer"
import {
  Send,
  Sparkles,
  Loader2,
  Brain,
  Image as ImageIcon,
  Calendar,
  FileText,
  BarChart3,
  CheckCircle2,
  RefreshCw,
  X,
  Eye,
  Lightbulb
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  platformOutputs?: PlatformContent[]
  thoughts?: string[]
  actions?: Array<{ type: string; data: any }>
}

interface CollectedInfo {
  brandName?: string
  brandDescription?: string
  industry?: string
  campaignGoal?: string
  targetAudience?: string
  budget?: string
  channels?: string[]
  timeline?: string
  tone?: string
}

type Phase = 'ready' | 'gathering' | 'analyzing' | 'planning' | 'creating' | 'complete'

const phaseInfo: Record<Phase, { label: string; icon: any; progress: number; color: string }> = {
  ready: { label: 'Ready', icon: Sparkles, progress: 0, color: 'text-muted-foreground' },
  gathering: { label: 'Gathering Info', icon: Brain, progress: 20, color: 'text-blue-500' },
  analyzing: { label: 'Analyzing Data', icon: BarChart3, progress: 40, color: 'text-purple-500' },
  planning: { label: 'Creating Plan', icon: FileText, progress: 60, color: 'text-orange-500' },
  creating: { label: 'Generating Assets', icon: ImageIcon, progress: 80, color: 'text-pink-500' },
  complete: { label: 'Campaign Ready', icon: CheckCircle2, progress: 100, color: 'text-green-500' },
}

export default function AIPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('ready')
  const [collectedInfo, setCollectedInfo] = useState<CollectedInfo>({})
  const [currentThoughts, setCurrentThoughts] = useState<string[]>([])
  const [showThoughts, setShowThoughts] = useState(false)
  const [showCanvas, setShowCanvas] = useState(false)
  const [canvasData, setCanvasData] = useState<any>(null)
  const [showPlan, setShowPlan] = useState(false)
  const [marketingPlan, setMarketingPlan] = useState<string>("")
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarData, setCalendarData] = useState<any>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current && scrollContainerRef.current) {
      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        const viewport = scrollContainerRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          })
        }
      })
    }
  }, [messages])

  const handleSend = async (prompt?: string) => {
    const messageText = prompt || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsGenerating(true)
    setCurrentThoughts([])
    setShowThoughts(true)

    // Move from ready to gathering when user sends first message
    if (phase === 'ready') {
      setPhase('gathering')
    }

    try {
      // Determine backend API base. Prefer NEXT_PUBLIC_API_BASE, otherwise assume backend on localhost:3000 in dev.
      // const apiBase = (typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:3000' : '')) ) || '';
      const apiBase = "http://localhost:3000/api";
      const url = apiBase ? `${apiBase}/nestgpt/chat` : '/api/nestgpt/chat';

      // Send message field for conversational chat (NestGPT will handle intake collection via progressive Q&A)
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, message: messageText })
      })

      // Handle response - check for JSON parse issues
      let data: any
      try {
        const text = await resp.text()
        data = JSON.parse(text)
      } catch (parseError) {
        const assistantMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: 'I received a response but had trouble processing it. Please try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        return
      }

      if (!resp.ok) {
        const assistantMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: data.error || data.details || 'Sorry, something went wrong while generating a reply.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        // Update session ID
        if (data.sessionId) {
          setSessionId(data.sessionId)
        }

        // Update phase
        if (data.phase) {
          setPhase(data.phase as Phase)
        }

        // Update collected info
        if (data.collectedInfo) {
          setCollectedInfo(data.collectedInfo)
        }

        // Process actions
        if (data.actions && Array.isArray(data.actions)) {
          for (const action of data.actions) {
            if (action.type === 'canvas' && action.data?.canvas) {
              setCanvasData(action.data.canvas)
              setShowCanvas(true)
              toast({
                title: "🎨 Image Generated",
                description: "A new campaign image has been created on the canvas.",
              })
            }
            if (action.type === 'marketingPlan' && action.data?.plan) {
              setMarketingPlan(action.data.plan)
              setShowPlan(true)
              toast({
                title: "📋 Marketing Plan Created",
                description: "Your comprehensive marketing plan is ready.",
              })
            }
            if (action.type === 'contentCalendar' && action.data?.calendar) {
              setCalendarData(action.data.calendar)
              setShowCalendar(true)
              toast({
                title: "📅 Content Calendar Created",
                description: "Your content calendar is ready for review.",
              })
            }
            if (action.type === 'analytics' && action.data) {
              setAnalyticsData(action.data)
              setShowAnalytics(true)
            }
          }
        }

        // Update thoughts
        setCurrentThoughts(data.thoughts || [])

        // Generate a default reply if empty
        const replyContent = data.reply && data.reply.trim() !== ''
          ? data.reply
          : "I'm processing your request. Let me create something for you in the Canvas Studio! 🎨";

        const assistantMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: replyContent,
          timestamp: new Date(),
          thoughts: data.thoughts,
          actions: data.actions,
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (err: any) {
      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: err?.message || 'Network error',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsGenerating(false)
      setTimeout(() => setShowThoughts(false), 3000)
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    handleSend(suggestion)
  }

  const handleSendToCreate = (content?: string) => {
    toast({
      title: "Sent to Create",
      description: "Content has been sent to the post creator.",
    })
    router.push("/create")
  }

  const handleReset = async () => {
    if (sessionId) {
      try {
        const apiBase = typeof window !== 'undefined'
          ? (process.env.NEXT_PUBLIC_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''))
          : ''
        await fetch(`${apiBase}/nestgpt/session/${sessionId}`, {
          method: 'DELETE',
        })
      } catch (e) {
        // Failed to reset session
      }
    }
    setSessionId(null)
    setMessages([])
    setPhase('ready')
    setCollectedInfo({})
    setCanvasData(null)
    setMarketingPlan("")
    setCalendarData(null)
    setAnalyticsData(null)
    toast({
      title: "Session Reset",
      description: "Starting a fresh campaign conversation.",
    })
  }

  const PhaseIcon = phaseInfo[phase].icon

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">NestGPT Agent</h1>
            <Badge variant="outline" className="ml-2">AI Powered</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
        <p className="text-muted-foreground text-sm mt-1">Your AI marketing strategist - creating complete campaigns step by step</p>
      </div>

      {/* Phase Progress */}
      <Card className="mb-4 flex-shrink-0">
        <CardContent className="py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PhaseIcon className={`h-5 w-5 ${phaseInfo[phase].color}`} />
              <span className="font-medium">{phaseInfo[phase].label}</span>
            </div>
            <span className="text-sm text-muted-foreground">{phaseInfo[phase].progress}%</span>
          </div>
          <Progress value={phaseInfo[phase].progress} className="h-2" />

          {/* Phase indicators */}
          <div className="flex justify-between mt-3 px-1">
            {Object.entries(phaseInfo)
              .filter(([key]) => key !== 'ready')
              .map(([key, info]) => {
              const isActive = key === phase
              const isPast = phaseInfo[phase].progress > info.progress
              const Icon = info.icon
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-1 ${
                    isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-30'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? info.color : ''}`} />
                  <span className="text-[10px] hidden md:block">{info.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid gap-4 lg:grid-cols-4 min-h-0 overflow-hidden">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col min-h-0 overflow-hidden">
          <Card className="flex-1 flex flex-col bg-card border-border overflow-hidden">
            <CardHeader className="pb-3 shrink-0 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Campaign Builder Chat</CardTitle>
                {currentThoughts.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowThoughts(!showThoughts)}
                    className="gap-1"
                  >
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs">Thoughts</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
              {/* Thoughts Popup */}
              {showThoughts && currentThoughts.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-3 flex-shrink-0">
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">Agent Thinking...</p>
                      <div className="space-y-1">
                        {currentThoughts.map((thought, i) => (
                          <p key={i} className="text-xs text-yellow-700 dark:text-yellow-300 truncate">{thought}</p>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 flex-shrink-0"
                      onClick={() => setShowThoughts(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-hidden" ref={scrollContainerRef}>
                <ScrollArea className="h-full pr-4 p-4">
                  {messages.length === 0 ? (
                    <div className="space-y-6 py-8">
                      <div className="text-center">
                        <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Ready to Build Your Campaign</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          I'll help you create a complete marketing campaign with strategy, visuals, and a content calendar.
                        </p>
                      </div>
                      <SuggestionChips onSelect={handleSuggestionSelect} />
                    </div>
                  ) : (
                    <div className="space-y-4 pb-4">
                      {messages.map((message) => (
                        <div key={message.id}>
                          <ChatMessage
                            role={message.role}
                            content={message.content}
                            timestamp={message.timestamp}
                            onSendToCreate={message.role === "assistant" ? () => handleSendToCreate() : undefined}
                          />
                          {/* Action buttons for assistant messages */}
                          {message.role === 'assistant' && message.actions && message.actions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 ml-11">
                              {message.actions.some(a => a.type === 'canvas') && (
                                <Button variant="outline" size="sm" onClick={() => setShowCanvas(true)} className="h-7 text-xs">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Canvas
                                </Button>
                              )}
                              {message.actions.some(a => a.type === 'marketingPlan') && (
                                <Button variant="outline" size="sm" onClick={() => setShowPlan(true)} className="h-7 text-xs">
                                  <FileText className="h-3 w-3 mr-1" />
                                  View Plan
                                </Button>
                              )}
                              {message.actions.some(a => a.type === 'contentCalendar') && (
                                <Button variant="outline" size="sm" onClick={() => setShowCalendar(true)} className="h-7 text-xs">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  View Calendar
                                </Button>
                              )}
                              {message.actions.some(a => a.type === 'analytics') && (
                                <Button variant="outline" size="sm" onClick={() => setShowAnalytics(true)} className="h-7 text-xs">
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  View Analytics
                                </Button>
                              )}
                            </div>
                          )}
                          {message.platformOutputs && (
                            <div className="mt-4 ml-11">
                              <PlatformOutput
                                outputs={message.platformOutputs}
                                onSendToCreate={(content) => handleSendToCreate(content.content)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      {isGenerating && <ChatMessage role="assistant" content="" isGenerating />}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border shrink-0 mt-auto">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tell me about your brand and campaign goals..."
                    className="min-h-[50px] max-h-[100px] resize-none bg-secondary/50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  />
                  <Button onClick={() => handleSend()} disabled={isGenerating || !input.trim()} className="shrink-0">
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 overflow-auto">
          {/* Collected Info Card */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Campaign Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {Object.keys(collectedInfo).length === 0 ? (
                <p className="text-muted-foreground text-xs">No info collected yet. Start chatting to build your campaign brief.</p>
              ) : (
                <>
                  {collectedInfo.brandName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand:</span>
                      <span className="font-medium">{collectedInfo.brandName}</span>
                    </div>
                  )}
                  {collectedInfo.campaignGoal && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Goal:</span>
                      <span className="font-medium capitalize">{collectedInfo.campaignGoal}</span>
                    </div>
                  )}
                  {collectedInfo.targetAudience && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Audience:</span>
                      <span className="font-medium truncate ml-2">{collectedInfo.targetAudience}</span>
                    </div>
                  )}
                  {collectedInfo.channels && collectedInfo.channels.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Channels:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {collectedInfo.channels.map((ch, i) => (
                          <Badge key={i} variant="secondary" className="text-xs capitalize">{ch}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {collectedInfo.budget && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium capitalize">{collectedInfo.budget}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Generated Assets */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Generated Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={!canvasData}
                onClick={() => setShowCanvas(true)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Campaign Images
                {canvasData && <Badge className="ml-auto" variant="secondary">1</Badge>}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={!marketingPlan}
                onClick={() => setShowPlan(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Marketing Plan
                {marketingPlan && <CheckCircle2 className="h-3 w-3 ml-auto text-green-500" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={!calendarData}
                onClick={() => setShowCalendar(true)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Content Calendar
                {calendarData && <CheckCircle2 className="h-3 w-3 ml-auto text-green-500" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={!analyticsData}
                onClick={() => setShowAnalytics(true)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics Insights
                {analyticsData && <CheckCircle2 className="h-3 w-3 ml-auto text-green-500" />}
              </Button>
            </CardContent>
          </Card>

          <AICapabilities />
        </div>
      </div>

      {/* Canvas Dialog */}
      <Dialog open={showCanvas} onOpenChange={setShowCanvas}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Campaign Canvas
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {canvasData ? (
              <div className="space-y-4 p-1">
                <div className="aspect-square max-w-md mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  {canvasData.layers?.[0]?.imageData?.imageUrl ? (
                    <img
                      src={canvasData.layers[0].imageData.imageUrl}
                      alt="Campaign Image"
                      className="w-full h-full object-cover"
                    />
                  ) : canvasData.imageUrl ? (
                    <img
                      src={canvasData.imageUrl}
                      alt="Campaign Image"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      {canvasData.layers?.[0]?.imageData?.generationStatus === 'generating' ? (
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p>Generating image...</p>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Image is being generated...</p>
                          <p className="text-xs mt-1 opacity-70">This may take a few moments</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-center text-sm text-muted-foreground space-y-1">
                  <p><strong>Canvas:</strong> {canvasData.name || 'Campaign Image'}</p>
                  {(canvasData.primaryImagePrompt || canvasData.prompt) && (
                    <p className="text-xs opacity-80"><strong>Prompt:</strong> {canvasData.primaryImagePrompt || canvasData.prompt}</p>
                  )}
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <Button onClick={() => router.push('/canvas')}>
                    Open in Canvas Editor
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No canvas created yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Marketing Plan Dialog */}
      <Dialog open={showPlan} onOpenChange={setShowPlan}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Marketing Plan
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {marketingPlan ? (
              <MarketingPlanViewer
                plan={marketingPlan}
                brandName={collectedInfo.brandName}
                campaignName={collectedInfo.campaignGoal ? `${collectedInfo.campaignGoal} Campaign` : undefined}
                collectedInfo={collectedInfo}
                onSave={() => {
                  toast({
                    title: "Plan Saved",
                    description: "Marketing plan has been saved successfully.",
                  })
                }}
              />
            ) : (
              <p className="text-center text-muted-foreground py-8">No marketing plan created yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Content Calendar
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {calendarData ? (
              <div className="space-y-4 p-1">
                {(Array.isArray(calendarData) ? calendarData : [calendarData]).map((week: any, i: number) => (
                  <Card key={i}>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">{week.theme || `Week ${i + 1}`}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {(week.posts || []).map((post: any, j: number) => (
                          <div key={j} className="flex items-center gap-4 p-3 text-sm">
                            <div className="w-20 text-muted-foreground">{post.date}</div>
                            <Badge variant="outline" className="capitalize">{post.channel}</Badge>
                            <span className="flex-1 truncate">{post.suggestion}</span>
                            <span className="text-muted-foreground text-xs">{post.time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No content calendar created yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Insights Report
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {analyticsData ? (
              <AnalyticsInsightsViewer
                data={analyticsData}
                brandName={collectedInfo.brandName}
              />
            ) : (
              <p className="text-center text-muted-foreground py-8">No analytics data available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
