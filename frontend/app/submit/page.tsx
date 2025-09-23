"use client"

import { useState } from "react"
import { MainNav } from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { LocationInput } from "@/components/submit/location-input"
import { WeatherForm } from "@/components/submit/weather-form"
import { SubmissionSummary } from "@/components/submit/submission-summary"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

interface WeatherData {
  temperature: number
  humidity: number
  weather: string
  notes: string
  photo?: File
}

export default function SubmitReportPage() {
  const [step, setStep] = useState(1)
  const [location, setLocation] = useState("Miami, Florida, USA")
  const [coordinates, setCoordinates] = useState({ lat: 25.7617, lng: -80.1918 })
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 25,
    humidity: 65,
    weather: "sunny",
    notes: "",
  })

  const handleLocationChange = (newLocation: string, newCoordinates: { lat: number; lng: number }) => {
    setLocation(newLocation)
    setCoordinates(newCoordinates)
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = () => {
    // Handle report submission
    console.log("Submitting report:", {
      location,
      coordinates,
      ...weatherData,
    })
    // Redirect to dashboard or success page
  }

  const handleEdit = () => {
    setStep(2)
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            {step > 1 && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeftIcon className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">Submit Weather Report</h1>
              <p className="text-muted-foreground">Share weather data from your location and earn CLT rewards</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${stepNumber < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-6">
              <LocationInput location={location} coordinates={coordinates} onLocationChange={handleLocationChange} />
              <Button onClick={handleNext} className="w-full">
                Next: Weather Data
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <WeatherForm data={weatherData} onDataChange={setWeatherData} />
              <Button onClick={handleNext} className="w-full">
                Next: Review & Submit
              </Button>
            </div>
          )}

          {step === 3 && (
            <SubmissionSummary
              location={location}
              coordinates={coordinates}
              temperature={weatherData.temperature}
              humidity={weatherData.humidity}
              weather={weatherData.weather}
              notes={weatherData.notes}
              photo={weatherData.photo}
              onSubmit={handleSubmit}
              onEdit={handleEdit}
            />
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
