"use client"

import { useEffect, useMemo, useState } from "react"
import { Sparkles, PhoneCall, MessageSquare, Filter, TrendingUp, Target, Users, Clock, Loader2, Phone, PhoneOff, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

const customers = [
  {
    id: "crm-2001",
    name: "Vinayak Mohanty",
    stage: "active" as const,
    email: "vinayak97696@gmail.com",
    phone: "+919324889443",
    company: "Coffee Enthusiast",
  },
  {
    id: "crm-2002",
    name: "Priya Sharma",
    stage: "warm" as const,
    email: "priya.sharma@example.com",
    phone: "+919876543210",
    company: "Freelancer",
  },
  {
    id: "crm-2003",
    name: "Rahul Kapoor",
    stage: "risk" as const,
    email: "rahul.k@example.com",
    phone: "+919988776655",
    company: "Tech Startup",
  },
]

type Customer = (typeof customers)[number]

type StageToken = "active" | "warm" | "risk"

const outreachTemplates: Record<StageToken, string> = {
  active:
    "Hi vinayak, this is Etarra Coffee Shop from Bandra! We'd love to invite you to try our signature cold brews and artisanal pastries. Visit us for a complimentary tasting!",
  warm:
    "Hi vinayak, we noticed you've been exploring coffee shops in Mumbai. Etarra offers the best single-origin pour overs in Bandra - would love to have you visit!",
  risk:
    "Hi vinayak, we miss you at Etarra! Come back for our new seasonal menu and enjoy 20% off your next order. We're at Bandra West, near Linking Road!",
}

interface CallStatus {
  isActive: boolean
  callSid?: string
  status: 'idle' | 'initiating' | 'ringing' | 'in-progress' | 'completed' | 'failed'
  customerName?: string
  duration?: number
}

interface ConversationEntry {
  role: 'user' | 'assistant'
  text: string
  timestamp: number
}

export default function CRMPage() {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [draftMessage, setDraftMessage] = useState("")
  const [callStatus, setCallStatus] = useState<CallStatus>({
    isActive: false,
    status: 'idle'
  })
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [conversationLog, setConversationLog] = useState<ConversationEntry[]>([])

  const summary = useMemo(
    () => ({
      active: customers.filter((c) => c.stage === "active").length,
      warm: customers.filter((c) => c.stage === "warm").length,
      risk: customers.filter((c) => c.stage === "risk").length,
      responseTime: "2min",
    }),
    [],
  )

  const handleGlobalAiDial = () => {
    toast({
      title: "☕ AI Outreach Started",
      description: "Etarra AI is calling top leads to invite them to our Bandra café.",
    })
  }

  // Make actual AI call via backend Twilio + Deepgram pipeline
  const handleRowAiDial = async (customer: Customer) => {
    setConversationLog([])
    setCallStatus({
      isActive: true,
      status: 'initiating',
      customerName: customer.name
    })
    setShowCallDialog(true)

    try {
      const apiBase = typeof window !== 'undefined' 
        ? (process.env.NEXT_PUBLIC_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''))
        : ''
      
  const response = await fetch(`${apiBase}/api/make-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: customer.phone 
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCallStatus({
          isActive: true,
          status: 'ringing',
          callSid: data.callSid,
          customerName: customer.name
        })

        toast({
          title: `📞 Calling ${customer.name}`,
          description: `Etarra AI is reaching out with a personalized coffee experience pitch!`,
        })

        // Simulate call progression (in real app, use webhooks for status updates)
        setTimeout(() => {
          setCallStatus(prev => ({ ...prev, status: 'in-progress' }))
        }, 3000)

      } else {
        throw new Error(data.error || 'Failed to initiate call')
      }

    } catch (error: any) {
      console.error('Call error:', error)
      setCallStatus({
        isActive: false,
        status: 'failed',
        customerName: customer.name
      })

      toast({
        title: "Call failed",
        description: error.message || "Could not connect the AI call. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEndCall = () => {
    setCallStatus({
      isActive: false,
      status: 'completed',
      customerName: callStatus.customerName
    })
    
    toast({
      title: "Call completed",
      description: `AI call with ${callStatus.customerName} has ended.`,
    })

    setTimeout(() => {
      setShowCallDialog(false)
      setCallStatus({ isActive: false, status: 'idle' })
      setConversationLog([])
    }, 2000)
  }

  useEffect(() => {
    if (!showCallDialog || !callStatus.callSid) {
      return
    }

    let isMounted = true
    const apiBase = typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''))
      : ''

    const fetchTranscript = async () => {
      try {
        const response = await fetch(`${apiBase}/api/calls/${callStatus.callSid}/transcript`)
        const data = await response.json()
        if (!isMounted) return
        if (response.ok && data.success) {
          setConversationLog(data.transcript || [])
        }
      } catch (error) {
        console.error('Transcript fetch error:', error)
      }
    }

    fetchTranscript()
    const interval = setInterval(fetchTranscript, 2000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [showCallDialog, callStatus.callSid])

  const openMessageDialog = (customer: Customer) => {
    const template = outreachTemplates[customer.stage as StageToken] || outreachTemplates.active
    const personalized = template
      .replace("${name}", customer.name)
      .replace("${company}", customer.company)

    setSelectedCustomer(customer)
    setDraftMessage(personalized)
    setIsDialogOpen(true)
  }

  const handleSaveMessage = () => {
    if (!selectedCustomer) return

    toast({
      title: "Message saved",
      description: `${selectedCustomer.name} has been added to the outreach queue`,
    })
    setIsDialogOpen(false)
    setSelectedCustomer(null)
    setDraftMessage("")
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">☕ Etarra Coffee - Customer Outreach</h1>
          <p className="text-muted-foreground">
            AI-powered voice calls to bring more coffee lovers to our Bandra café. Real conversations with Twilio & Deepgram.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="gap-2" onClick={() => toast({ title: "Filters coming soon" })}>
            <Filter className="h-4 w-4" />
            Smart Filters
          </Button>
         
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Regular Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.active}</p>
            <p className="text-xs text-muted-foreground">Loyal coffee lovers at Etarra</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warm Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.warm}</p>
            <p className="text-xs text-muted-foreground">Ready to discover our brews</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Back</CardTitle>
            <TrendingUp className="h-4 w-4 rotate-45 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.risk}</p>
            <p className="text-xs text-muted-foreground">Missing their Etarra experience</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.responseTime}</p>
            <p className="text-xs text-muted-foreground">AI call connection speed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 ">
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-base">Customer Table</CardTitle>
                <CardDescription>Prioritize contacts with the best momentum this week.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="rounded-full">1 account</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Phone Number</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-t border-border/80">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarFallback>
                              {customer.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold leading-tight">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{customer.email}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{customer.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2"
                            onClick={() => handleRowAiDial(customer)}
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                            AI Call
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => openMessageDialog(customer)}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Reach Out Msg
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

         
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setSelectedCustomer(null)
            setDraftMessage("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reach Out Message</DialogTitle>
            <DialogDescription>
              {selectedCustomer
                ? `Send a personalized note to ${selectedCustomer.name} at ${selectedCustomer.company}`
                : "Draft a quick note before saving."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={6}
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            placeholder="Type your message..."
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMessage}>Save Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Call Status Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {callStatus.status === 'initiating' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              {callStatus.status === 'ringing' && <Phone className="h-5 w-5 text-yellow-500 animate-pulse" />}
              {callStatus.status === 'in-progress' && <Phone className="h-5 w-5 text-green-500" />}
              {callStatus.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {callStatus.status === 'failed' && <PhoneOff className="h-5 w-5 text-red-500" />}
              Etarra AI Call
            </DialogTitle>
            <DialogDescription>
              {callStatus.status === 'initiating' && 'Connecting to Twilio...'}
              {callStatus.status === 'ringing' && `Calling ${callStatus.customerName}...`}
              {callStatus.status === 'in-progress' && 'AI conversation in progress'}
              {callStatus.status === 'completed' && 'Call completed successfully!'}
              {callStatus.status === 'failed' && 'Call could not be connected'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Call Info Card */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <span className="text-2xl">☕</span>
                  </div>
                  <div>
                    <p className="font-semibold">{callStatus.customerName}</p>
                    <p className="text-sm text-muted-foreground">Etarra Coffee Shop Pitch</p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge 
                      variant={
                        callStatus.status === 'in-progress' ? 'default' :
                        callStatus.status === 'completed' ? 'secondary' :
                        callStatus.status === 'failed' ? 'destructive' : 'outline'
                      }
                    >
                      {callStatus.status === 'initiating' && 'Initiating...'}
                      {callStatus.status === 'ringing' && 'Ringing...'}
                      {callStatus.status === 'in-progress' && 'In Progress'}
                      {callStatus.status === 'completed' && 'Completed'}
                      {callStatus.status === 'failed' && 'Failed'}
                    </Badge>
                  </div>
                  
                </div>

                {/* Features being used */}
                {callStatus.status === 'in-progress' && (
                  <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">
                      AI Features Active:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        🎙️ Deepgram STT
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        🤖 Gemini AI
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        🔊 Deepgram TTS
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Conversation */}
            {(callStatus.status === 'in-progress' || callStatus.status === 'completed') && (
              <div className="bg-muted/50 rounded-lg p-3 max-h-56 overflow-y-auto space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Live conversation</p>
                {conversationLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Waiting for transcript...</p>
                ) : (
                  conversationLog.map((entry, index) => (
                    <div key={`${entry.timestamp}-${index}`} className="text-sm">
                      <span className={entry.role === 'assistant' ? "text-primary font-medium" : "text-foreground font-medium"}>
                        {entry.role === 'assistant' ? 'AI' : 'Customer'}:
                      </span>{" "}
                      <span className="text-muted-foreground">{entry.text}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {callStatus.status === 'in-progress' && (
              <Button variant="destructive" onClick={handleEndCall} className="gap-2">
                <PhoneOff className="h-4 w-4" />
                End Call
              </Button>
            )}
            {(callStatus.status === 'completed' || callStatus.status === 'failed') && (
              <Button onClick={() => setShowCallDialog(false)}>
                Close
              </Button>
            )}
            {(callStatus.status === 'initiating' || callStatus.status === 'ringing') && (
              <Button variant="outline" onClick={() => {
                setShowCallDialog(false)
                setCallStatus({ isActive: false, status: 'idle' })
              }}>
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
