"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { TokenBalances } from "@/components/portfolio/token-balances"
import { StakingDashboard } from "@/components/portfolio/staking-dashboard"
import { TransactionHistory } from "@/components/portfolio/transaction-history"
import { EarningsAnalytics } from "@/components/portfolio/earnings-analytics"
import { TransactionModal } from "@/components/blockchain/transaction-modal"
import { useRole } from "@/lib/roles"
import { useWeb3 } from "@/lib/web3"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, ShieldCheck, Users, Wallet, Lock, Plus, CheckCircle, AlertTriangle, TrendingUp, Coins, Shield } from "lucide-react"
import { ethers } from "ethers"

// Quick Stake Actions Component
function QuickStakeActions() {
  const [stakingInfo, setStakingInfo] = useState({
    minimumStake: "0",
    availableBalance: "0",
    currentStake: "0",
    hasApproval: false,
    allowance: "0",
    isStakeActive: false,
    autoMintAmount: "0"
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { account, isConnected, getContract, provider, isCorrectNetwork } = useWeb3()

  useEffect(() => {
    const fetchQuickStakeData = async () => {
      if (!isConnected || !account || !provider || !isCorrectNetwork) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const tokenContract = getContract("TOKEN")
        
        if (!tokenContract) {
          setIsLoading(false)
          return
        }

        const [
          minimumStake,
          userBalance,
          allowance,
          stakedAmount,
          autoMintAmount
        ] = await Promise.all([
          tokenContract.BDAG_STAKE_AMOUNT(),
          tokenContract.balanceOf(account),
          tokenContract.allowance(account, await tokenContract.getAddress()),
          tokenContract.getStakedAmount(account),
          tokenContract.MINT_AMOUNT()
        ])

        const minimumStakeFormatted = ethers.formatEther(minimumStake)
        const allowanceFormatted = ethers.formatEther(allowance)
        const hasApproval = parseFloat(allowanceFormatted) >= parseFloat(minimumStakeFormatted)

        setStakingInfo({
          minimumStake: minimumStakeFormatted,
          availableBalance: ethers.formatEther(userBalance),
          currentStake: ethers.formatEther(stakedAmount),
          hasApproval,
          allowance: allowanceFormatted,
          isStakeActive: parseFloat(ethers.formatEther(stakedAmount)) > 0,
          autoMintAmount: ethers.formatEther(autoMintAmount)
        })
      } catch (error) {
        console.error("Error fetching quick stake data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuickStakeData()
  }, [account, isConnected, getContract, provider, isCorrectNetwork])

  const canStake = () => {
    return parseFloat(stakingInfo.availableBalance) >= parseFloat(stakingInfo.minimumStake)
  }

  const handleApproval = async (): Promise<string> => {
    if (!isConnected || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    const tokenContract = getContract("TOKEN")
    
    if (!tokenContract) {
      throw new Error("Token contract not available")
    }

    const stakingAddress = await tokenContract.getAddress()
    const amountToApprove = ethers.parseEther(stakingInfo.minimumStake)

    setIsProcessing(true)
    try {
      const tx = await tokenContract.approve(stakingAddress, amountToApprove)
      await tx.wait()
      
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
      return tx.hash
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStake = async (): Promise<string> => {
    if (!isConnected || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    const tokenContract = getContract("TOKEN")
    if (!tokenContract) {
      throw new Error("Token contract not available")
    }

    setIsProcessing(true)
    try {
      const tx = await tokenContract.stakeBDAG()
      
      setTimeout(() => {
        window.location.reload()
      }, 3000)
      
      return tx.hash
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading staking options...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-sky-600" />
              <span className="text-sky-900">Stake BDAG Tokens</span>
            </div>
            {stakingInfo.isStakeActive && (
              <Badge className="bg-climate-green/10 text-climate-green border-climate-green">
                Currently Staked
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-xl font-bold text-sky-900">{stakingInfo.availableBalance} BDAG</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Minimum Stake</p>
              <p className="text-xl font-bold text-sky-900">{stakingInfo.minimumStake} BDAG</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Instant Reward</p>
              <p className="text-xl font-bold text-climate-green">{stakingInfo.autoMintAmount} CLT</p>
            </div>
          </div>

          {/* Approval Status */}
          {!stakingInfo.hasApproval && canStake() && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Approval Required:</strong> You need to approve the contract to spend your BDAG tokens before staking.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {!stakingInfo.hasApproval && canStake() ? (
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                size="lg"
                onClick={() => setShowApprovalModal(true)}
                disabled={isProcessing || !isCorrectNetwork}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Approval...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve {stakingInfo.minimumStake} BDAG
                  </>
                )}
              </Button>
            ) : stakingInfo.hasApproval && canStake() ? (
              <Button 
                className="w-full bg-sky-600 hover:bg-sky-700 text-white"
                size="lg"
                onClick={() => setShowStakeModal(true)}
                disabled={isProcessing || !isCorrectNetwork}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Stake...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Stake {stakingInfo.minimumStake} BDAG
                  </>
                )}
              </Button>
            ) : !canStake() ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Insufficient BDAG balance. You need {stakingInfo.minimumStake} BDAG to stake.
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-climate-green font-medium">
                  ✓ You're already staking! Check the dashboard below for details.
                </p>
              </div>
            )}
          </div>

          {/* Benefits Preview */}
          <div className="bg-white/70 p-4 rounded-lg border border-sky-200">
            <h4 className="font-medium text-sky-900 mb-2">Staking Benefits</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Coins className="h-3 w-3 text-climate-green" />
                <span>Instant CLT rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-blue-500" />
                <span>DAO membership</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-purple-500" />
                <span>Governance voting</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-orange-500" />
                <span>Validator eligibility</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Modals */}
      <TransactionModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Approve BDAG Tokens"
        description={`Approve the staking contract to spend ${stakingInfo.minimumStake} BDAG tokens. This is a one-time approval required before staking.`}
        onConfirm={handleApproval}
      />

      <TransactionModal
        isOpen={showStakeModal}
        onClose={() => setShowStakeModal(false)}
        title="Stake BDAG Tokens"
        description={`Stake ${stakingInfo.minimumStake} BDAG tokens to join ClimaLink and earn ${stakingInfo.autoMintAmount} CLT tokens immediately. Join the DAO and gain access to all platform features!`}
        onConfirm={handleStake}
      />
    </>
  )
}

function AccessDenied() {
  const { joinAsReporter, joinAsValidator, joinDAO, stakeBDAG } = useRole()

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-climate-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Portfolio Access Restricted</h1>
              <p className="text-muted-foreground mb-6">
                Access to portfolio features is restricted to registered members. Please join as a reporter, validator, or DAO member to view your portfolio.
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
              
              <p className="text-sm text-muted-foreground mt-4">
                Note: DAO membership requires staking BDAG tokens first.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function LoadingPortfolio() {
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

export default function PortfolioPage() {
  const { isConnected } = useWeb3()
  const { isMember, isLoading, userRole } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  if (isLoading) {
    return <LoadingPortfolio />
  }

  if (!isMember) {
    return <AccessDenied />
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-climate-green mb-2">
            Portfolio {userRole === "dao_member" && "(DAO Member)"}
          </h1>
          <p className="text-muted-foreground">
            Manage your CLT and BDAG tokens, track earnings, and view transaction history
          </p>
        </div>

        <div className="space-y-8">
          <TokenBalances />
          
          {/* Prominent Stake Button Section */}
          <QuickStakeActions />
          
          <StakingDashboard />
          <EarningsAnalytics />
          <TransactionHistory />
        </div>
      </main>

      <MobileNav />
    </div>
  )
}