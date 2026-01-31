"use client"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import React, { useEffect, useState } from "react"
import { BlueSky, Reddit, X } from "../brand-icons"
import { Linkedin, Facebook, Instagram } from "lucide-react"
import { API_ENDPOINTS, API_FETCH_OPTIONS } from "@/lib/api-config"

interface Platform {
  id: string
  name: string
  icon: React.ReactElement<any, any>
  connected: boolean
  charLimit: number
}

const initialPlatforms: Platform[] = [
  { id: "twitter", name: "Twitter/X", icon: <X className="w-3.5 h-3.5" />, connected: true, charLimit: 280 },
  { id: "facebook", name: "Facebook", icon: <Facebook className="w-4 h-4" />, connected: true, charLimit: 63206 },
  { id: "reddit", name: "Reddit", icon: <Reddit className="w-5 h-5" />, connected: true, charLimit: 40000 },
  { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="w-4 h-4" />, connected: false, charLimit: 3000 },
  { id: "instagram", name: "Instagram", icon: <Instagram className="w-4 h-4" />, connected: false, charLimit: 2200 },
  { id: "bluesky", name: "Bluesky", icon: <BlueSky className="w-4 h-4" />, connected: false, charLimit: 300 },
]

interface PlatformSelectorProps {
  selectedPlatforms: string[]
  onPlatformToggle: (platformId: string) => void
}

export function PlatformSelector({ selectedPlatforms, onPlatformToggle }: PlatformSelectorProps) {
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms)

  // Twitter is already set as connected by default
  // No need to poll the status endpoint repeatedly

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Publish to</Label>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id)
          const isDisabled = !platform.connected

          return (
            <div
              key={platform.id}
              onClick={() => !isDisabled && onPlatformToggle(platform.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary/50 text-muted-foreground",
                isDisabled && "opacity-50 cursor-not-allowed",
                !isDisabled && "hover:border-primary/50"
              )}
            >
              <Checkbox checked={isSelected} disabled={isDisabled} className="pointer-events-none" />
              <span className="text-sm size-4">{platform.icon}</span>
              <span className="text-sm font-medium">{platform.name}</span>
              {!platform.connected && <span className="text-xs text-muted-foreground">(Not connected)</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { initialPlatforms as platforms }
export type { Platform }
