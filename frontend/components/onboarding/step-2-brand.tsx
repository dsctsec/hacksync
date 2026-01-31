"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

const industries = [
  "Coffee & Beverages",
  "Technology",
  "E-commerce",
  "SaaS",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Fashion",
  "Food & Beverage",
  "Entertainment",
  "Other",
]

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "India",
  "Brazil",
  "Other",
]

export default function OnboardingStep2({ formData, onContinue, onBack }: any) {
  const [brandName, setBrandName] = useState(formData.brandName || "")
  const [description, setDescription] = useState(formData.brandDescription || "")
  const [industry, setIndustry] = useState(formData.industry || "")
  const [country, setCountry] = useState(formData.country || "")

  const handleContinue = () => {
    onContinue({
      brandName,
      brandDescription: description,
      industry,
      country,
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-balance">Tell us about your brand</h1>
        <p className="text-lg text-muted-foreground">
          You can paste a website, pitch, or short description — our AI will understand it.
        </p>
      </div>

      <Card className="p-8 border border-border space-y-6">
        <div className="space-y-3">
          <Label htmlFor="brand-name" className="text-base font-semibold">
            Brand/Company Name
          </Label>
          <Input
            id="brand-name"
            placeholder="e.g., Etarra Coffee"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="text-base h-12"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-base font-semibold">
            Brand Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe your brand in 1-2 lines..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-base min-h-24"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="industry" className="text-base font-semibold">
              Industry / Category
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger id="industry" className="h-12">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="country" className="text-base font-semibold">
              Primary Country / Market
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country" className="h-12">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
