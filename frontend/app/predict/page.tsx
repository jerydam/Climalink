"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { useRole } from "@/lib/roles"
import { useWeb3 } from "@/lib/web3"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionModal } from "@/components/blockchain/transaction-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Coins, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Wallet, 
  ArrowRight,
  Crown,
  Zap,
  Target,
  Award
} from "lucide-react"

export default function ValidatorUpgradePage() {
  const router = useRouter()
  const { isConnected } = useWeb3()
  const { userRole, isLoading, debugInfo, upgradeToValidator, joinAsReporter } = useRole()
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const handleUpgradeToValidator = async (): Promise<string> => {
    const tx = await upgradeToValidator()
    return tx || "Successfully upgraded to validator!"
  }

  const handleJoinAsReporter = async (): Promise<string> => {
    const tx = await joinAsReporter()
    return tx || "Successfully joined as reporter!"
  }

  // No restrictions - anyone can upgrade

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Upgrade to Validator</h1>
            <p className="text-xl text-muted-foreground mb-2">
              Unlock advanced features and earn more rewards
            </p>
            <p className="text-muted-foreground">
              Stake BDAG tokens to validate reports and participate in consensus
            </p>
          </div>

          {/* Upgrade Action Card */}
          <Card className="border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 border-2">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Become a Validator</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Stake BDAG tokens and unlock validation features to earn more rewards
                </p>
                
                {isConnected && !isLoading && (
                  <div className="flex gap-6 justify-center text-sm mb-6">
                    <div className="text-center">
                      <p className="text-muted-foreground">BDAG Staked</p>
                      <p className="font-bold text-lg">{parseFloat(debugInfo.stakedAmount).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">CLT Balance</p>
                      <p className="font-bold text-lg">{parseFloat(debugInfo.cltBalance).toFixed(2)}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => setActiveModal("upgrade-validator")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3"
                    size="lg"
                    disabled={!isConnected}
                  >
                    <Coins className="h-5 w-5 mr-2" />
                    {isConnected ? "Upgrade to Validator" : "Connect Wallet First"}
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Requires 100 BDAG tokens • 60-day lock period • Instant 1000 CLT bonus
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Validator Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Validation Rewards */}
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Validation Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Earn CLT tokens for every report you validate correctly. Accurate validators share reward pools.
                  </p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Variable CLT Rewards
                  </Badge>
                </CardContent>
              </Card>

              {/* Staking Bonus */}
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-3">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Instant Bonus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Receive 1000 CLT tokens immediately upon staking your BDAG tokens.
                  </p>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    1000 CLT Bonus
                  </Badge>
                </CardContent>
              </Card>

              {/* DAO Eligibility */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">DAO Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Become eligible to join the DAO for governance participation and proposal creation.
                  </p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Governance Rights
                  </Badge>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Requirements Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Validator Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Coins className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">BDAG Stake</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Stake 100 BDAG tokens to participate in validation
                  </p>
                  <Badge variant="outline">100 BDAG Required</Badge>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Lock Period</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tokens are locked for 60 days to ensure network security
                  </p>
                  <Badge variant="outline">60 Day Lock</Badge>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Membership</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Must be a ClimaLink reporter before upgrading
                  </p>
                  <Badge variant="outline">Reporter Status</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-6">
                  Join the validator network and start earning rewards for securing the ClimaLink ecosystem.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push("/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                  <Button onClick={() => router.push("/validate")}>
                    Go to Validation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      <MobileNav />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={activeModal === "upgrade-validator"}
        onClose={() => setActiveModal(null)}
        title="Upgrade to Validator"
        description="Stake 100 BDAG tokens to become a Validator. You'll receive 1000 CLT tokens immediately as a bonus, then earn rewards by correctly validating community reports. Validators who vote correctly share additional reward pools. Tokens are locked for 60 days."
        onConfirm={handleUpgradeToValidator}
      />
    </div>
  )
}