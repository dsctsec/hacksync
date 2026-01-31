"use client"
import { API_ENDPOINTS, API_FETCH_OPTIONS } from '@/lib/api-config'

import { useState, useCallback, useEffect } from "react"
import { useScheduledPosts } from "@/lib/scheduled-posts-context"
import type { ScheduledPost } from "@/lib/calendar-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlatformSelector, platforms, type Platform } from "@/components/create/platform-selector"
import { CaptionEditor } from "@/components/create/caption-editor"
import { MediaUploader, type MediaFile } from "@/components/create/media-uploader"
import { MediaUrlInput } from "@/components/create/media-url-input"
import { RedditInput, type RedditPostData } from "@/components/create/reddit-input"

import { SchedulePicker } from "@/components/create/schedule-picker"
import { PostPreview } from "@/components/create/post-preview"
import { Send, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import socialMediaAPI from "@/lib/social-media-api"

export default function CreatePage() {
  const { toast } = useToast()
  const { addPost } = useScheduledPosts()
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter", "facebook", "reddit"])
  const [captions, setCaptions] = useState<Record<string, string>>({})
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [redditData, setRedditData] = useState<RedditPostData>({
    title: "",
    text: "",
    url: "",
    type: "text",
  })
  const [publishType, setPublishType] = useState<"now" | "schedule">("schedule")
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [scheduledTime, setScheduledTime] = useState<string>("12:00 PM")
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("")
  const isRedditSelected = selectedPlatforms.includes("reddit")
  const nonRedditPlatforms = selectedPlatforms.filter((platformId) => platformId !== "reddit")

  useEffect(() => {
    // Check Twitter connection and auto-select if connected
    checkTwitterConnection()
  }, [])

  const checkTwitterConnection = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.twitter.status, {
        ...API_FETCH_OPTIONS
      })
      const data = await response.json()

      if (data.connected && !selectedPlatforms.includes('twitter')) {
        setSelectedPlatforms(prev => [...prev, 'twitter'])
      }
    } catch (error) {
      // Error checking Twitter connection
    }
  }

  const handlePlatformToggle = useCallback((platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId],
    )
  }, [])

  const handleCaptionChange = useCallback((platformId: string, value: string) => {
    setCaptions((prev) => ({ ...prev, [platformId]: value }))
  }, [])

  const handleRedditDataChange = useCallback((value: RedditPostData) => {
    setRedditData(value)
  }, [])

  const getNormalizedRedditPayload = useCallback((): RedditPostData => {
    const title = redditData.title.trim()
    if (!title) {
      throw new Error("Please add a Reddit post title before publishing.")
    }

    const text = redditData.text?.trim()
    const url = redditData.url?.trim()

    if (redditData.type === "link" && !url) {
      throw new Error("A valid URL is required for Reddit link posts.")
    }

    return {
      title,
      type: redditData.type,
      text: text || undefined,
      url: url || undefined,
    }
  }, [redditData])



  const handleUrlAdd = useCallback(
    (url: string) => {
      const newFile: MediaFile = {
        id: Math.random().toString(36).substr(2, 9),
        type: "image",
        url: url,
        name: url.split('/').pop() || 'image',
      }
      setMediaFiles((prev) => [...prev, newFile])
    },
    [],
  )

  const handlePublish = async () => {
    setIsPublishing(true)

    try {
      if (publishType === "now") {
        let redditPayload: RedditPostData | undefined
        if (isRedditSelected) {
          redditPayload = getNormalizedRedditPayload()
        }

        // Get media URLs
        const mediaUrls: Record<string, string> = {}
        if (mediaFiles.length > 0 && mediaFiles[0].url) {
          selectedPlatforms.forEach(platform => {
            mediaUrls[platform] = mediaFiles[0].url!
          })
        }

        // Post to each platform
        const results = []
        for (const platform of selectedPlatforms) {
          try {

            let result
            if (platform === 'twitter') {
              // Use direct Twitter API endpoint for Twitter posts
              result = await socialMediaAPI.postToTwitter(
                captions[platform] || '',
                mediaUrls[platform] ? [mediaUrls[platform]] : undefined
              )
            } else if (platform === 'reddit' && redditPayload) {
              result = await socialMediaAPI.postToReddit(redditPayload)
            } else {
              result = await socialMediaAPI.createPost({
                platform,
                content: {
                  caption: captions[platform] || '',
                  mediaUrl: mediaUrls[platform]
                }
              })
            }

            results.push({ platform, success: true, result })
          } catch (error: any) {
            results.push({ platform, success: false, error: error.message })
          }
        }

        // Show results
        const successCount = results.filter(r => r.success).length
        const failCount = results.length - successCount
        const successPlatforms = results.filter(r => r.success).map(r => r.platform).join(', ')
        const failedPlatforms = results.filter(r => !r.success).map(r => r.platform).join(', ')

        if (successCount > 0 && failCount === 0) {
          toast({
            title: "Posts published! 🎉",
            description: `Successfully posted to ${successPlatforms}`,
          })
          // Clear the form
          setCaptions({})
          setMediaFiles([])
        } else if (successCount > 0) {
          toast({
            title: "Partial success",
            description: `Posted to ${successPlatforms}. Failed: ${failedPlatforms}`,
            variant: "default"
          })
        } else {
          toast({
            title: "Publishing failed",
            description: `Failed to post to ${failedPlatforms}. ${results[0]?.error || 'Check console for details.'}`,
            variant: "destructive"
          })
        }
      } else {
        // Schedule for later - add to calendar
        if (!scheduledDate) {
          toast({
            title: "Error",
            description: "Please select a date for scheduling.",
            variant: "destructive"
          })
          return
        }

        // Parse time string (e.g., "12:00 PM") to get hours and minutes
        const timeParts = scheduledTime.match(/(\d+):(\d+)\s*(AM|PM)?/i)
        let hour = 12
        let minute = 0
        if (timeParts) {
          hour = parseInt(timeParts[1], 10)
          minute = parseInt(timeParts[2], 10)
          const period = timeParts[3]?.toUpperCase()
          if (period === "PM" && hour !== 12) {
            hour += 12
          } else if (period === "AM" && hour === 12) {
            hour = 0
          }
        }

        const scheduledFor = new Date(scheduledDate)
        scheduledFor.setHours(hour, minute, 0, 0)

        // Build content from captions
        const captionContent = Object.entries(captions)
          .filter(([platform, caption]) => selectedPlatforms.includes(platform) && caption)
          .map(([_, caption]) => caption)
          .join(" | ")

        const redditContent = isRedditSelected && redditData.title ? redditData.title : ""
        const content = captionContent || redditContent || "Scheduled post"

        const newScheduledPost: ScheduledPost = {
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
          content,
          platforms: selectedPlatforms,
          scheduledFor,
          status: "scheduled",
          media: mediaFiles.length > 0 ? mediaFiles.map(f => f.url).filter((url): url is string => !!url) : undefined,
        }

        addPost(newScheduledPost)

        toast({
          title: "Post scheduled! 📅",
          description: `Your post will be published on ${scheduledDate?.toLocaleDateString()} at ${scheduledTime}.`,
        })

        // Clear the form after scheduling
        setCaptions({})
        setMediaFiles([])
        setRedditData({ title: "", text: "", url: "", type: "text" })
        setScheduledDate(undefined)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to publish post. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsSaving(false)
    toast({
      title: "Draft saved",
      description: "Your post has been saved as a draft.",
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Post</h1>
          <p className="text-muted-foreground">Compose and schedule posts across multiple platforms</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing || selectedPlatforms.length === 0}>
            {isPublishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {publishType === "now" ? "Publish Now" : "Schedule Post"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <PlatformSelector selectedPlatforms={selectedPlatforms} onPlatformToggle={handlePlatformToggle} />

              <MediaUploader files={mediaFiles} onFilesChange={setMediaFiles} />
              {selectedPlatforms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select at least one platform to start creating your post
                </div>
              ) : (
                <div className="space-y-6">
                  {nonRedditPlatforms.length > 0 && (
                    <Tabs
                      value={nonRedditPlatforms.includes(activeTab) ? activeTab : nonRedditPlatforms[0]}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList
                        className="grid w-full"
                        style={{ gridTemplateColumns: `repeat(${nonRedditPlatforms.length}, minmax(0, 1fr))` }}
                      >
                        {nonRedditPlatforms.map((platformId) => {
                          const platform = platforms.find((p: Platform) => p.id === platformId)
                          if (!platform) return null
                          return (
                            <TabsTrigger key={platformId} value={platformId} className="flex items-center gap-2">
                              <span className="text-lg">{platform.icon}</span>
                              <span>{platform.name}</span>
                            </TabsTrigger>
                          )
                        })}
                      </TabsList>
                      {nonRedditPlatforms.map((platformId) => {
                        const platform = platforms.find((p: Platform) => p.id === platformId)
                        if (!platform) return null
                        return (
                          <TabsContent key={platformId} value={platformId} className="mt-4">
                            <CaptionEditor
                              platformId={platformId}
                              platformName={platform.name}
                              platformIcon={platform.icon}
                              charLimit={platform.charLimit}
                              value={captions[platformId] || ""}
                              onChange={(value) => handleCaptionChange(platformId, value)}
                            />
                          </TabsContent>
                        )
                      })}
                    </Tabs>
                  )}

                  {isRedditSelected && (
                    <RedditInput value={redditData} onChange={handleRedditDataChange} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <PostPreview selectedPlatforms={selectedPlatforms} captions={captions} media={mediaFiles} redditData={redditData} />
        {/* Right Column - Preview & Schedule */}
          <SchedulePicker
            publishType={publishType}
            onPublishTypeChange={setPublishType}
            scheduledDate={scheduledDate}
            onDateChange={setScheduledDate}
            scheduledTime={scheduledTime}
            onTimeChange={setScheduledTime}
          />
        </div>
      </div>
    </div>
  )
}
