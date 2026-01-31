"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { CheckCircle } from "lucide-react"

export default function OnboardingStep5({ formData, onContinue, onBack }: any) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateDashboard = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      onContinue({})
    }, 1500)
  }

  const platformNames: Record<string, string> = {
    twitter: "Twitter/X",
    facebook: "Facebook", 
    reddit: "Reddit",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    bluesky: "Bluesky",
    youtube: "YouTube",
  }

  const goalNames: Record<string, string> = {
    launch: "Launch a new campaign",
    grow: "Grow social media presence",
    ads: "Run ads",
    competitors: "Analyze competitors",
    unified: "Manage social media in one place",
    explore: "Just exploring",
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-balance">Here's what we understood</h1>
        <p className="text-lg text-muted-foreground">Review your settings and make sure everything looks good</p>
      </div>

      <Card className="p-8 border border-border space-y-6">
        {/* Brand Name */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Brand Name</p>
          <p className="text-lg font-semibold">{formData.brandName}</p>
        </div>

        {/* Goals */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Your Goals</p>
          <div className="flex flex-wrap gap-2">
            {formData.selectedGoals?.map((goal: string) => (
              <Badge key={goal} variant="secondary" className="text-sm">
                {goalNames[goal] || goal}
              </Badge>
            ))}
          </div>
        </div>

        {/* Brand Description */}
        {formData.brandDescription && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">About Your Brand</p>
            <p className="text-foreground">{formData.brandDescription}</p>
          </div>
        )}

        {/* Audience */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Target Audience</p>
          <p className="font-semibold">
            {formData.audienceType} • Ages {formData.ageRange?.join(", ")}
          </p>
          <p className="text-muted-foreground">{formData.geography?.join(", ")}</p>
        </div>

        {/* Tone */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Brand Tone</p>
          <p className="text-lg font-semibold">{formData.tone}</p>
        </div>

        {/* Platforms */}
        {formData.connectedPlatforms?.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Connected Platforms</p>
            <div className="flex flex-wrap gap-2">
              {formData.connectedPlatforms.map((platform: string) => (
                <Badge key={platform} className="text-sm">
                  {platformNames[platform] || platform}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
        <div className="flex gap-3 items-start">
          <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">You're all set!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click the button below to create your dashboard and start managing your social presence with AI.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <Button onClick={onBack} variant="outline" size="lg" disabled={isLoading}>
          Back
        </Button>
        <Button onClick={handleCreateDashboard} size="lg" disabled={isLoading}>
          {isLoading ? "Creating Dashboard..." : "Create Dashboard"}
        </Button>
      </div>
    </div>
  )
}
