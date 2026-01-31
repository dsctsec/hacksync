"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useState } from "react"

const ageRanges = ["13-18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
const geographies = ["North America", "Europe", "Asia", "South America", "Africa", "Oceania", "Global"]
const tones = ["Professional", "Friendly", "Bold", "Playful", "Minimal"]

export default function OnboardingStep3({ formData, onContinue, onBack }: any) {
  const [audienceType, setAudienceType] = useState(formData.audienceType || "")
  const [selectedAges, setSelectedAges] = useState<string[]>(formData.ageRange || [])
  const [selectedGeo, setSelectedGeo] = useState<string[]>(formData.geography || [])
  const [selectedTone, setSelectedTone] = useState(formData.tone || "")

  const toggleAge = (age: string) => {
    setSelectedAges((prev) => (prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age]))
  }

  const toggleGeo = (geo: string) => {
    setSelectedGeo((prev) => (prev.includes(geo) ? prev.filter((g) => g !== geo) : [...prev, geo]))
  }

  const handleContinue = () => {
    onContinue({
      audienceType,
      ageRange: selectedAges,
      geography: selectedGeo,
      tone: selectedTone,
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-balance">Who are you speaking to?</h1>
        <p className="text-lg text-muted-foreground">Tell us about your target audience</p>
      </div>

      <Card className="p-8 border border-border space-y-8">
        {/* Audience Type */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Audience Type</Label>
          <div className="flex gap-4">
            {["B2C", "B2B"].map((type) => (
              <button
                key={type}
                onClick={() => setAudienceType(type)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors border-2 ${
                  audienceType === type
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Age Range</Label>
          <div className="flex flex-wrap gap-3">
            {ageRanges.map((age) => (
              <button
                key={age}
                onClick={() => toggleAge(age)}
                className={`px-4 py-2 rounded-full font-medium transition-all border-2 ${
                  selectedAges.includes(age)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Geography */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Primary Geography</Label>
          <div className="flex flex-wrap gap-3">
            {geographies.map((geo) => (
              <button
                key={geo}
                onClick={() => toggleGeo(geo)}
                className={`px-4 py-2 rounded-full font-medium transition-all border-2 ${
                  selectedGeo.includes(geo)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {geo}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Brand Tone</Label>
          <div className="flex flex-wrap gap-3">
            {tones.map((tone) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={`px-4 py-2 rounded-full font-medium transition-all border-2 ${
                  selectedTone === tone
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
      </Card>

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
