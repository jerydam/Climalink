"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, Lock, Gift, Loader2 } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { ethers } from "ethers"

interface TokenData {
  cltBalance: string
  cltBalanceUSD: string
  bdagStaked: string
  unlockTime: number
  pendingRewards: string
  pendingRewardsUSD: string
}

export function TokenBalances() {
  const [tokenData, setTokenData] = useState<TokenData>({
    cltBalance: "0",
    cltBalanceUSD: "0",
    bdagStaked: "0",
    unlockTime: 0,
    pendingRewards: "0",
    pendingRewardsUSD: "0",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isTransferring, setIsTransferring] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  
  const { account, isConnected, getContract, isCorrectNetwork } = useWeb3()

  useEffect(() => {
    const fetchTokenData = async () => {
      if (!isConnected || !account || !isCorrectNetwork) {
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

        // Fetch CLT balance
        const cltBalance = await tokenContract.balanceOf(account)
        const cltFormatted = ethers.formatEther(cltBalance)

        // Fetch BDAG staked amount
        const bdagStaked = await tokenContract.getStakedAmount(account)
        const bdagFormatted = ethers.formatEther(bdagStaked)

        // Fetch unlock time
        const unlockTime = await tokenContract.getUnlockTime(account)

        // Calculate pending rewards (simplified - in reality you'd track this through events)
        // For demo, we'll show a portion of CLT balance as "pending"
        const pendingRewards = parseFloat(cltFormatted) * 0.1 // 10% as pending
        const pendingRewardsFormatted = pendingRewards.toFixed(2)

        // Mock USD conversion (in production, fetch from oracle or API)
        const cltPriceUSD = 0.10 // $0.10 per CLT
        const cltBalanceUSD = (parseFloat(cltFormatted) * cltPriceUSD).toFixed(2)
        const pendingRewardsUSD = (pendingRewards * cltPriceUSD).toFixed(2)

        setTokenData({
          cltBalance: parseFloat(cltFormatted).toFixed(2),
          cltBalanceUSD,
          bdagStaked: parseFloat(bdagFormatted).toFixed(2),
          unlockTime: Number(unlockTime),
          pendingRewards: pendingRewardsFormatted,
          pendingRewardsUSD,
        })
      } catch (error) {
        console.error("Error fetching token data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokenData()
  }, [account, isConnected, getContract, isCorrectNetwork])

  const handleTransfer = async () => {
    // In a real app, this would open a transfer modal
    alert("Transfer functionality would be implemented with a proper UI form")
  }

  const handleUnstake = async () => {
    if (!isConnected || !account || !isCorrectNetwork) {
      alert("Please connect to the BlockDAG network")
      return
    }

    const tokenContract = getContract("TOKEN")
    if (!tokenContract) {
      alert("Token contract not available")
      return
    }

    setIsUnstaking(true)
    try {
      const tx = await tokenContract.unstakeBDAG()
      await tx.wait()
      
      // Refresh data after unstaking
      const bdagStaked = await tokenContract.getStakedAmount(account)
      const bdagFormatted = ethers.formatEther(bdagStaked)
      
      setTokenData(prev => ({
        ...prev,
        bdagStaked: parseFloat(bdagFormatted).toFixed(2)
      }))
    } catch (error) {
      console.error("Error unstaking BDAG:", error)
      alert("Failed to unstake BDAG. Please try again.")
    } finally {
      setIsUnstaking(false)
    }
  }

  const handleClaim = async () => {
    // In a real implementation, this would call a claim rewards function
    // For now, we'll simulate the process
    setIsClaiming(true)
    try {
      // Simulate claiming rewards
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update balances (in reality, this would be handled by the contract)
      setTokenData(prev => ({
        ...prev,
        cltBalance: (parseFloat(prev.cltBalance) + parseFloat(prev.pendingRewards)).toFixed(2),
        cltBalanceUSD: ((parseFloat(prev.cltBalance) + parseFloat(prev.pendingRewards)) * 0.10).toFixed(2),
        pendingRewards: "0.00",
        pendingRewardsUSD: "0.00",
      }))
      
      alert("Rewards claimed successfully!")
    } catch (error) {
      console.error("Error claiming rewards:", error)
      alert("Failed to claim rewards. Please try again.")
    } finally {
      setIsClaiming(false)
    }
  }

  const getDaysLeft = () => {
    if (tokenData.unlockTime === 0) return 0
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = tokenData.unlockTime - now
    return Math.max(0, Math.ceil(timeLeft / (24 * 60 * 60)))
  }

  const isStakeUnlocked = () => {
    if (tokenData.unlockTime === 0) return true
    return Date.now() / 1000 >= tokenData.unlockTime
  }

  if (!isConnected) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Connect wallet to view balances</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Connect to BlockDAG network</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CLT Balance</CardTitle>
          <Coins className="h-4 w-4 text-climate-green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tokenData.cltBalance}</div>
          <p className="text-xs text-muted-foreground">≈ ${tokenData.cltBalanceUSD}</p>
          <Button 
            size="sm" 
            className="mt-3 w-full bg-climate-green hover:bg-climate-green/90"
            onClick={handleTransfer}
            disabled={isTransferring || !isCorrectNetwork}
          >
            {isTransferring ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Transfer
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BDAG Staked</CardTitle>
          <Lock className="h-4 w-4 text-sky-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tokenData.bdagStaked}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={isStakeUnlocked() ? "secondary" : "outline"} 
              className="text-xs"
            >
              {isStakeUnlocked() ? "Unlocked" : "Locked"}
            </Badge>
            {!isStakeUnlocked() && (
              <span className="text-xs text-muted-foreground">
                {getDaysLeft()} days
              </span>
            )}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-3 w-full bg-transparent"
            onClick={handleUnstake}
            disabled={isUnstaking || !isStakeUnlocked() || parseFloat(tokenData.bdagStaked) === 0 || !isCorrectNetwork}
          >
            {isUnstaking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isStakeUnlocked() ? "Unstake" : `Locked for ${getDaysLeft()} days`}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
          <Gift className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tokenData.pendingRewards}</div>
          <p className="text-xs text-muted-foreground">≈ ${tokenData.pendingRewardsUSD}</p>
          <Button 
            size="sm" 
            className="mt-3 w-full bg-amber-500 hover:bg-amber-600"
            onClick={handleClaim}
            disabled={isClaiming || parseFloat(tokenData.pendingRewards) === 0 || !isCorrectNetwork}
          >
            {isClaiming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Claim
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}