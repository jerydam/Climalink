"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { BackButton } from "@/components/ui/back-button"
import { ReportFilters } from "@/components/validation/report-filters"
import { ReportCard } from "@/components/validation/report-card"
import { ValidationModal } from "@/components/validation/validation-modal"
import { ValidationHistory } from "@/components/validation/validation-history"
import { TransactionModal } from "@/components/blockchain/transaction-modal"
import { useRole } from "@/lib/roles"
import { useWeb3 } from "@/lib/web3"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus, ShieldCheck, Users } from "lucide-react"
import { ethers } from "ethers"

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
  coordinates?: { lat: number; lng: number }
  status: number // 0 = Pending, 1 = Valid, 2 = Invalid
  validationCount: number
}

interface ValidationRecord {
  reportId: string
  location: string
  decision: "valid" | "invalid"
  date: string
}

const weatherIcons: Record<string, string> = {
  sunny: "☀️",
  cloudy: "☁️",
  rainy: "🌧️",
  stormy: "⛈️",
  snowy: "❄️",
  foggy: "🌫️",
  windy: "💨",
}

function AccessDenied() {
  const { joinAsValidator, joinDAO, stakeBDAG } = useRole()

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
              <h1 className="text-2xl font-bold mb-4">Validator Access Required</h1>
              <p className="text-muted-foreground mb-6">
                Report validation is restricted to registered validators and DAO members. Please join to access validation features.
              </p>
              
              <div className="grid gap-4">
                <Button 
                  onClick={joinAsValidator}
                  className="bg-climate-green hover:bg-climate-green/90"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Join as Validator
                </Button>
                
                <Button 
                  onClick={() => {
                    stakeBDAG().then(() => joinDAO())
                  }}
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Stake BDAG & Join DAO
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
            <p className="text-muted-foreground">Loading validation dashboard...</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ValidatePage() {
  const [locationFilter, setLocationFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("24h")
  const [weatherFilter, setWeatherFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [pendingValidation, setPendingValidation] = useState<{reportId: string, isValid: boolean, notes: string} | null>(null)
  
  const [reports, setReports] = useState<Report[]>([])
  const [validationHistory, setValidationHistory] = useState<ValidationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accuracyRate, setAccuracyRate] = useState(0)
  const [totalRewards, setTotalRewards] = useState(0)

  const { isConnected, getContract, account, provider, isCorrectNetwork } = useWeb3()
  const { userRole, isLoading: roleLoading, isMember } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  useEffect(() => {
    const fetchReports = async () => {
      if (!isConnected || !account || !provider || !isCorrectNetwork) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const climateContract = getContract("CLIMATE")
        
        if (!climateContract) {
          console.error("Climate contract not available")
          setIsLoading(false)
          return
        }

        // Get total report count
        const reportCount = await climateContract.reportCount()
        const reports: Report[] = []

        // Fetch recent reports (last 50 or so)
        const maxReports = Math.min(Number(reportCount), 50)
        
        for (let i = Math.max(0, Number(reportCount) - maxReports); i < Number(reportCount); i++) {
          try {
            // Use correct function name from ABI
            const reportData = await climateContract.getReport(i)
            
            // Only show pending reports for validation
            if (reportData.status === 0) { // 0 = Pending
              const weatherIcon = weatherIcons[reportData.data.weather.toLowerCase()] || "🌤️"
              const timeAgo = calculateTimeAgo(Number(reportData.timestamp) * 1000)

              reports.push({
                id: i.toString(),
                location: reportData.data.location,
                weather: reportData.data.weather,
                temperature: Number(reportData.data.temperature) / 100, // Convert from int128 format
                humidity: Number(reportData.data.humidity),
                timeAgo,
                reporter: formatAddress(reportData.reporter),
                weatherIcon,
                submittedAt: new Date(Number(reportData.timestamp) * 1000).toLocaleString(),
                coordinates: {
                  lat: Number(reportData.data.latitude) / 1000000,
                  lng: Number(reportData.data.longitude) / 1000000,
                },
                status: reportData.status,
                validationCount: Number(reportData.validVotes) + Number(reportData.invalidVotes),
              })
            }
          } catch (error) {
            console.error(`Error fetching report ${i}:`, error)
            continue
          }
        }

        // Sort by most recent first
        reports.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
        setReports(reports)

        // Fetch validation history for current user
        await fetchValidationHistory()
      } catch (error) {
        console.error("Error fetching reports:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [isConnected, account, provider, getContract, isCorrectNetwork])

  const fetchValidationHistory = async () => {
    if (!isConnected || !account || !provider || !isCorrectNetwork) return

    try {
      const climateContract = getContract("CLIMATE")
      
      if (!climateContract) {
        console.error("Climate contract not available")
        return
      }

      const currentBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - 10000)

      // Fetch validation events for this user using the correct event name from ABI
      const voteEvents = await climateContract.queryFilter(
        climateContract.filters.ReportVoteCast(null, account),
        fromBlock,
        currentBlock
      )

      const history: ValidationRecord[] = []
      
      // Process vote events
      for (const event of voteEvents) {
        const block = await event.getBlock()
        const reportId = event.args?.[0]?.toString() || ""
        const voteChoice = event.args?.[2] || 0 // 0 = Invalid, 1 = Valid
        
        try {
          const reportData = await climateContract.getReport(reportId)
          history.push({
            reportId,
            location: reportData.data.location,
            decision: voteChoice === 1 ? "valid" : "invalid",
            date: new Date(Number(block.timestamp) * 1000).toLocaleDateString()
          })
        } catch (error) {
          console.error("Error fetching report data for history:", error)
        }
      }

      // Sort by most recent first
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setValidationHistory(history.slice(0, 10)) // Keep last 10 validations

      // Calculate accuracy rate (simplified)
      const totalValidations = history.length
      const validValidations = history.filter(h => h.decision === "valid").length
      const accuracy = totalValidations > 0 ? (validValidations / totalValidations) * 100 : 0
      setAccuracyRate(accuracy)

      // Calculate total rewards (simplified - in reality this would come from token events)
      setTotalRewards(totalValidations * 10) // 10 CLT per validation
    } catch (error) {
      console.error("Error fetching validation history:", error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const calculateTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const handleValidate = async (reportId: string, isValid: boolean, notes: string) => {
    setPendingValidation({ reportId, isValid, notes })
    setIsTransactionModalOpen(true)
    setIsModalOpen(false)
  }

  const handleConfirmValidation = async (): Promise<string> => {
    if (!pendingValidation) {
      throw new Error("No pending validation")
    }

    if (!isConnected || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    const climateContract = getContract("CLIMATE")
    if (!climateContract) {
      throw new Error("Climate contract not available")
    }

    try {
      // Use correct function name and enum values from ABI
      // VoteChoice enum: 0 = Invalid, 1 = Valid
      const voteChoice = pendingValidation.isValid ? 1 : 0
      
      const tx = await climateContract.vote(
        pendingValidation.reportId,
        voteChoice
      )

      // Remove the validated report from the list
      setReports(prev => prev.filter(r => r.id !== pendingValidation.reportId))
      
      // Refresh validation history
      setTimeout(() => {
        fetchValidationHistory()
      }, 2000)

      return tx.hash
    } catch (error) {
      console.error("Error validating report:", error)
      throw error
    }
  }

  const filteredReports = reports.filter((report) => {
    if (locationFilter !== "all" && !report.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false
    }
    if (weatherFilter !== "all" && report.weather.toLowerCase() !== weatherFilter.toLowerCase()) {
      return false
    }
    return true
  })

  if (roleLoading || isLoading) {
    return <LoadingPage />
  }

  if (!isMember || (userRole !== "validator" && userRole !== "dao_member")) {
    return <AccessDenied />
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="space-y-8">
          <BackButton href="/dashboard">Back to Dashboard</BackButton>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Validate Reports</h1>
            <p className="text-muted-foreground">
              Review and validate weather reports from the community to ensure data accuracy
            </p>
          </div>

          {/* Network Warning */}
          {!isCorrectNetwork && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-800 font-medium">⚠️ Please connect to the BlockDAG network to validate reports</p>
              </CardContent>
            </Card>
          )}

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
            {filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <ReportCard key={report.id} report={report} onViewDetails={handleViewDetails} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No reports available for validation at this time.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back later or adjust your filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Validation History */}
          <ValidationHistory 
            validations={validationHistory} 
            accuracyRate={Math.round(accuracyRate)} 
            totalRewards={totalRewards} 
          />
        </div>
      </main>

      <MobileNav />

      {/* Validation Modal */}
      <ValidationModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onValidate={handleValidate}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title={`${pendingValidation?.isValid ? 'Validate' : 'Reject'} Report`}
        description={`This will ${pendingValidation?.isValid ? 'validate' : 'reject'} the climate report on the blockchain. You'll earn CLT tokens for this validation.`}
        onConfirm={handleConfirmValidation}
      />
    </div>
  )
}