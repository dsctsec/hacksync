"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Facebook, Instagram, Linkedin } from "lucide-react"
import { BlueSky, Reddit, X } from "../brand-icons"

import { API_ENDPOINTS, API_FETCH_OPTIONS } from "@/lib/api-config"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

const platforms = [
  { id: "twitter", name: "Twitter/X", icon: X },
  { id: "facebook", name: "Facebook", icon: Facebook }, 
  { id: "reddit", name: "Reddit", icon: Reddit },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "bluesky", name: "Bluesky", icon: BlueSky },
]

export default function OnboardingStep4({ formData, onContinue, onBack }: any) {
  const [isCheckingTwitter, setIsCheckingTwitter] = useState(true)
  const [twitterConnected, setTwitterConnected] = useState(false)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>(
    formData.connectedPlatforms && formData.connectedPlatforms.length > 0 
      ? formData.connectedPlatforms 
      : []
  )

  useEffect(() => {
    const checkTwitter = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.twitter.status, {
          ...API_FETCH_OPTIONS
        })
        const data = await response.json()
        if (data.connected) {
          setTwitterConnected(true)
          if (!connectedPlatforms.includes("twitter")) {
            setConnectedPlatforms(prev => [...prev, "twitter"])
          }
        }
      } catch (error) {
        console.error("Error checking Twitter status during onboarding:", error)
      } finally {
        setIsCheckingTwitter(false)
      }
    }
    checkTwitter()
  }, [])

  const handleTwitterConnect = () => {
    // Save current onboarding state to localStorage so we can resume
    localStorage.setItem("onboarding_formData", JSON.stringify({
      ...formData,
      connectedPlatforms: connectedPlatforms
    }))
    localStorage.setItem("onboarding_currentStep", "4")
    
    // Redirect to Twitter auth with returnTo pointing back here
    window.location.href = `${API_ENDPOINTS.twitter.auth}?returnTo=/onboarding/setup`
  }

  const handleContinue = () => {
    onContinue({ connectedPlatforms })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-balance">Connect your social accounts</h1>
        <p className="text-lg text-muted-foreground">
          Link your accounts to get real-time data and insights. You can skip this for now.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const Icon = platform.icon
          const isConnected = platform.id === "twitter" ? twitterConnected : connectedPlatforms.includes(platform.id)

          return (
            <Card
              key={platform.id}
              className={`p-6 border-2 transition-all ${
                isConnected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-primary" />
                {isConnected && (
                  <div className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                    Connected
                  </div>
                )}
              </div>
              <h3 className="font-semibold mb-4">{platform.name}</h3>
              {platform.id === "twitter" && isCheckingTwitter ? (
                <Button disabled className="w-full">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (platform.id === "twitter" && !isConnected) {
                      handleTwitterConnect()
                      return
                    }
                    setConnectedPlatforms((prev) =>
                      prev.includes(platform.id) ? prev.filter((p) => p !== platform.id) : [...prev, platform.id],
                    )
                  }}
                  variant={isConnected ? (platform.id === "twitter" ? "outline" : "default") : "outline"}
                  className="w-full"
                >
                  {isConnected ? (platform.id === "twitter" ? "Disconnect" : "Connected") : "Connect"}
                </Button>
              )}
            </Card>
          )
        })}
      </div>

      <div className="flex justify-between gap-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={handleContinue} size="lg">
          Continue
        </Button>
      </div>
    </div>
  )
}
