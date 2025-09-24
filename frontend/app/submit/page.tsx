"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { LocationInput } from "@/components/submit/location-input"
import { WeatherForm } from "@/components/submit/weather-form"
import { SubmissionSummary } from "@/components/submit/submission-summary"
import { TransactionModal } from "@/components/blockchain/transaction-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { useRole } from "@/lib/roles"
import { useWeb3 } from "@/lib/web3"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, UserPlus, ShieldCheck } from "lucide-react"

interface WeatherData {
  temperature: number
  humidity: number
  weather: string
  notes: string
  photo?: File
}

function AccessDenied() {
  const { joinAsReporter, joinAsValidator } = useRole()

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-climate-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Reporter Access Required</h1>
              <p className="text-muted-foreground mb-6">
                You need to be registered as a reporter to submit climate reports. Please join as a reporter or validator to continue.
              </p>
              
              <div className="grid gap-4">
                <Button 
                  onClick={joinAsReporter} 
                  className="bg-climate-green hover:bg-climate-green/90"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join as Reporter
                </Button>
                
                <Button 
                  onClick={joinAsValidator}
                  variant="outline"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Join as Validator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function LoadingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking your access permissions...</p>
          </div>
        </div>
      </main>
    </div>
  )
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)

  const { isConnected, getContract } = useWeb3()
  const { userRole, isLoading, isMember } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

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
    setShowTransactionModal(true)
  }

  const handleConfirmTransaction = async () => {
    setIsSubmitting(true)
    
    try {
      const climateContract = getContract("CLIMATE")
      
      // Prepare report data
      const reportInput = {
        weather: weatherData.weather,
        temperature: Math.round(weatherData.temperature * 100), // Convert to int128 format
        humidity: weatherData.humidity,
        location: location,
        longitude: Math.round(coordinates.lng * 1000000), // Convert to int128 format
        latitude: Math.round(coordinates.lat * 1000000), // Convert to int128 format
      }

      // Submit the climate report
      const tx = await climateContract.createClimateReport(reportInput)
      await tx.wait()

      // Success - redirect to dashboard
      router.push("/dashboard?success=report_submitted")
    } catch (error) {
      console.error("Error submitting report:", error)
      throw error
    } finally {
      setIsSubmitting(false)
      setShowTransactionModal(false)
    }
  }

  const handleEdit = () => {
    setStep(2)
  }

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isMember || (userRole !== "reporter" && userRole !== "validator" && userRole !== "dao_member")) {
    return <AccessDenied />
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

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="Submit Climate Report"
        description="This will submit your weather report to the blockchain and make it available for community validation."
        onConfirm={handleConfirmTransaction}
      />
    </div>
  )
}