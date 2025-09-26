"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, Coins, Vote, TrendingUp, RefreshCw, Loader2 } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { useRole } from "@/lib/roles"
import { ethers } from "ethers"

interface DAOMembershipData {
  isDaoMember: boolean
  membershipTier: string
  bdagStaked: string
  cltBalance: string
  votingPower: string
  proposalsCreated: number
  proposalsPassed: number
  proposalsActive: number
  totalMembers: number
  memberSince: string
  unlockTime: number
}

export function MembershipStatus() {
  const { account, getContract, isConnected } = useWeb3()
  const { userRole } = useRole()
  
  const [membershipData, setMembershipData] = useState<DAOMembershipData>({
    isDaoMember: false,
    membershipTier: "Not Member",
    bdagStaked: "0",
    cltBalance: "0",
    votingPower: "0",
    proposalsCreated: 0,
    proposalsPassed: 0,
    proposalsActive: 0,
    totalMembers: 0,
    memberSince: "N/A",
    unlockTime: 0,
  })
  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isConnected && account) {
      loadMembershipData()
    }
  }, [isConnected, account, userRole])

  const loadMembershipData = async () => {
    if (!account) return

    try {
      setIsLoading(true)
      
      const tokenContract = getContract("TOKEN")
      const daoContract = getContract("DAO")

      // Get basic membership info
      const [isDaoMember, stakedAmount, cltBalance, totalMembers] = await Promise.all([
        daoContract.isMember(account),
        tokenContract.getStakedAmount(account),
        tokenContract.balanceOf(account),
        daoContract.getActiveMembers(),
      ])

      const stakedFormatted = ethers.formatEther(stakedAmount)
      const cltFormatted = ethers.formatEther(cltBalance)

      // Calculate voting power (simplified - based on stake)
      const stakedAmount_num = parseFloat(stakedFormatted)
      let votingPower = "0"
      let membershipTier = "Not Member"
      
      if (isDaoMember) {
        // Simplified voting power calculation
        votingPower = totalMembers > 0 ? ((1 / Number(totalMembers)) * 100).toFixed(2) : "0"
        
        // Determine tier based on stake amount
        if (stakedAmount_num >= 1000) {
          membershipTier = "Tier 3 (Whale)"
        } else if (stakedAmount_num >= 500) {
          membershipTier = "Tier 2 (Active)"
        } else if (stakedAmount_num >= 100) {
          membershipTier = "Tier 1 (Member)"
        } else {
          membershipTier = "Tier 0 (Minimum)"
        }
      }

      // Get unlock time
      const unlockTime = await tokenContract.getUnlockTime(account)

      // Count user's proposals (simplified - would need events in real implementation)
      let proposalsCreated = 0
      let proposalsPassed = 0
      let proposalsActive = 0
      
      try {
        const proposals = await daoContract.viewProposals()
        
        for (const proposal of proposals) {
          if (proposal.proposer.toLowerCase() === account.toLowerCase()) {
            proposalsCreated++
            
            if (proposal.status === 1) { // ProposalStatus.Executed
              proposalsPassed++
            } else if (proposal.status === 0) { // ProposalStatus.Active
              proposalsActive++
            }
          }
        }
      } catch (error) {
        console.error("Error fetching proposals:", error)
      }

      // Get member since date (mock for now)
      let memberSince = "N/A"
      if (isDaoMember) {
        try {
          // In a real implementation, you'd get this from MemberJoined events
          memberSince = new Date().toLocaleDateString() // Placeholder
        } catch (error) {
          memberSince = "Unknown"
        }
      }

      setMembershipData({
        isDaoMember,
        membershipTier,
        bdagStaked: stakedFormatted,
        cltBalance: cltFormatted,
        votingPower,
        proposalsCreated,
        proposalsPassed,
        proposalsActive,
        totalMembers: Number(totalMembers),
        memberSince,
        unlockTime: Number(unlockTime),
      })

    } catch (error) {
      console.error("Error loading membership data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadMembershipData()
  }

  const getDaysUntilUnlock = () => {
    if (membershipData.unlockTime === 0) return 0
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = membershipData.unlockTime - now
    return Math.max(0, Math.ceil(timeLeft / (24 * 60 * 60)))
  }

  const getVotingPowerProgress = () => {
    return Math.min(parseFloat(membershipData.votingPower), 10) // Cap at 10% for progress bar
  }

  const getTierColor = (tier: string) => {
    if (tier.includes("Whale")) return "bg-purple-600 text-white"
    if (tier.includes("Active")) return "bg-blue-600 text-white"
    if (tier.includes("Member")) return "bg-climate-green text-white"
    if (tier.includes("Minimum")) return "bg-amber-500 text-white"
    return "bg-muted text-muted-foreground"
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Connect your wallet to view DAO membership status</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">DAO Membership Status</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-20 mb-2"></div>
                <div className="h-6 bg-muted rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-climate-green">
                  {membershipData.isDaoMember ? "Active" : "Not Member"}
                </div>
                <Badge className={getTierColor(membershipData.membershipTier)}>
                  {membershipData.membershipTier}
                </Badge>
                {membershipData.isDaoMember && membershipData.memberSince !== "N/A" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Since: {membershipData.memberSince}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BDAG Staked</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-20 mb-2"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{parseFloat(membershipData.bdagStaked).toFixed(0)}</div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {parseFloat(membershipData.bdagStaked) >= 100 ? "✓ Minimum met" : "⚠ Need 100 BDAG"}
                  </p>
                  {getDaysUntilUnlock() > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {getDaysUntilUnlock()}d locked
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voting Power</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-20 mb-2"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{membershipData.votingPower}%</div>
                <Progress value={getVotingPowerProgress()} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Of {membershipData.totalMembers} total members
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proposals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-20 mb-2"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{membershipData.proposalsCreated}</div>
                <p className="text-xs text-muted-foreground">
                  {membershipData.proposalsPassed} passed • {membershipData.proposalsActive} active
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Membership Requirements */}
      {!membershipData.isDaoMember && !isLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800">DAO Membership Requirements</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${parseFloat(membershipData.bdagStaked) >= 100 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Stake minimum 100 BDAG tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${parseFloat(membershipData.cltBalance) >= 1000 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Hold minimum 1000 CLT tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Pay 1000 CLT membership fee (one-time)</span>
                </div>
              </div>
              <p className="text-xs text-blue-600">
                Current CLT Balance: {parseFloat(membershipData.cltBalance).toFixed(0)} CLT
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unstaking Warning */}
      {membershipData.isDaoMember && getDaysUntilUnlock() === 0 && parseFloat(membershipData.bdagStaked) > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
              <div>
                <p className="font-medium text-amber-800">Unstaking Available</p>
                <p className="text-sm text-amber-700">
                  Your BDAG tokens are unlocked. Unstaking will remove your DAO membership and voting rights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}