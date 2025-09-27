"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CurrencyDollarIcon, LockClosedIcon, DocumentTextIcon, TrophyIcon } from "@heroicons/react/24/outline"
import { useWeb3 } from "@/lib/web3"
import { useRole } from "@/lib/roles"
import { ethers } from "ethers"
import { Loader2 } from "lucide-react"

interface StatsData {
  cltBalance: string
  cltBalanceUSD: string
  bdagStaked: string
  reportsSubmitted: number
  validReports: number
  totalEarned: string
  isEligibleForMinting: boolean
  unlockDays: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    cltBalance: "0",
    cltBalanceUSD: "0",
    bdagStaked: "0",
    reportsSubmitted: 0,
    validReports: 0,
    totalEarned: "0",
    isEligibleForMinting: false,
    unlockDays: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { account, isConnected, getContract, provider } = useWeb3()
  const { userRole } = useRole()

  useEffect(() => {
    const fetchStats = async () => {
      if (!isConnected || !account || !provider) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const tokenContract = getContract("TOKEN")
        const climateContract = getContract("CLIMATE")

        if (!tokenContract || !climateContract) {
          console.error("Contracts not available")
          setIsLoading(false)
          return
        }

        // Fetch CLT balance and staking info
        const [cltBalance, bdagStaked, unlockTime, isEligibleForMinting] = await Promise.all([
          tokenContract.balanceOf(account),
          tokenContract.getStakedAmount(account),
          tokenContract.getUnlockTime(account),
          tokenContract.isEligibleForMinting(account),
        ])

        const cltFormatted = ethers.formatEther(cltBalance)
        const bdagFormatted = ethers.formatEther(bdagStaked)

        // Calculate unlock days remaining
        const now = Math.floor(Date.now() / 1000)
        const unlockTimestamp = Number(unlockTime)
        const unlockDays = unlockTimestamp > 0 ? Math.max(0, Math.ceil((unlockTimestamp - now) / (24 * 60 * 60))) : 0

        // Get current block for events
        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - 50000) // Look back further for comprehensive stats

        // Calculate user reports and total earnings
        let userReportsSubmitted = 0
        let validUserReports = 0
        let totalEarned = 0

        try {
          // Use correct event name and method
          const reportEvents = await climateContract.queryFilter(
            climateContract.filters.ReportCreated(null, account),
            fromBlock,
            currentBlock
          )

          // Check which reports belong to this user
          for (const event of reportEvents) {
            try {
              const reportId = event.args?.[0]
              if (reportId) {
                const report = await climateContract.getReport(reportId)
                userReportsSubmitted++
                if (report.status === 1) { // ReportStatus.Valid
                  validUserReports++
                  totalEarned += 20 // 20 CLT per validated report
                }
              }
            } catch (error) {
              continue // Skip invalid report indices
            }
          }
        } catch (error) {
          console.error("Error fetching report events:", error)
          
          // Fallback to direct contract calls for recent reports
          try {
            const reportCount = await climateContract.reportCount()
            const maxCheck = Math.min(Number(reportCount), 20) // Check last 20 reports only
            
            for (let i = Math.max(1, Number(reportCount) - maxCheck + 1); i <= Number(reportCount); i++) {
              try {
                const report = await climateContract.getReport(i)
                if (report.reporter.toLowerCase() === account.toLowerCase()) {
                  userReportsSubmitted++
                  if (report.status === 1) {
                    validUserReports++
                    totalEarned += 20
                  }
                }
              } catch (error) {
                continue
              }
            }
          } catch (fallbackError) {
            console.error("Fallback report fetching failed:", fallbackError)
          }
        }

        // Add initial staking bonus to total earned if user has staked
        if (parseFloat(bdagFormatted) >= 100) {
          totalEarned += 1000 // Initial 1000 CLT from staking
        }

        // Mock USD conversion (in production, fetch from oracle/API)
        const cltPriceUSD = 0.10 // $0.10 per CLT
        const cltBalanceUSD = (parseFloat(cltFormatted) * cltPriceUSD).toFixed(2)

        setStats({
          cltBalance: parseFloat(cltFormatted).toFixed(0),
          cltBalanceUSD: cltBalanceUSD,
          bdagStaked: parseFloat(bdagFormatted).toFixed(0),
          reportsSubmitted: userReportsSubmitted,
          validReports: validUserReports,
          totalEarned: totalEarned.toString(),
          isEligibleForMinting,
          unlockDays,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [account, isConnected, getContract, provider])

  const getReportAccuracy = () => {
    if (stats.reportsSubmitted === 0) return 0
    return Math.round((stats.validReports / stats.reportsSubmitted) * 100)
  }

  const statsConfig = [
    {
      title: "CLT Balance",
      value: stats.cltBalance,
      unit: "CLT",
      subtitle: `≈ $${stats.cltBalanceUSD}`,
      icon: CurrencyDollarIcon,
      color: "text-climate-green",
      badge: stats.isEligibleForMinting ? { text: "Eligible", color: "bg-climate-green/10 text-climate-green" } : null,
    },
    {
      title: "BDAG Staked",
      value: stats.bdagStaked,
      unit: "BDAG", 
      subtitle: stats.unlockDays > 0 ? `Locked ${stats.unlockDays} days` : parseFloat(stats.bdagStaked) >= 100 ? "Active" : "Inactive",
      icon: LockClosedIcon,
      color: "text-sky-blue",
      badge: parseFloat(stats.bdagStaked) >= 100 ? 
        { text: "Staked", color: "bg-sky-blue/10 text-sky-blue" } : 
        { text: "Need 100", color: "bg-amber-100 text-amber-800" },
    },
    {
      title: "Weather Reports",
      value: stats.reportsSubmitted.toString(),
      unit: "",
      subtitle: `${stats.validReports} validated • ${getReportAccuracy()}% accuracy`,
      icon: DocumentTextIcon,
      color: "text-green-600",
      badge: stats.reportsSubmitted > 0 ? 
        { text: `${getReportAccuracy()}% valid`, color: getReportAccuracy() >= 80 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800" } : 
        null,
    },
    {
      title: "Total Earned",
      value: stats.totalEarned,
      unit: "CLT",
      subtitle: userRole === "reporter" ? "From reports + staking" : "Platform rewards",
      icon: TrophyIcon,
      color: "text-amber-500",
      badge: parseInt(stats.totalEarned) >= 1000 ? 
        { text: "1K+ Club", color: "bg-amber-100 text-amber-800" } : 
        null,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  {stat.badge && (
                    <Badge className={cn("text-xs", stat.badge.color)}>
                      {stat.badge.text}
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline space-x-1 mt-2">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.unit && <p className="text-sm font-medium text-muted-foreground">{stat.unit}</p>}
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </div>
              <div className={cn("p-3 rounded-full bg-muted/50", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}