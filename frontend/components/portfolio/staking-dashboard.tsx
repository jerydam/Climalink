"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Lock, Plus, AlertTriangle, Loader2, Clock, Coins, CheckCircle } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { TransactionModal } from "@/components/blockchain/transaction-modal"
import { ethers } from "ethers"

interface StakingData {
  currentStake: string
  stakeDate: string
  unlockDate: string
  unlockTime: number
  availableBalance: string
  stakeLockPeriod: number
  minimumStake: string
  isStakeActive: boolean
  autoMintAmount: string
  isEligibleForMinting: boolean
  allowance: string
  hasApproval: boolean
}

export function StakingDashboard() {
  const [stakingData, setStakingData] = useState<StakingData>({
    currentStake: "0",
    stakeDate: "",
    unlockDate: "",
    unlockTime: 0,
    availableBalance: "0",
    stakeLockPeriod: 0,
    minimumStake: "0",
    isStakeActive: false,
    autoMintAmount: "0",
    isEligibleForMinting: false,
    allowance: "0",
    hasApproval: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showUnstakeModal, setShowUnstakeModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { account, isConnected, getContract, provider, isCorrectNetwork } = useWeb3()

  useEffect(() => {
    const fetchStakingData = async () => {
      if (!isConnected || !account || !provider || !isCorrectNetwork) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const tokenContract = getContract("TOKEN")
        
        if (!tokenContract) {
          console.error("Token contract not available")
          setIsLoading(false)
          return
        }

        // Fetch staking information
        const [
          stakedAmount,
          stakingTimestamp,
          unlockTime,
          lockPeriod,
          minimumStake,
          autoMintAmount,
          isEligibleForMinting,
          userBalance,
          allowance
        ] = await Promise.all([
          tokenContract.getStakedAmount(account),
          tokenContract.stakingTimestamp(account),
          tokenContract.getUnlockTime(account),
          tokenContract.STAKE_LOCK_PERIOD(),
          tokenContract.BDAG_STAKE_AMOUNT(),
          tokenContract.MINT_AMOUNT(),
          tokenContract.isEligibleForMinting(account),
          tokenContract.balanceOf(account),
          // Check allowance - using token contract address as the spender since staking is built into the token contract
          tokenContract.allowance(account, await tokenContract.getAddress())
        ])

        const stakedFormatted = ethers.formatEther(stakedAmount)
        const stakingTime = Number(stakingTimestamp)
        const unlockTimestamp = Number(unlockTime)
        const lockPeriodDays = Number(lockPeriod) / (24 * 60 * 60)
        const minimumStakeFormatted = ethers.formatEther(minimumStake)
        const allowanceFormatted = ethers.formatEther(allowance)

        // Format dates
        const stakeDate = stakingTime > 0 ? new Date(stakingTime * 1000).toLocaleDateString() : ""
        const unlockDate = unlockTimestamp > 0 ? new Date(unlockTimestamp * 1000).toLocaleDateString() : ""

        // Check if user has sufficient approval
        const hasApproval = parseFloat(allowanceFormatted) >= parseFloat(minimumStakeFormatted)

        setStakingData({
          currentStake: parseFloat(stakedFormatted).toFixed(2),
          stakeDate,
          unlockDate,
          unlockTime: unlockTimestamp,
          availableBalance: ethers.formatEther(userBalance),
          stakeLockPeriod: lockPeriodDays,
          minimumStake: minimumStakeFormatted,
          isStakeActive: parseFloat(stakedFormatted) > 0,
          autoMintAmount: ethers.formatEther(autoMintAmount),
          isEligibleForMinting,
          allowance: allowanceFormatted,
          hasApproval,
        })
      } catch (error) {
        console.error("Error fetching staking data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStakingData()
  }, [account, isConnected, getContract, provider, isCorrectNetwork])

  const getUnlockProgress = () => {
    if (!stakingData.isStakeActive || stakingData.unlockTime === 0) return 0
    
    const now = Math.floor(Date.now() / 1000)
    const totalLockTime = stakingData.stakeLockPeriod * 24 * 60 * 60
    const stakeStartTime = stakingData.unlockTime - totalLockTime
    const elapsedTime = now - stakeStartTime
    const progress = (elapsedTime / totalLockTime) * 100
    
    return Math.min(Math.max(progress, 0), 100)
  }

  const getDaysLeft = () => {
    if (!stakingData.isStakeActive || stakingData.unlockTime === 0) return 0
    
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = stakingData.unlockTime - now
    return Math.max(0, Math.ceil(timeLeft / (24 * 60 * 60)))
  }

  const isUnlockTime = () => {
    if (!stakingData.isStakeActive || stakingData.unlockTime === 0) return false
    return Date.now() / 1000 >= stakingData.unlockTime
  }

  const canStakeMore = () => {
    return parseFloat(stakingData.availableBalance) >= parseFloat(stakingData.minimumStake)
  }

  const handleApproval = async (): Promise<string> => {
    if (!isConnected || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    const tokenContract = getContract("TOKEN")
    
    if (!tokenContract) {
      throw new Error("Token contract not available")
    }

    // Since staking is built into the token contract, we approve the token contract itself
    const stakingAddress = await tokenContract.getAddress()
    const amountToApprove = ethers.parseEther(stakingData.minimumStake)

    setIsProcessing(true)
    try {
      const tx = await tokenContract.approve(stakingAddress, amountToApprove)
      
      // Wait for transaction confirmation
      await tx.wait()
      
      // Refresh data after approval
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
      return tx.hash
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStakeBDAG = async (): Promise<string> => {
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
      
      // Refresh data after transaction
      setTimeout(() => {
        window.location.reload()
      }, 3000)
      
      return tx.hash
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnstakeBDAG = async (): Promise<string> => {
    if (!isConnected || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    const tokenContract = getContract("TOKEN")
    if (!tokenContract) {
      throw new Error("Token contract not available")
    }

    setIsProcessing(true)
    try {
      const tx = await tokenContract.unstakeBDAG()
      
      // Refresh data after transaction
      setTimeout(() => {
        window.location.reload()
      }, 3000)
      
      return tx.hash
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isConnected) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Connect your wallet to view staking information</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please connect to the BlockDAG network to view staking information</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-muted-foreground">Loading staking information...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-sky-blue" />
              BDAG Staking Dashboard
            </div>
            <div className="flex items-center gap-2">
              {stakingData.isEligibleForMinting && (
                <Badge className="bg-climate-green/10 text-climate-green border-climate-green">
                  Eligible for Rewards
                </Badge>
              )}
              {stakingData.isStakeActive && (
                <Badge variant={isUnlockTime() ? "secondary" : "outline"}>
                  {isUnlockTime() ? "Unlocked" : `Locked ${getDaysLeft()} days`}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Stake</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-sky-blue">{stakingData.currentStake}</p>
                  <p className="text-lg text-muted-foreground">BDAG</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum: {stakingData.minimumStake} BDAG
                </p>
              </div>

              {stakingData.isStakeActive && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Stake Date</p>
                      <p className="font-medium">{stakingData.stakeDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unlock Date</p>
                      <p className="font-medium">{stakingData.unlockDate}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Lock Period Progress</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{stakingData.stakeLockPeriod} day lock period</span>
                        <span>{Math.round(getUnlockProgress())}% complete</span>
                      </div>
                      <Progress value={getUnlockProgress()} className="h-3" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Available BDAG Balance</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stakingData.availableBalance}</p>
                  <p className="text-lg text-muted-foreground">BDAG</p>
                </div>
              </div>

              {/* Approval Status */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Approval Status</p>
                    <p className="text-xs text-muted-foreground">
                      Approved: {stakingData.allowance} BDAG
                    </p>
                  </div>
                  {stakingData.hasApproval ? (
                    <CheckCircle className="h-5 w-5 text-climate-green" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Approval Button - only show if not approved */}
                {!stakingData.hasApproval && canStakeMore() && (
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => setShowApprovalModal(true)}
                    disabled={!canStakeMore() || !isCorrectNetwork || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve {stakingData.minimumStake} BDAG
                      </>
                    )}
                  </Button>
                )}

                {/* Stake Button - only show if approved */}
                {stakingData.hasApproval && (
                  <Button 
                    className="w-full bg-sky-blue hover:bg-sky-blue/90"
                    onClick={() => setShowStakeModal(true)}
                    disabled={!canStakeMore() || !isCorrectNetwork || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Stake {stakingData.minimumStake} BDAG
                      </>
                    )}
                  </Button>
                )}

                {stakingData.isStakeActive && (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowUnstakeModal(true)}
                    disabled={!isUnlockTime() || !isCorrectNetwork || isProcessing}
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    {isUnlockTime() ? "Unstake All BDAG" : `Unlock in ${getDaysLeft()} days`}
                  </Button>
                )}

                {!canStakeMore() && (
                  <p className="text-sm text-muted-foreground text-center">
                    Need {stakingData.minimumStake} BDAG to stake
                  </p>
                )}
              </div>

              {/* Rewards Info */}
              <div className="bg-climate-green/5 border border-climate-green/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-climate-green" />
                  <p className="font-medium text-climate-green">Staking Rewards</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Earn {stakingData.autoMintAmount} CLT tokens immediately when you stake {stakingData.minimumStake} BDAG. 
                  Plus ongoing rewards from platform activities!
                </p>
              </div>
            </div>
          </div>

          {/* Important Warnings */}
          <div className="space-y-4">
            {!stakingData.hasApproval && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Approval Required:</strong> You need to approve the staking contract to spend your BDAG tokens before you can stake. This is a one-time transaction.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Unstaking will remove you from DAO membership and you'll lose all platform privileges including voting rights and validator status.
              </AlertDescription>
            </Alert>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Lock Period:</strong> BDAG tokens are locked for {stakingData.stakeLockPeriod} days after staking. 
                This ensures platform stability and commitment to the ecosystem.
              </AlertDescription>
            </Alert>
          </div>

          {/* Staking Benefits */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Staking Benefits</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-climate-green rounded-full"></div>
                <span>Immediate {stakingData.autoMintAmount} CLT token reward</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-climate-green rounded-full"></div>
                <span>Access to report submission (20 CLT per report)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Eligibility for DAO membership and validation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Governance participation and voting rights</span>
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
        description={`Approve the staking contract to spend ${stakingData.minimumStake} BDAG tokens. This is a one-time approval required before staking.`}
        onConfirm={handleApproval}
      />

      <TransactionModal
        isOpen={showStakeModal}
        onClose={() => setShowStakeModal(false)}
        title="Stake BDAG Tokens"
        description={`Stake ${stakingData.minimumStake} BDAG tokens to join ClimaLink and earn ${stakingData.autoMintAmount} CLT tokens immediately. Tokens will be locked for ${stakingData.stakeLockPeriod} days.`}
        onConfirm={handleStakeBDAG}
      />

      <TransactionModal
        isOpen={showUnstakeModal}
        onClose={() => setShowUnstakeModal(false)}
        title="Unstake BDAG Tokens"
        description="Unstake all your BDAG tokens. Warning: This will remove your DAO membership, validator status, and all platform privileges."
        onConfirm={handleUnstakeBDAG}
      />
    </>
  )
}