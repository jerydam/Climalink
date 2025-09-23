"use client"

import { useState } from "react"
import { RoleGuard } from "@/components/auth/role-guard"
import { BackButton } from "@/components/ui/back-button"
import { ReportFilters } from "@/components/validation/report-filters"
import { ReportCard } from "@/components/validation/report-card"
import { ValidationModal } from "@/components/validation/validation-modal"
import { ValidationHistory } from "@/components/validation/validation-history"

interface Report {
  id: string
  location: string
  weather: string
  temperature: number
  humidity: number
  timeAgo: string
  reporter: string
  weatherIcon: string
  submittedAt?: string
}

// Mock data
const mockReports: Report[] = [
  {
    id: "1234",
    location: "Miami, FL",
    weather: "Sunny",
    temperature: 25,
    humidity: 65,
    timeAgo: "2h ago",
    reporter: "0x123...abc",
    weatherIcon: "☀️",
    submittedAt: "March 15, 2024, 2:30 PM",
  },
  {
    id: "1235",
    location: "NYC, NY",
    weather: "Rainy",
    temperature: 12,
    humidity: 85,
    timeAgo: "4h ago",
    reporter: "0x456...def",
    weatherIcon: "🌧️",
    submittedAt: "March 15, 2024, 12:30 PM",
  },
  {
    id: "1236",
    location: "LA, CA",
    weather: "Cloudy",
    temperature: 18,
    humidity: 70,
    timeAgo: "6h ago",
    reporter: "0x789...ghi",
    weatherIcon: "☁️",
    submittedAt: "March 15, 2024, 10:30 AM",
  },
]

const mockValidationHistory = [
  { reportId: "1234", location: "Miami, FL", decision: "valid" as const, date: "Mar 15" },
  { reportId: "1233", location: "NYC, NY", decision: "valid" as const, date: "Mar 14" },
  { reportId: "1232", location: "LA, CA", decision: "invalid" as const, date: "Mar 14" },
]

export default function ValidatePage() {
  const [locationFilter, setLocationFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("24h")
  const [weatherFilter, setWeatherFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const handleValidate = async (reportId: string, isValid: boolean, notes: string) => {
    console.log("Validating report:", { reportId, isValid, notes })
    // Handle validation logic here
  }

  const filteredReports = mockReports.filter((report) => {
    if (locationFilter !== "all" && !report.location.toLowerCase().includes(locationFilter)) {
      return false
    }
    if (weatherFilter !== "all" && report.weather.toLowerCase() !== weatherFilter) {
      return false
    }
    return true
  })

  return (
    <RoleGuard requiredRole="dao">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          <div className="space-y-8">
            <BackButton href="/dashboard">Back to Dashboard</BackButton>

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Validate Reports</h1>
              <p className="text-muted-foreground">
                Review and validate weather reports from the community to ensure data accuracy
              </p>
            </div>

            {/* Filters */}
            <ReportFilters
              location={locationFilter}
              timeFilter={timeFilter}
              weatherFilter={weatherFilter}
              onLocationChange={setLocationFilter}
              onTimeFilterChange={setTimeFilter}
              onWeatherFilterChange={setWeatherFilter}
            />

            {/* Reports Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Available Reports ({filteredReports.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <ReportCard key={report.id} report={report} onViewDetails={handleViewDetails} />
                ))}
              </div>
            </div>

            {/* Validation History */}
            <ValidationHistory validations={mockValidationHistory} accuracyRate={92} totalRewards={0} />
          </div>
        </div>

        {/* Validation Modal */}
        <ValidationModal
          report={selectedReport}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onValidate={handleValidate}
        />
      </div>
    </RoleGuard>
  )
}
