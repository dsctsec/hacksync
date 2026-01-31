"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import OnboardingStep1 from "@/components/onboarding/step-1-welcome"
import OnboardingStep2 from "@/components/onboarding/step-2-brand"
import OnboardingStep3 from "@/components/onboarding/step-3-audience"
import OnboardingStep4 from "@/components/onboarding/step-4-platforms"
import OnboardingStep5 from "@/components/onboarding/step-5-summary"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    selectedGoals: [],
    brandName: "",
    brandDescription: "",
    industry: "",
    country: "",
    audienceType: "",
    ageRange: [],
    geography: [],
    tone: "",
    connectedPlatforms: [],
  })

  useEffect(() => {
    // Check if we have saved onboarding state (returning from OAuth)
    const savedData = localStorage.getItem("onboarding_formData")
    const savedStep = localStorage.getItem("onboarding_currentStep")
    
    if (savedData && savedStep) {
      try {
        setFormData(JSON.parse(savedData))
        setCurrentStep(parseInt(savedStep))
        
        // Clear them so we don't restore again on future visits
        localStorage.removeItem("onboarding_formData")
        localStorage.removeItem("onboarding_currentStep")
      } catch (e) {
        console.error("Failed to restore onboarding state", e)
      }
    }
  }, [])

  const handleContinue = (stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding and redirect to dashboard
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [OnboardingStep1, OnboardingStep2, OnboardingStep3, OnboardingStep4, OnboardingStep5]

  const CurrentStep = steps[currentStep - 1]

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 mx-1 rounded-full transition-colors ${
                  step <= currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Step {currentStep} of 5</p>
        </div>

        {/* Current Step Content */}
        {CurrentStep && (
          <CurrentStep
            formData={formData}
            onContinue={handleContinue}
            onBack={currentStep > 1 ? handleBack : undefined}
          />
        )}
      </div>
    </div>
  )
}
