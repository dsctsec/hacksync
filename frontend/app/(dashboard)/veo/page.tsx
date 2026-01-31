"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  API_ENDPOINTS,
  API_FETCH_OPTIONS,
} from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Loader2, Play, RefreshCw } from "lucide-react"

interface VeoUserDetails {
  fullName: string
  brandName: string
  role: string
  audience: string
  product: string
  platform: string
  region: string
}

interface VeoCreativeDetails {
  tone: string
  style: string
  mood: string
  language: string
  camera: string
  lighting: string
  colorPalette: string
  pacing: string
  callToAction: string
}

interface VeoVideoSettings {
  durationSeconds: number
  aspectRatio: string
  fps: number
  resolution: string
  music: string
  voiceover: string
}

export default function VeoStudioPage() {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [sceneNotes, setSceneNotes] = useState("")
  const [tunedPrompt, setTunedPrompt] = useState("")
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("idle")

  const [userDetails, setUserDetails] = useState<VeoUserDetails>({
    fullName: "",
    brandName: "",
    role: "",
    audience: "",
    product: "",
    platform: "",
    region: "",
  })

  const [creative, setCreative] = useState<VeoCreativeDetails>({
    tone: "confident",
    style: "cinematic",
    mood: "inspiring",
    language: "English",
    camera: "smooth dolly shots",
    lighting: "soft natural lighting",
    colorPalette: "warm neutrals with brand accent",
    pacing: "steady with a punchy finale",
    callToAction: "Visit the landing page to learn more",
  })

  const [videoSettings, setVideoSettings] = useState<VeoVideoSettings>({
    durationSeconds: 8,
    aspectRatio: "16:9",
    fps: 24,
    resolution: "1080p",
    music: "uplifting electronic bed",
    voiceover: "",
  })

  const [isTuning, setIsTuning] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const [duration, setDuration] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [loopSelection, setLoopSelection] = useState(true)

  const parsedScenes = useMemo(
    () =>
      sceneNotes
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [sceneNotes],
  )

  const requestPayload = useMemo(
    () => ({
      prompt,
      negativePrompt: negativePrompt || undefined,
      scenes: parsedScenes.length ? parsedScenes : undefined,
      userDetails,
      creative,
      video: videoSettings,
    }),
    [prompt, negativePrompt, parsedScenes, userDetails, creative, videoSettings],
  )

  const handleTunePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Add a prompt",
        description: "Share the main idea you want Veo to visualize.",
      })
      return
    }

    setIsTuning(true)
    setStatus("tuning")

    try {
      const response = await fetch(API_ENDPOINTS.veo.tune, {
        method: "POST",
        credentials: API_FETCH_OPTIONS.credentials,
        headers: {
          ...API_FETCH_OPTIONS.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to tune prompt")
      }

      setTunedPrompt(data.tunedPrompt)
      setStatus("tuned")
    } catch (error) {
      toast({
        title: "Prompt tuning failed",
        description: (error as Error).message,
        variant: "destructive",
      })
      setStatus("idle")
    } finally {
      setIsTuning(false)
    }
  }

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Add a prompt",
        description: "Share the main idea you want Veo to visualize.",
      })
      return
    }

    setIsGenerating(true)
    setStatus("generating")

    try {
      const response = await fetch(API_ENDPOINTS.veo.generate, {
        method: "POST",
        credentials: API_FETCH_OPTIONS.credentials,
        headers: {
          ...API_FETCH_OPTIONS.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate video")
      }

      setTunedPrompt(data.tunedPrompt || tunedPrompt)
      // Handle both videoUri (from backend) and videoUrl (legacy)
      setVideoUrl(data.videoUri || data.videoUrl)
      setStatus(data.status || "ready")
    } catch (error) {
      toast({
        title: "Video generation failed",
        description: (error as Error).message,
        variant: "destructive",
      })
      setStatus("idle")
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = playbackRate
  }, [playbackRate, videoUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (!trimEnd || trimEnd <= trimStart) return
      if (video.currentTime >= trimEnd) {
        if (loopSelection) {
          video.currentTime = trimStart
          void video.play()
        } else {
          video.pause()
        }
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    return () => video.removeEventListener("timeupdate", handleTimeUpdate)
  }, [trimEnd, trimStart, loopSelection, videoUrl])

  useEffect(() => {
    if (trimEnd && trimStart > trimEnd) {
      setTrimEnd(trimStart)
    }
  }, [trimStart, trimEnd])

  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return
    const videoDuration = Number.isFinite(video.duration) ? video.duration : 0
    setDuration(videoDuration)
    setTrimStart(0)
    setTrimEnd(videoDuration)
  }

  const handleCopyPrompt = async () => {
    if (!tunedPrompt) return
    await navigator.clipboard.writeText(tunedPrompt)
    toast({
      title: "Prompt copied",
      description: "Tuned Veo prompt is on your clipboard.",
    })
  }

  const statusBadge = () => {
    switch (status) {
      case "tuning":
        return "Tuning"
      case "tuned":
        return "Tuned"
      case "generating":
        return "Generating"
      case "complete":
        return "Ready"
      case "demo":
        return "Demo Video"
      case "processing":
        return "Processing"
      case "error":
        return "Error"
      default:
        return "Idle"
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Veo Studio</h1>
          <p className="text-sm text-muted-foreground">
            Build a tuned video prompt, generate with Veo 3, and preview edits in one place.
          </p>
        </div>
        <Badge variant={status === "error" ? "destructive" : "secondary"}>
          {statusBadge()}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Describe the video you want Veo 3 to generate"
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label>What should Veo avoid?</Label>
                <Textarea
                  value={negativePrompt}
                  onChange={(event) => setNegativePrompt(event.target.value)}
                  placeholder="Avoid generic stock footage, harsh shadows, shaky camera..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Scene beats</Label>
                <Textarea
                  value={sceneNotes}
                  onChange={(event) => setSceneNotes(event.target.value)}
                  placeholder="One scene per line (e.g. 1. Opening hero shot of the product)"
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleTunePrompt} disabled={isTuning} variant="secondary">
                  {isTuning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Tuning...
                    </>
                  ) : (
                    "Tune Prompt"
                  )}
                </Button>
                <Button onClick={handleGenerateVideo} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate with Veo 3"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Details (Personalization)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input
                  value={userDetails.fullName}
                  onChange={(event) =>
                    setUserDetails((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  placeholder="Avery Johnson"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={userDetails.role}
                  onChange={(event) =>
                    setUserDetails((prev) => ({ ...prev, role: event.target.value }))
                  }
                  placeholder="Creative Director"
                />
              </div>
              <div className="space-y-2">
                <Label>Brand name</Label>
                <Input
                  value={userDetails.brandName}
                  onChange={(event) =>
                    setUserDetails((prev) => ({ ...prev, brandName: event.target.value }))
                  }
                  placeholder="SocialNest Labs"
                />
              </div>
              <div className="space-y-2">
                <Label>Product or service</Label>
                <Input
                  value={userDetails.product}
                  onChange={(event) =>
                    setUserDetails((prev) => ({ ...prev, product: event.target.value }))
                  }
                  placeholder="AI social media assistant"
                />
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Input
                  value={userDetails.audience}
                  onChange={(event) =>
                    setUserDetails((prev) => ({ ...prev, audience: event.target.value }))
                  }
                  placeholder="Startup founders and marketing leads"
                />
              </div>
              <div className="space-y-2">
                <Label>Primary platform</Label>
                <Input
                  value={userDetails.platform}
                  onChange={(event) =>
                    setUserDetails((prev) => ({ ...prev, platform: event.target.value }))
                  }
                  placeholder="YouTube Shorts, Instagram Reels"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Region or market focus</Label>
                <Input
                  value={userDetails.region}
                  onChange={(event) =>
                    setUserDetails((prev) => ({ ...prev, region: event.target.value }))
                  }
                  placeholder="North America, tech-forward cities"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Creative Direction</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select
                  value={creative.tone}
                  onValueChange={(value) => setCreative((prev) => ({ ...prev, tone: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confident">Confident</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Style</Label>
                <Select
                  value={creative.style}
                  onValueChange={(value) => setCreative((prev) => ({ ...prev, style: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="documentary">Documentary</SelectItem>
                    <SelectItem value="product-showcase">Product showcase</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="motion-graphics">Motion graphics + live action</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mood</Label>
                <Input
                  value={creative.mood}
                  onChange={(event) =>
                    setCreative((prev) => ({ ...prev, mood: event.target.value }))
                  }
                  placeholder="Inspiring, calm, energetic"
                />
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Input
                  value={creative.language}
                  onChange={(event) =>
                    setCreative((prev) => ({ ...prev, language: event.target.value }))
                  }
                  placeholder="English"
                />
              </div>
              <div className="space-y-2">
                <Label>Camera direction</Label>
                <Input
                  value={creative.camera}
                  onChange={(event) =>
                    setCreative((prev) => ({ ...prev, camera: event.target.value }))
                  }
                  placeholder="Gimbal tracking shots"
                />
              </div>
              <div className="space-y-2">
                <Label>Lighting</Label>
                <Input
                  value={creative.lighting}
                  onChange={(event) =>
                    setCreative((prev) => ({ ...prev, lighting: event.target.value }))
                  }
                  placeholder="Soft studio lighting"
                />
              </div>
              <div className="space-y-2">
                <Label>Color palette</Label>
                <Input
                  value={creative.colorPalette}
                  onChange={(event) =>
                    setCreative((prev) => ({ ...prev, colorPalette: event.target.value }))
                  }
                  placeholder="Warm neutrals with teal accents"
                />
              </div>
              <div className="space-y-2">
                <Label>Pacing</Label>
                <Input
                  value={creative.pacing}
                  onChange={(event) =>
                    setCreative((prev) => ({ ...prev, pacing: event.target.value }))
                  }
                  placeholder="Slow build with energetic payoff"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Call to action</Label>
                <Input
                  value={creative.callToAction}
                  onChange={(event) =>
                    setCreative((prev) => ({ ...prev, callToAction: event.target.value }))
                  }
                  placeholder="Book a demo today"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Video Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={videoSettings.durationSeconds}
                  onChange={(event) =>
                    setVideoSettings((prev) => ({
                      ...prev,
                      durationSeconds: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Aspect ratio</Label>
                <Select
                  value={videoSettings.aspectRatio}
                  onValueChange={(value) =>
                    setVideoSettings((prev) => ({ ...prev, aspectRatio: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="4:5">4:5 (Feed)</SelectItem>
                    <SelectItem value="21:9">21:9 (Cinematic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>FPS</Label>
                <Input
                  type="number"
                  min={12}
                  max={60}
                  value={videoSettings.fps}
                  onChange={(event) =>
                    setVideoSettings((prev) => ({
                      ...prev,
                      fps: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Resolution</Label>
                <Input
                  value={videoSettings.resolution}
                  onChange={(event) =>
                    setVideoSettings((prev) => ({ ...prev, resolution: event.target.value }))
                  }
                  placeholder="1080p"
                />
              </div>
              <div className="space-y-2">
                <Label>Music direction</Label>
                <Input
                  value={videoSettings.music}
                  onChange={(event) =>
                    setVideoSettings((prev) => ({ ...prev, music: event.target.value }))
                  }
                  placeholder="Uplifting electronic"
                />
              </div>
              <div className="space-y-2">
                <Label>Voiceover guidance</Label>
                <Input
                  value={videoSettings.voiceover}
                  onChange={(event) =>
                    setVideoSettings((prev) => ({ ...prev, voiceover: event.target.value }))
                  }
                  placeholder="Optional voiceover notes"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Veo Prompt Preview</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                disabled={!tunedPrompt}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                value={tunedPrompt}
                readOnly
                placeholder="Tune your prompt to see the Veo-ready script."
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Video Viewer</CardTitle>
              {videoUrl ? (
                <Button asChild variant="secondary" size="sm">
                  <a href={videoUrl} target="_blank" rel="noreferrer">
                    Open Source
                  </a>
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-3">
                {videoUrl ? (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    preload="metadata"
                    className="w-full rounded-md"
                    onLoadedMetadata={handleLoadedMetadata}
                    onError={(e) => {
                      const video = e.currentTarget
                      const error = video.error
                      if (error) {
                        let errorMessage = 'Failed to load video'
                        switch (error.code) {
                          case error.MEDIA_ERR_ABORTED:
                            errorMessage = 'Video loading aborted'
                            break
                          case error.MEDIA_ERR_NETWORK:
                            errorMessage = 'Network error while loading video. Check CORS settings.'
                            break
                          case error.MEDIA_ERR_DECODE:
                            errorMessage = 'Video decoding error'
                            break
                          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                            errorMessage = 'Video format not supported or MIME type issue'
                            break
                        }
                        toast({
                          title: 'Video Error',
                          description: errorMessage,
                          variant: 'destructive'
                        })
                      }
                    }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Play className="h-8 w-8" />
                    Generate a video to preview it here.
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Trim start: {trimStart.toFixed(1)}s</span>
                  <span>Trim end: {trimEnd.toFixed(1)}s</span>
                </div>
                <div className="space-y-2">
                  <Label>Trim start</Label>
                  <Slider
                    value={[trimStart]}
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    onValueChange={(values) => setTrimStart(values[0])}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trim end</Label>
                  <Slider
                    value={[trimEnd]}
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    onValueChange={(values) => setTrimEnd(values[0])}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Playback speed</Label>
                  <Select
                    value={playbackRate.toString()}
                    onValueChange={(value) => setPlaybackRate(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Speed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                  <div>
                    <Label className="text-sm">Loop selection</Label>
                    <p className="text-xs text-muted-foreground">
                      Repeat the trimmed segment while previewing.
                    </p>
                  </div>
                  <Switch checked={loopSelection} onCheckedChange={setLoopSelection} />
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (!videoRef.current) return
                  videoRef.current.currentTime = trimStart
                  void videoRef.current.play()
                }}
                disabled={!videoUrl}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Preview trimmed section
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
