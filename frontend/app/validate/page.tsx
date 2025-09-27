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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, ShieldCheck, Users, AlertCircle, Coins } from "lucide-react"
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

function ValidatorUpgrade() {
  const { stakeBDAG, joinAsValidator, debugInfo } = useRole()
  const [showStakeModal, setShowStakeModal] = useState(false)

  const handleStakeAndUpgrade = async (): Promise<string> => {
    // First stake BDAG, then join as validator
    await stakeBDAG()
    
    // Small delay to ensure staking is processed
    setTimeout(async () => {
      await joinAsValidator()
      window.location.reload() // Refresh to update role
    }, 2000)
    
    return "Staking completed - upgrading to validator..."
  }

  return (
    <>
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-amber-800 mb-2">Upgrade to Validator</h2>
            <p className="text-amber-700 mb-4">
              Stake 100 BDAG tokens to become a validator and access report validation features.
            </p>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-amber-800 mb-2">Validator Benefits:</h3>
              <ul className="text-sm text-amber-700 space-y-1 text-left">
                <li>• Validate community reports and earn rewards</li>
                <li>• Get 1000 CLT tokens as staking bonus</li>
                <li>• Share reward pools for correct validations</li>
                <li>• Eligible for DAO membership</li>
                <li>• Help maintain data quality</li>
              </ul>
            </div>

            <div className="text-sm text-amber-600 mb-4">
              <p><strong>Current CLT Balance:</strong> {parseFloat(debugInfo.cltBalance).toFixed(2)} CLT</p>
              <p><strong>Staked BDAG:</strong> {parseFloat(debugInfo.stakedAmount).toFixed(2)} BDAG</p>
            </div>
            
            <Button 
              onClick={() => setShowStakeModal(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              <Coins className="h-4 w-4 mr-2" />
              Stake 100 BDAG & Become Validator
            </Button>
          </div>
        </CardContent>
      </Card>

      <TransactionModal
        isOpen={showStakeModal}
        onClose={() => setShowStakeModal(false)}
        title="Stake BDAG & Become Validator"
        description="This will stake 100 BDAG tokens and upgrade you to validator status. You'll receive 1000 CLT tokens as a bonus and gain access to validation features."
        onConfirm={handleStakeAndUpgrade}
      />
    </>
  )
}

function AccessDenied() {
  const { joinAsValidator, joinDAO, stakeBDAG, debugInfo } = useRole()

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <BackButton href="/dashboard">Back to Dashboard</BackButton>
          
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-climate-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Validator Access Required</h1>
              <p className="text-muted-foreground mb-6">
                Report validation requires validator or DAO member status. Choose an option below to gain access.
              </p>

              {/* Show current status */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">BDAG Staked</p>
                    <p className="font-bold">{parseFloat(debugInfo.stakedAmount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CLT Balance</p>
                    <p className="font-bold">{parseFloat(debugInfo.cltBalance).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4">
                <Button 
                  onClick={joinAsValidator}
                  className="bg-climate-green hover:bg-climate-green/90"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Stake & Become Validator
                </Button>
                
                <Button 
                  onClick={() => {
                    stakeBDAG().then(() => joinDAO())
                  }}
                  variant="outline"
                  disabled={parseFloat(debugInfo.cltBalance) < parseFloat(debugInfo.membershipFee)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join DAO (Requires {debugInfo.membershipFee} CLT)
                </Button>
              </div>

              {parseFloat(debugInfo.cltBalance) < parseFloat(debugInfo.membershipFee) && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-left">
                    You need {debugInfo.membershipFee} CLT tokens to join the DAO. 
                    Earn CLT by submitting weather reports (20 CLT each) or become a validator first.
                  </AlertDescription>
                </Alert>
              )}
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
  const { userRole, isLoading: roleLoading, isMember, debugInfo } = useRole()
  const router = useRouter()

  // Check if user can validate - more permissive access control
  const canValidate = () => {
    // Allow DAO members and validators
    if (userRole === "dao_member" || userRole === "validator") {
      return true
    }
    
    // Allow users who have staked BDAG (even if role isn't updated yet)
    if (debugInfo.hasStaked) {
      return true
    }
    
    return false
  }

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
            const reportData = await climateContract.getReport(i)
            
            // Only show pending reports for validation
            if (reportData.status === 0) { // 0 = Pending
              const weatherIcon = weatherIcons[reportData.data.weather.toLowerCase()] || "🌤️"
              const timeAgo = calculateTimeAgo(Number(reportData.timestamp) * 1000)

              reports.push({
                id: i.toString(),
                location: reportData.data.location,
                weather: reportData.data.weather,
                temperature: Number(reportData.data.temperature) / 100,
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

    if (canValidate()) {
      fetchReports()
    } else {
      setIsLoading(false)
    }
  }, [isConnected, account, provider, getContract, isCorrectNetwork, userRole, debugInfo.hasStaked])

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

      const voteEvents = await climateContract.queryFilter(
        climateContract.filters.ReportVoteCast(null, account),
        fromBlock,
        currentBlock
      )

      const history: ValidationRecord[] = []
      
      for (const event of voteEvents) {
        const block = await event.getBlock()
        const reportId = event.args?.[0]?.toString() || ""
        const voteChoice = event.args?.[2] || 0
        
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

      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setValidationHistory(history.slice(0, 10))

      const totalValidations = history.length
      const validValidations = history.filter(h => h.decision === "valid").length
      const accuracy = totalValidations > 0 ? (validValidations / totalValidations) * 100 : 0
      setAccuracyRate(accuracy)
      setTotalRewards(totalValidations * 10)
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
      const voteChoice = pendingValidation.isValid ? 1 : 0
      
      const tx = await climateContract.vote(
        pendingValidation.reportId,
        voteChoice
      )

      setReports(prev => prev.filter(r => r.id !== pendingValidation.reportId))
      
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

  // Show access denied if user can't validate
  if (!canValidate()) {
    return <AccessDenied />
  }

  // Show upgrade prompt for reporters who haven't staked
  if (userRole === "reporter" && !debugInfo.hasStaked) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          <div className="space-y-8 max-w-2xl mx-auto">
            <BackButton href="/dashboard">Back to Dashboard</BackButton>
            <ValidatorUpgrade />
          </div>
        </main>
        <MobileNav />
      </div>
    )
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
            {debugInfo.hasStaked && userRole === "reporter" && (
              <Alert className="mt-4 border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  You have access to validation because you've staked BDAG tokens. Your role will update to "validator" shortly.
                </AlertDescription>
              </Alert>
            )}
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

      {/* Modals */}
      <ValidationModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onValidate={handleValidate}
      />

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