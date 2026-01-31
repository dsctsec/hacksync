"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Wand2, Hash, Clock, Loader2, Check, AlertCircle } from "lucide-react"
import geminiService from "@/lib/services/gemini-service"
import { useToast } from "@/hooks/use-toast"

interface AIToolsPanelProps {
  caption: string
  onCaptionUpdate: (newCaption: string) => void
}

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "witty", label: "Witty" },
  { value: "inspirational", label: "Inspirational" },
  { value: "urgent", label: "Urgent" },
]



export function AIToolsPanel({ caption, onCaptionUpdate }: AIToolsPanelProps) {
  const { toast } = useToast()
  const [isImproving, setIsImproving] = useState(false)
  const [isChangingTone, setIsChangingTone] = useState(false)
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false)
  const [selectedTone, setSelectedTone] = useState("professional")
  const [improvedCaption, setImprovedCaption] = useState("")
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([
    "#socialmedia",
    "#marketing",
    "#digitalmarketing",
    "#contentcreator",
    "#business",
  ])
  const [bestTimes, setBestTimes] = useState([
    { day: "Monday", time: "9:00 AM", engagement: "High" },
    { day: "Wednesday", time: "12:00 PM", engagement: "Very High" },
    { day: "Friday", time: "2:00 PM", engagement: "High" },
    { day: "Saturday", time: "10:00 AM", engagement: "Medium" },
  ])
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("improve")



  const handleImproveCaption = async () => {
    if (!caption.trim()) return
    setIsImproving(true)
    setError(null)
    
    try {
      const improved = await geminiService.improveCaption(caption)
      setImprovedCaption(improved)
    } catch (err: any) {
      setError(err.message || "Failed to improve caption")
      toast({
        title: "Error",
        description: err.message || "Failed to improve caption. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsImproving(false)
    }
  }

  const handleChangeTone = async () => {
    if (!caption.trim()) return
    setIsChangingTone(true)
    setError(null)
    
    try {
      const adjusted = await geminiService.adjustTone(caption, selectedTone)
      setImprovedCaption(adjusted)
    } catch (err: any) {
      setError(err.message || "Failed to adjust tone")
      toast({
        title: "Error",
        description: err.message || "Failed to adjust tone. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChangingTone(false)
    }
  }

  const handleGenerateHashtags = async () => {
    if (!caption.trim()) return
    setIsGeneratingHashtags(true)
    
    try {
      const hashtags = await geminiService.generateHashtags(caption, undefined, 10)
      setSuggestedHashtags(hashtags)
    } catch (err: any) {
      // Silently fail for hashtag generation, keep defaults
      console.error("Failed to generate hashtags:", err)
    } finally {
      setIsGeneratingHashtags(false)
    }
  }

  const applyImprovement = () => {
    if (improvedCaption) {
      onCaptionUpdate(improvedCaption)
      setImprovedCaption("")
    }
  }

  const copyHashtag = (hashtag: string) => {
    navigator.clipboard.writeText(hashtag)
    setCopiedHashtag(hashtag)
    setTimeout(() => setCopiedHashtag(null), 2000)
  }

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    // Generate hashtags when hashtags tab is opened
    if (newTab === "hashtags" && caption.trim() && suggestedHashtags.length <= 5) {
      handleGenerateHashtags()
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger value="improve" className="text-xs">
              Improve
            </TabsTrigger>
            <TabsTrigger value="tone" className="text-xs">
              Tone
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="text-xs">
              Hashtags
            </TabsTrigger>
            <TabsTrigger value="timing" className="text-xs">
              Timing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="improve" className="space-y-3 mt-3">
            <p className="text-sm text-muted-foreground">Let AI enhance your caption for better engagement.</p>
            <Button onClick={handleImproveCaption} disabled={isImproving || !caption.trim()} className="w-full">
              {isImproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Improve Caption
                </>
              )}
            </Button>
            {improvedCaption && (
              <div className="space-y-2">
                <Label className="text-xs">Suggested improvement:</Label>
                <Textarea value={improvedCaption} readOnly className="min-h-[80px] bg-secondary/50 text-sm" />
                <Button size="sm" onClick={applyImprovement} className="w-full">
                  Apply Suggestion
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tone" className="space-y-3 mt-3">
            <p className="text-sm text-muted-foreground">Adjust your caption's tone to match your audience.</p>
            <Select value={selectedTone} onValueChange={setSelectedTone}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleChangeTone} disabled={isChangingTone || !caption.trim()} className="w-full">
              {isChangingTone ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adjusting...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Change Tone
                </>
              )}
            </Button>
            {improvedCaption && (
              <div className="space-y-2">
                <Label className="text-xs">Adjusted caption:</Label>
                <Textarea value={improvedCaption} readOnly className="min-h-[80px] bg-secondary/50 text-sm" />
                <Button size="sm" onClick={applyImprovement} className="w-full">
                  Apply Suggestion
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hashtags" className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">AI-recommended hashtags for your content.</p>
              {isGeneratingHashtags && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedHashtags.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => copyHashtag(hashtag)}
                >
                  {copiedHashtag === hashtag ? <Check className="h-3 w-3 mr-1" /> : <Hash className="h-3 w-3 mr-1" />}
                  {hashtag.slice(1)}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Click to copy hashtag</p>
          </TabsContent>

          <TabsContent value="timing" className="space-y-3 mt-3">
            {error && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">Best times to post based on your audience activity.</p>
            <div className="space-y-2">
              {bestTimes.map((slot, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{slot.day}</span>
                    <span className="text-sm text-muted-foreground">{slot.time}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      slot.engagement === "Very High"
                        ? "bg-success/20 text-success"
                        : slot.engagement === "High"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }
                  >
                    {slot.engagement}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
