"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { ClimateMap } from "@/components/dashboard/climate-map"
import { useRole } from "@/lib/roles"
import { useWeb3 } from "@/lib/web3"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionModal } from "@/components/blockchain/transaction-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, ShieldCheck, Users, FileText, Coins, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"

function WelcomeNewUser() {
  const { smartJoinSystem, joinAsValidator, debugInfo } = useRole()
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const handleJoinAsReporter = async (): Promise<string> => {
    const tx = await smartJoinSystem()
    return tx || "Joined as reporter successfully"
  }

  const handleStakeAndJoinValidator = async (): Promise<string> => {
    const tx = await joinAsValidator()
    return tx || "Staked and joined as validator successfully"
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Welcome to ClimaLink</h1>
              <p className="text-lg text-muted-foreground mb-2">
                Join the global climate reporting community and start earning rewards
              </p>
              <p className="text-muted-foreground">
                Choose your role - both can earn CLT tokens in different ways
              </p>
            </div>

            {/* Show current wallet status */}
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Reporter Option */}
              <Card className="border-green-300 bg-gradient-to-r from-green-600/10 to-emerald-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Reporter</h2>
                    <p className="text-lg font-bold text-green-600 mb-4">FREE TO JOIN</p>
                    
                    <div className="space-y-3 mb-6 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Submit weather reports from anywhere</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Earn 20 CLT per validated report</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Contribute to global climate data</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">View community climate map</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setActiveModal("join-reporter")}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join as Reporter (Free)
                    </Button>
                    
                    <p className="text-xs text-gray-500 mt-3">
                      No staking required • Earn from your reports
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Validator Option */}
              <Card className="border-purple-300 bg-purple-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Validator</h2>
                    <p className="text-lg font-bold text-purple-600 mb-4">REQUIRES STAKING</p>
                    
                    <div className="space-y-3 mb-6 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">Validate community reports</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Share rewards for correct validation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium">Get 1000 CLT staking bonus</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">DAO governance participation</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setActiveModal("stake-join-validator")}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Stake & Join as Validator
                    </Button>
                    
                    <p className="text-xs text-muted-foreground mt-3">
                      Requires: 100 BDAG tokens • 60-day lock
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Smart Recommendation */}
            {debugInfo.hasStaked && (
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Smart Recommendation:</strong> You have staked BDAG tokens! 
                  We recommend joining as a validator to access validation features and earn additional rewards.
                </AlertDescription>
              </Alert>
            )}

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-3">What happens next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
                  <div>
                    <h4 className="font-semibold mb-2">As a Reporter:</h4>
                    <ul className="space-y-1">
                      <li>• Submit weather reports instantly</li>
                      <li>• Earn 20 CLT per validated report</li>
                      <li>• Access your earnings dashboard</li>
                      <li>• Upgrade to validator anytime</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">As a Validator:</h4>
                    <ul className="space-y-1">
                      <li>• Validate reports and earn rewards</li>
                      <li>• Get 1000 CLT staking bonus immediately</li>
                      <li>• Share reward pools for accuracy</li>
                      <li>• Eligible for DAO membership</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Transaction Modals */}
      <TransactionModal
        isOpen={activeModal === "join-reporter"}
        onClose={() => setActiveModal(null)}
        title="Join as Reporter"
        description="Join ClimaLink as a Reporter completely free! Submit weather reports from any location and earn 20 CLT tokens when your reports are validated by the community. No staking required."
        onConfirm={handleJoinAsReporter}
      />

      <TransactionModal
        isOpen={activeModal === "stake-join-validator"}
        onClose={() => setActiveModal(null)}
        title="Stake BDAG & Join as Validator"
        description="Stake 100 BDAG tokens to become a Validator. You'll receive 1000 CLT tokens immediately as a bonus, then earn rewards by correctly validating community reports. Validators who vote correctly share additional reward pools. Tokens are locked for 60 days."
        onConfirm={handleStakeAndJoinValidator}
      />
    </>
  )
}

function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking your membership status...</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  const { isConnected } = useWeb3()
  const { isMember, isLoading, userRole, debugInfo } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  if (isLoading) {
    return <LoadingDashboard />
  }

  if (!isMember && !debugInfo.hasStaked) {
    return <WelcomeNewUser />
  }

  const getRoleDisplayName = () => {
    switch (userRole) {
      case "dao_member":
        return "DAO Member & Validator"
      case "validator":
        return "Validator"
      case "reporter":
        return "Reporter"
      default:
        return "Member"
    }
  }

  // Handle edge case where user has staked but role isn't updated yet
  const getEffectiveRole = () => {
    if (userRole === "dao_member") return "dao_member"
    if (userRole === "validator") return "validator"
    if (userRole === "reporter" && debugInfo.hasStaked) return "pending_validator"
    if (userRole === "reporter") return "reporter"
    if (debugInfo.hasStaked) return "pending_validator"
    return userRole
  }

  const effectiveRole = getEffectiveRole()

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {getRoleDisplayName()}!
              {effectiveRole === "pending_validator" && " (Validator Access Pending)"}
            </h1>
            <p className="text-muted-foreground">
              Here's your ClimaLink activity overview. 
              {userRole === "reporter" && " You're earning 20 CLT per validated report!"}
              {userRole === "validator" && " You're earning from validation accuracy and sharing reward pools!"}
              {effectiveRole === "pending_validator" && " Your validator access is being processed..."}
            </p>
          </div>

          {/* Role Status Alerts */}
          {effectiveRole === "pending_validator" && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Validator Access Detected:</strong> You have staked BDAG tokens and can access validation features. 
                Your role will update to "Validator" shortly. You can start validating reports now!
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2 text-blue-800 underline"
                  onClick={() => router.push("/validate")}
                >
                  Go to Validation
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <StatsCards />

          {/* Role-specific Information Cards */}
          {userRole === "reporter" && !debugInfo.hasStaked && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1">Want to Earn More?</h3>
                    <p className="text-sm text-blue-700 mb-2">
                      Become a Validator to earn from validating reports plus get 1000 CLT staking bonus!
                    </p>
                    <p className="text-xs text-blue-600">
                      Winning validators share reward pools for correct votes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push("/portfolio")}
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Become Validator
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(userRole === "validator" || effectiveRole === "pending_validator") && userRole !== "dao_member" && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-1">Join the DAO</h3>
                    <p className="text-sm text-amber-700 mb-2">
                      Unlock governance participation and create proposals! Requires {debugInfo.membershipFee} CLT membership fee.
                    </p>
                    <p className="text-xs text-amber-600">
                      Current CLT balance: {parseFloat(debugInfo.cltBalance).toFixed(2)} CLT
                    </p>
                  </div>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={() => router.push("/dao")}
                    disabled={parseFloat(debugInfo.cltBalance) < parseFloat(debugInfo.membershipFee)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {parseFloat(debugInfo.cltBalance) >= parseFloat(debugInfo.membershipFee) ? "Join DAO" : "Need More CLT"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Access for Stakers */}
          {debugInfo.hasStaked && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">Validator Features Available</h3>
                    <p className="text-sm text-green-700 mb-2">
                      You have staked BDAG tokens and can access validation features to earn additional rewards.
                    </p>
                  </div>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => router.push("/validate")}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Start Validating
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <QuickActions />
              <ClimateMap />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}