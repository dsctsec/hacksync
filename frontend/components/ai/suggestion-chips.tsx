"use client"

import { Button } from "@/components/ui/button"
import { Lightbulb, Calendar, TrendingUp, ImageIcon, Hash, Megaphone } from "lucide-react"

interface SuggestionChipsProps {
  onSelect: (suggestion: string) => void
}

const suggestions = [
  {
    icon: Lightbulb,
    label: "Generate post ideas",
    prompt: "Generate 5 creative post ideas for a tech startup that just launched a new AI product.",
  },
  {
    icon: Calendar,
    label: "Create campaign plan",
    prompt: "Create a 2-week social media campaign plan for promoting a product launch.",
  },
  {
    icon: TrendingUp,
    label: "Trending topics",
    prompt: "What are the current trending topics in social media marketing that I should create content about?",
  },
  {
    icon: ImageIcon,
    label: "Image prompts",
    prompt: "Generate 3 creative image prompts for social media posts about productivity and remote work.",
  },
  {
    icon: Hash,
    label: "Hashtag strategy",
    prompt: "Create a hashtag strategy for a B2B SaaS company targeting marketing professionals.",
  },
  {
    icon: Megaphone,
    label: "Engagement tips",
    prompt: "Give me 5 tips to increase engagement on my LinkedIn posts.",
  },
]

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.label}
          variant="outline"
          className="h-auto flex-col items-start gap-1 p-3 bg-secondary/50 hover:bg-secondary"
          onClick={() => onSelect(suggestion.prompt)}
        >
          <suggestion.icon className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">{suggestion.label}</span>
        </Button>
      ))}
    </div>
  )
}
