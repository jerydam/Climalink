"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/lib/web3"
import { useRole } from "@/lib/roles"
import { Coins, TrendingUp, Users, FileText, Lock, Vote, Loader2, RefreshCw } from "lucide-react"
import { ethers } from "ethers"

interface UserStats {
  cltBalance: string
  cltBalanceUSD: string
  stakedBDAG: string
  stakedBDAGUSD: string
  unlockTime: number
  reportsSubmitted: number
  validReports: number
  validationsPerformed: number
  daoVotes: number
  isDaoMember: boolean
  memberSince: string
  isEligibleForMinting: boolean
}

export function ContractInteractions() {
  const { isConnected, account, getContract, provider } = useWeb3()
  const { userRole, isMember } = useRole()
  
  const [stats, setStats] = useState<UserStats>({
    cltBalance: "0",
    cltBalanceUSD: "0",
    stakedBDAG: "0", 
    stakedBDAGUSD: "0",
    unlockTime: 0,
    reportsSubmitted: 0,
    validReports: 0,
    validationsPerformed: 0,
    daoVotes: 0,
    isDaoMember: false,
    memberSince: "N/A",
    isEligibleForMinting: false,
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    if (isConnected && account) {
      loadUserStats()
    } else {
      setIsLoading(false)
    }
  }, [isConnected, account, userRole])

  const loadUserStats = async () => {
    if (!isConnected || !account || !provider) return

    try {
      setIsLoading(true)
      
      const tokenContract = getContract("TOKEN")
      const climateContract = getContract("CLIMATE")
      const daoContract = getContract("DAO")

      // Fetch basic balances and staking info
      const [cltBalance, stakedAmount, unlockTime, isEligibleForMinting] = await Promise.all([
        tokenContract.balanceOf(account),
        tokenContract.getStakedAmount(account),
        tokenContract.getUnlockTime(account),
        tokenContract.isEligibleForMinting(account),
      ])

      const cltFormatted = ethers.formatEther(cltBalance)
      const stakedFormatted = ethers.formatEther(stakedAmount)

      // Check DAO membership
      const isDaoMember = await daoContract.isMember(account)

      // Get current block for event filtering
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - 100000) // Look back ~100k blocks

      let reportsSubmitted = 0
      let validReports = 0
      let validationsPerformed = 0
      let daoVotes = 0
      let memberSince = "N/A"

      // Count user's reports using events (more efficient than iterating)
      try {
        const reportEvents = await climateContract.queryFilter(
          climateContract.filters.ClimateEvent(),
          fromBlock,
          currentBlock
        )
        
        // Filter for reports by this user
        for (const event of reportEvents) {
          try {
            const reportIndex = event.args?.[0]
            if (reportIndex) {
              const report = await climateContract.getClimateReport(reportIndex)
              if (report.reporter.toLowerCase() === account.toLowerCase()) {
                reportsSubmitted++
                if (report.status === 1) { // ReportStatus.Validated
                  validReports++
                }
              }
            }
          } catch (error) {
            continue
          }
        }
      } catch (error) {
        console.error("Error fetching report events:", error)
        // Fallback: check recent reports directly
        try {
          const reportCount = await climateContract.reportCount()
          const maxCheck = Math.min(Number(reportCount), 50) // Check last 50 reports only
          for (let i = Math.max(1, Number(reportCount) - maxCheck + 1); i <= Number(reportCount); i++) {
            try {
              const report = await climateContract.getClimateReport(i)
              if (report.reporter.toLowerCase() === account.toLowerCase()) {
                reportsSubmitted++
                if (report.status === 1) { // ReportStatus.Validated
                  validReports++
                }
              }
            } catch (error) {
              continue
            }
          }
        } catch (error) {
          console.error("Error with fallback report counting:", error)
        }
      }

      // Count validations performed (if validator or DAO member)
      if (userRole === "validator" || userRole === "dao_member") {
        try {
          const validationEvents = await climateContract.queryFilter(
            climateContract.filters.ReportVoteCast(null, account),
            fromBlock,
            currentBlock
          )
          
          validationsPerformed = validationEvents.length
        } catch (error) {
          console.error("Error fetching validation events:", error)
        }
      }

      // Count DAO votes (if DAO member)
      if (isDaoMember) {
        try {
          const voteEvents = await daoContract.queryFilter(
            daoContract.filters.VoteCast(null, account),
            fromBlock,
            currentBlock
          )
          
          daoVotes = voteEvents.length
        } catch (error) {
          console.error("Error fetching DAO vote events:", error)
        }
      }

      // Get member since date from first staking event
      try {
        const stakeEvents = await tokenContract.queryFilter(
          tokenContract.filters.Stake(account),
          0,
          currentBlock
        )

        if (stakeEvents.length > 0) {
          const firstEvent = stakeEvents[0]
          const block = await provider.getBlock(firstEvent.blockNumber)
          if (block) {
            memberSince = new Date(Number(block.timestamp) * 1000).toLocaleDateString()
          }
        }
      } catch (error) {
        console.error("Error fetching member since date:", error)
      }

      // Mock USD prices (in production, fetch from oracle/API)
      const cltPriceUSD = 0.10 // $0.10 per CLT
      const bdagPriceUSD = 0.50 // $0.50 per BDAG

      setStats({
        cltBalance: parseFloat(cltFormatted).toFixed(2),
        cltBalanceUSD: (parseFloat(cltFormatted) * cltPriceUSD).toFixed(2),
        stakedBDAG: parseFloat(stakedFormatted).toFixed(2),
        stakedBDAGUSD: (parseFloat(stakedFormatted) * bdagPriceUSD).toFixed(2),
        unlockTime: Number(unlockTime),
        reportsSubmitted,
        validReports,
        validationsPerformed,
        daoVotes,
        isDaoMember,
        memberSince,
        isEligibleForMinting,
      })
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to load user stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadUserStats()
  }

  const getDaysUntilUnlock = () => {
    if (stats.unlockTime === 0) return 0
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = stats.unlockTime - now
    return Math.max(0, Math.ceil(timeLeft / (24 * 60 * 60)))
  }

  const getReportAccuracy = () => {
    if (stats.reportsSubmitted === 0) return 0
    return Math.round((stats.validReports / stats.reportsSubmitted) * 100)
  }

  const getStakingStatus = () => {
    const stakedAmount = parseFloat(stats.stakedBDAG)
    if (stakedAmount === 0) return { status: "Not Staked", color: "text-muted-foreground" }
    if (stakedAmount >= 100) return { status: "Active", color: "text-climate-green" }
    return { status: "Insufficient", color: "text-amber-500" }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Connect your wallet to view contract data</p>
            <Button onClick={() => window.location.reload()}>
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stakingStatus = getStakingStatus()

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Your Contract Data</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
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
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CLT Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CLT Balance</CardTitle>
            <Coins className="h-4 w-4 text-climate-green" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-20 mb-1"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.cltBalance}</div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">≈ ${stats.cltBalanceUSD}</p>
                  {stats.isEligibleForMinting && (
                    <Badge variant="outline" className="text-xs bg-climate-green/10 text-climate-green">
                      Eligible
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Staked BDAG */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staked BDAG</CardTitle>
            <Lock className="h-4 w-4 text-sky-blue" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-20 mb-1"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.stakedBDAG}</div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">≈ ${stats.stakedBDAGUSD}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${stakingStatus.color}`}
                  >
                    {stakingStatus.status}
                  </Badge>
                </div>
                {getDaysUntilUnlock() > 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Locked for {getDaysUntilUnlock()} more days
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* DAO Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DAO Status</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-20 mb-1"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.isDaoMember ? "Member" : "Not Member"}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={stats.isDaoMember ? "default" : "secondary"}
                    className={stats.isDaoMember ? "bg-purple-500" : ""}
                  >
                    {stats.isDaoMember ? "Active" : "Inactive"}
                  </Badge>
                  {stats.daoVotes > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {stats.daoVotes} votes cast
                    </span>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-20 mb-1"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.reportsSubmitted}</div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {stats.validReports} validated
                  </p>
                  {stats.reportsSubmitted > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {getReportAccuracy()}% accuracy
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats for Members */}
      {isMember && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(userRole === "validator" || userRole === "dao_member") && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Validations</CardTitle>
                <Vote className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.validationsPerformed}</div>
                <p className="text-xs text-muted-foreground">Reports Validated (24h periods)</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold capitalize">
                {userRole.replace("_", " ")}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Since: {stats.memberSince}
                </p>
                {userRole === "reporter" && stats.isDaoMember && (
                  <Badge variant="outline" className="text-xs text-amber-500">
                    Upgrade Available
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.reportsSubmitted + stats.validationsPerformed + stats.daoVotes}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Platform Actions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Staking Requirements Alert */}
      {parseFloat(stats.stakedBDAG) < 100 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
              <div>
                <p className="font-medium text-amber-800">Staking Required</p>
                <p className="text-sm text-amber-700">
                  Stake 100 BDAG tokens to access platform features and earn CLT rewards. 
                  You'll receive 1000 CLT tokens immediately upon staking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}