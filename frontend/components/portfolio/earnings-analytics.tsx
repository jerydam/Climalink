"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Award, Coins, FileText, Users, Loader2 } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { useRole } from "@/lib/roles"

interface EarningsData {
  thisMonthCLT: number
  lastMonthCLT: number
  totalEarnedCLT: number
  reportEarnings: number
  stakingBonus: number
  validationEarnings: number
  daoRewards: number
  averagePerReport: number
  monthlyGrowth: number
}

export function EarningsAnalytics() {
  const [earnings, setEarnings] = useState<EarningsData>({
    thisMonthCLT: 0,
    lastMonthCLT: 0,
    totalEarnedCLT: 0,
    reportEarnings: 0,
    stakingBonus: 0,
    validationEarnings: 0,
    daoRewards: 0,
    averagePerReport: 0,
    monthlyGrowth: 0,
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const { account, isConnected, getContract, provider, isCorrectNetwork } = useWeb3()
  const { userRole } = useRole()

  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!isConnected || !account || !provider || !isCorrectNetwork) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const tokenContract = getContract("TOKEN")
        const climateContract = getContract("CLIMATE")
        const daoContract = getContract("DAO")

        if (!tokenContract) {
          console.error("Token contract not available")
          setIsLoading(false)
          return
        }

        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - 100000) // Look back ~100k blocks

        // Calculate date boundaries
        const now = Math.floor(Date.now() / 1000)
        const thisMonthStart = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000)
        const lastMonthStart = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getTime() / 1000)

        let reportEarnings = 0
        let stakingBonus = 0
        let validationEarnings = 0
        let daoRewards = 0
        let thisMonthEarnings = 0
        let lastMonthEarnings = 0
        let reportCount = 0

        try {
          // Fetch mint events to calculate earnings
          const mintEvents = await tokenContract.queryFilter(
            tokenContract.filters.Mint(account),
            fromBlock,
            currentBlock
          )

          for (const event of mintEvents) {
            const block = await event.getBlock()
            const amount = Number(event.args?.[1] || 0) / 1e18
            const timestamp = Number(block.timestamp)

            // Categorize earnings by type based on amount
            if (amount === 1000) {
              stakingBonus += amount // Initial staking bonus
            } else if (amount === 20) {
              reportEarnings += amount
              reportCount++
            } else if (amount <= 10 && amount > 0) {
              validationEarnings += amount // Validation rewards
            } else {
              daoRewards += amount // Other DAO-related rewards
            }

            // Track monthly earnings
            if (timestamp >= thisMonthStart) {
              thisMonthEarnings += amount
            } else if (timestamp >= lastMonthStart && timestamp < thisMonthStart) {
              lastMonthEarnings += amount
            }
          }
        } catch (error) {
          console.error("Error fetching mint events:", error)
        }

        // Calculate validation earnings for validators/DAO members
        if ((userRole === "validator" || userRole === "dao_member") && climateContract) {
          try {
            const validationEvents = await climateContract.queryFilter(
              climateContract.filters.ReportVoteCast(null, account),
              fromBlock,
              currentBlock
            )
            
            // Estimate validation earnings (5 CLT per validation)
            validationEarnings += validationEvents.length * 5
          } catch (error) {
            console.error("Error fetching validation events:", error)
          }
        }

        // Calculate DAO participation rewards
        if (userRole === "dao_member" && daoContract) {
          try {
            const voteEvents = await daoContract.queryFilter(
              daoContract.filters.VoteCast(null, account),
              fromBlock,
              currentBlock
            )
            
            // Estimate DAO participation rewards (2 CLT per vote)
            daoRewards += voteEvents.length * 2
          } catch (error) {
            console.error("Error fetching DAO events:", error)
          }
        }

        const totalEarned = reportEarnings + stakingBonus + validationEarnings + daoRewards
        const averagePerReport = reportCount > 0 ? reportEarnings / reportCount : 0
        const monthlyGrowth = lastMonthEarnings > 0 ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 : 0

        setEarnings({
          thisMonthCLT: Math.round(thisMonthEarnings),
          lastMonthCLT: Math.round(lastMonthEarnings),
          totalEarnedCLT: Math.round(totalEarned),
          reportEarnings: Math.round(reportEarnings),
          stakingBonus: Math.round(stakingBonus),
          validationEarnings: Math.round(validationEarnings),
          daoRewards: Math.round(daoRewards),
          averagePerReport: Math.round(averagePerReport),
          monthlyGrowth: Math.round(monthlyGrowth),
        })

      } catch (error) {
        console.error("Error fetching earnings data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEarningsData()
  }, [account, isConnected, getContract, provider, userRole, isCorrectNetwork])

  if (!isConnected) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Connect your wallet to view earnings analytics</p>
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
            <p className="text-muted-foreground">Please connect to the BlockDAG network to view earnings analytics</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading earnings data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const earningsSources = [
    {
      name: "Weather Reports",
      amount: earnings.reportEarnings,
      percentage: earnings.totalEarnedCLT > 0 ? (earnings.reportEarnings / earnings.totalEarnedCLT) * 100 : 0,
      color: "bg-climate-green",
      description: "20 CLT per validated report"
    },
    {
      name: "Initial Staking Bonus", 
      amount: earnings.stakingBonus,
      percentage: earnings.totalEarnedCLT > 0 ? (earnings.stakingBonus / earnings.totalEarnedCLT) * 100 : 0,
      color: "bg-sky-blue",
      description: "1000 CLT bonus for staking 100 BDAG"
    },
    {
      name: "Validation Rewards",
      amount: earnings.validationEarnings,
      percentage: earnings.totalEarnedCLT > 0 ? (earnings.validationEarnings / earnings.totalEarnedCLT) * 100 : 0,
      color: "bg-blue-500",
      description: "5 CLT per report validation"
    },
    {
      name: "DAO Participation",
      amount: earnings.daoRewards,
      percentage: earnings.totalEarnedCLT > 0 ? (earnings.daoRewards / earnings.totalEarnedCLT) * 100 : 0,
      color: "bg-purple-500",
      description: "Governance participation rewards"
    },
  ].filter(source => source.amount > 0) // Only show active earning sources

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-climate-green" />
          Earnings Analytics
          {earnings.monthlyGrowth !== 0 && (
            <Badge 
              variant={earnings.monthlyGrowth > 0 ? "default" : "secondary"}
              className={earnings.monthlyGrowth > 0 ? "bg-climate-green" : ""}
            >
              {earnings.monthlyGrowth > 0 ? "+" : ""}{earnings.monthlyGrowth}% this month
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Earnings Chart Placeholder */}
        <div className="h-64 bg-gradient-to-br from-climate-green/5 to-sky-blue/5 border border-muted rounded-lg flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-climate-green mb-2">{earnings.totalEarnedCLT} CLT</p>
            <p className="text-muted-foreground mb-4">Total Platform Earnings</p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="font-medium">This Month: </span>
                <span className="text-climate-green">{earnings.thisMonthCLT} CLT</span>
              </div>
              <div>
                <span className="font-medium">Last Month: </span>
                <span className="text-muted-foreground">{earnings.lastMonthCLT} CLT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-climate-green">{earnings.thisMonthCLT} CLT</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Last Month</p>
            <p className="text-2xl font-bold">{earnings.lastMonthCLT} CLT</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Average Per Report</p>
            <p className="text-2xl font-bold text-amber-500">{earnings.averagePerReport} CLT</p>
          </div>
        </div>

        {/* Earnings Sources Breakdown */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            Earnings Breakdown
          </h4>
          <div className="space-y-4">
            {earningsSources.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{source.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {source.description}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{source.amount} CLT</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({source.percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`${source.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earning Tips */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">💡 Maximize Your Earnings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-climate-green" />
              <span>Submit regular weather reports (20 CLT each)</span>
            </div>
            {userRole === "reporter" && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>Join DAO to unlock validation rewards</span>
              </div>
            )}
            {(userRole === "validator" || userRole === "dao_member") && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-500" />
                <span>Validate reports during 24-hour periods</span>
              </div>
            )}
            {userRole === "dao_member" && (
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                <span>Participate in governance proposals</span>
              </div>
            )}
          </div>
        </div>

        {/* Role-specific earning potential */}
        {userRole === "reporter" && (
          <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
            <h4 className="font-medium text-purple-800">Ready to Earn More?</h4>
            <p className="text-sm text-purple-700 mt-1">
              Join the DAO to become a Validator and earn additional rewards from validating reports and participating in governance!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}