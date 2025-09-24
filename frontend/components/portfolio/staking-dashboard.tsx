"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Plus, AlertTriangle, Loader2 } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { ethers } from "ethers"

interface StakingData {
  currentStake: string
  stakeDate: string
  unlockDate: string
  unlockTime: number
  availableToStake: string
  stakeLockPeriod: number
  minimumStake: string
  isStakeActive: boolean
}

export function StakingDashboard() {
  const [stakingData, setStakingData] = useState<StakingData>({
    currentStake: "0",
    stakeDate: "",
    unlockDate: "",
    unlockTime: 0,
    availableToStake: "0",
    stakeLockPeriod: 0,
    minimumStake: "0",
    isStakeActive: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  
  const { account, isConnected, getContract, provider } = useWeb3()

  useEffect(() => {
    const fetchStakingData = async () => {
      if (!isConnected || !account || !provider) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const tokenContract = getContract("TOKEN")

        // Fetch current staked amount
        const stakedAmount = await tokenContract.getStakedAmount(account)
        const stakedFormatted = ethers.formatEther(stakedAmount)

        // Fetch staking timestamp
        const stakingTimestamp = await tokenContract.stakingTimestamp(account)
        const stakingTime = Number(stakingTimestamp)

        // Fetch unlock time
        const unlockTime = await tokenContract.getUnlockTime(account)
        const unlockTimestamp = Number(unlockTime)

        // Fetch contract constants
        const lockPeriod = await tokenContract.STAKE_LOCK_PERIOD()
        const minimumStake = await tokenContract.BDAG_STAKE_AMOUNT()
        
        // Get BDAG token balance (assuming user has BDAG tokens in their wallet)
        // In a real implementation, you'd need the BDAG token contract
        const bdagContract = getContract("TOKEN") // This would be the BDAG contract
        const bdagBalance = await bdagContract.balanceOf(account)
        const availableFormatted = ethers.formatEther(bdagBalance)

        // Format dates
        const stakeDate = stakingTime > 0 ? new Date(stakingTime * 1000).toLocaleDateString() : ""
        const unlockDate = unlockTimestamp > 0 ? new Date(unlockTimestamp * 1000).toLocaleDateString() : ""

        setStakingData({
          currentStake: parseFloat(stakedFormatted).toFixed(2),
          stakeDate,
          unlockDate,
          unlockTime: unlockTimestamp,
          availableToStake: parseFloat(availableFormatted).toFixed(2),
          stakeLockPeriod: Number(lockPeriod),
          minimumStake: ethers.formatEther(minimumStake),
          isStakeActive: parseFloat(stakedFormatted) > 0,
        })
      } catch (error) {
        console.error("Error fetching staking data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStakingData()
  }, [account, isConnected, getContract, provider])

  const getUnlockProgress = () => {
    if (!stakingData.isStakeActive || stakingData.unlockTime === 0) return 0
    
    const now = Math.floor(Date.now() / 1000)
    const totalLockTime = stakingData.stakeLockPeriod
    const elapsedTime = now - (stakingData.unlockTime - totalLockTime)
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
    if (!stakingData.isStakeActive) return false
    return Date.now() / 1000 >= stakingData.unlockTime
  }

  const handleStakeMore = async () => {
    if (!isConnected || !account) return

    setIsStaking(true)
    try {
      const tokenContract = getContract("TOKEN")
      const tx = await tokenContract.stakeBDAG()
      await tx.wait()
      
      // Refresh staking data
      const stakedAmount = await tokenContract.getStakedAmount(account)
      const stakedFormatted = ethers.formatEther(stakedAmount)
      const unlockTime = await tokenContract.getUnlockTime(account)
      
      setStakingData(prev => ({
        ...prev,
        currentStake: parseFloat(stakedFormatted).toFixed(2),
        unlockTime: Number(unlockTime),
        isStakeActive: parseFloat(stakedFormatted) > 0,
      }))
      
      alert("Successfully staked BDAG tokens!")
    } catch (error) {
      console.error("Error staking BDAG:", error)
      alert("Failed to stake BDAG. Please ensure you have enough tokens and allowance.")
    } finally {
      setIsStaking(false)
    }
  }

  const handleUnstake = async () => {
    if (!isConnected || !account || !isUnlockTime()) return

    setIsUnstaking(true)
    try {
      const tokenContract = getContract("TOKEN")
      const tx = await tokenContract.unstakeBDAG()
      await tx.wait()
      
      // Refresh staking data
      const stakedAmount = await tokenContract.getStakedAmount(account)
      const stakedFormatted = ethers.formatEther(stakedAmount)
      
      setStakingData(prev => ({
        ...prev,
        currentStake: parseFloat(stakedFormatted).toFixed(2),
        isStakeActive: parseFloat(stakedFormatted) > 0,
      }))
      
      alert("Successfully unstaked BDAG tokens!")
    } catch (error) {
      console.error("Error unstaking BDAG:", error)
      alert("Failed to unstake BDAG. Please try again.")
    } finally {
      setIsUnstaking(false)
    }
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-sky-blue" />
          BDAG Staking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Stake</p>
              <p className="text-2xl font-bold">{stakingData.currentStake} BDAG</p>
            </div>

            {stakingData.isStakeActive && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Stake Date</p>
                  <p className="font-medium">{stakingData.stakeDate}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Unlock Date</p>
                  <p className="font-medium">
                    {stakingData.unlockDate} ({getDaysLeft()} days left)
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-sky-blue" />
                    <span className="font-medium text-sky-blue">
                      {isUnlockTime() ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            {stakingData.isStakeActive && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Unlock Progress</p>
                  <span className="text-sm font-medium">{Math.round(getUnlockProgress())}%</span>
                </div>
                <Progress value={getUnlockProgress()} className="h-3" />
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Available to Stake</p>
              <p className="text-xl font-bold">{stakingData.availableToStake} BDAG</p>
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full bg-sky-blue hover:bg-sky-blue/90"
                onClick={handleStakeMore}
                disabled={isStaking || parseFloat(stakingData.availableToStake) < parseFloat(stakingData.minimumStake)}
              >
                {isStaking ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Stake More BDAG
              </Button>

              {stakingData.isStakeActive && (
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={handleUnstake}
                  disabled={isUnstaking || !isUnlockTime()}
                >
                  {isUnstaking ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {isUnlockTime() ? "Unstake BDAG" : `Unlock in ${getDaysLeft()} days`}
                </Button>
              )}
            </div>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Warning: Unstaking will remove you from DAO membership and you'll lose voting rights.
            Minimum stake required: {stakingData.minimumStake} BDAG.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}