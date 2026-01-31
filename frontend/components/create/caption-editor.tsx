"use client"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ReactElement } from "react"
import { Sparkles, Wand2, Hash, Clock, Loader2, Check, AlertCircle } from "lucide-react"
import geminiService from "@/lib/services/gemini-service"
import { useToast } from "@/hooks/use-toast"

interface CaptionEditorProps {
  platformId: string
  platformName: string
  platformIcon: ReactElement<any, any>
  charLimit: number
  value: string
  onChange: (value: string) => void
}

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "witty", label: "Witty" },
  { value: "inspirational", label: "Inspirational" },
  { value: "urgent", label: "Urgent" },
]



export function CaptionEditor({
  platformId,
  platformName,
  platformIcon,
  charLimit,
  value,
  onChange,
}: CaptionEditorProps) {
  const { toast } = useToast()
  const charCount = value.length
  const isOverLimit = charCount > charLimit
  const percentUsed = (charCount / charLimit) * 100

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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("improve")



  const handleImproveCaption = async () => {
    if (!value.trim()) return
    setIsImproving(true)
    setError(null)
    
    try {
      const improved = await geminiService.improveCaption(value, platformName)
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
    if (!value.trim()) return
    setIsChangingTone(true)
    setError(null)
    
    try {
      const adjusted = await geminiService.adjustTone(value, selectedTone, platformName)
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
    if (!value.trim()) return
    setIsGeneratingHashtags(true)
    
    try {
      const hashtags = await geminiService.generateHashtags(value, platformName, 10)
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
      onChange(improvedCaption)
      setImprovedCaption("")
      setIsPopoverOpen(false)
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
    if (newTab === "hashtags" && value.trim() && suggestedHashtags.length <= 5) {
      handleGenerateHashtags()
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-secondary text-xs">{platformIcon}</span>
            {platformName}
          </Label>
          <Badge variant={isOverLimit ? "destructive" : "secondary"} className="text-xs">
            {charCount} / {charLimit}
          </Badge>
        </div>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Write your ${platformName} caption...`}
          className={cn(
            "min-h-[120px] resize-none bg-secondary/50",
            isOverLimit && "border-destructive focus-visible:ring-destructive",
          )}
        />
      </div>

      {/* AI Tools Popover Button */}
      <div className="flex justify-end">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Tools
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">AI Tools</span>
              </div>

              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-secondary">
                  <TabsTrigger value="improve" className="text-xs">
                    Improve
                  </TabsTrigger>
                  <TabsTrigger value="tone" className="text-xs">
                    Tone
                  </TabsTrigger>
                  <TabsTrigger value="hashtags" className="text-xs">
                    Tags
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="improve" className="space-y-3 mt-3">
                  <p className="text-xs text-muted-foreground">Let AI enhance your caption for better engagement.</p>
                  <Button onClick={handleImproveCaption} disabled={isImproving || !value.trim()} className="w-full" size="sm">
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
                      <Textarea value={improvedCaption} readOnly className="min-h-[80px] bg-secondary/50 text-xs" />
                      <Button size="sm" onClick={applyImprovement} className="w-full">
                        Apply Suggestion
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tone" className="space-y-3 mt-3">
                  <p className="text-xs text-muted-foreground">Adjust your caption's tone to match your audience.</p>
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
                  <Button onClick={handleChangeTone} disabled={isChangingTone || !value.trim()} className="w-full" size="sm">
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
                      <Textarea value={improvedCaption} readOnly className="min-h-[80px] bg-secondary/50 text-xs" />
                      <Button size="sm" onClick={applyImprovement} className="w-full">
                        Apply Suggestion
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="hashtags" className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">AI-recommended hashtags for your content.</p>
                    {isGeneratingHashtags && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                    {suggestedHashtags.map((hashtag) => (
                      <Badge
                        key={hashtag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
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
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>{error}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Best times to post based on your audience activity.</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {bestTimes.map((slot, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{slot.day}</span>
                          <span className="text-xs text-muted-foreground">{slot.time}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            slot.engagement === "Very High"
                              ? "bg-green-500/20 text-green-700 dark:text-green-400"
                              : slot.engagement === "High"
                                ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {slot.engagement}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
