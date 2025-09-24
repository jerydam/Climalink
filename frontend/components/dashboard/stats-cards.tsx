"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { CurrencyDollarIcon, LockClosedIcon, DocumentTextIcon, TrophyIcon } from "@heroicons/react/24/outline"
import { useWeb3 } from "@/lib/web3"
import { ethers } from "ethers"
import { Loader2 } from "lucide-react"

interface StatsData {
  cltBalance: string
  cltBalanceUSD: string
  bdagStaked: string
  reportsSubmitted: number
  validReports: number
  rewardsEarned: string
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    cltBalance: "0",
    cltBalanceUSD: "0",
    bdagStaked: "0",
    reportsSubmitted: 0,
    validReports: 0,
    rewardsEarned: "0",
  })
  const [isLoading, setIsLoading] = useState(true)
  const { account, isConnected, getContract } = useWeb3()

  useEffect(() => {
    const fetchStats = async () => {
      if (!isConnected || !account) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const tokenContract = getContract("TOKEN")
        const climateContract = getContract("CLIMATE")

        // Fetch CLT balance
        const cltBalance = await tokenContract.balanceOf(account)
        const cltFormatted = ethers.formatEther(cltBalance)

        // Fetch BDAG staked amount
        const bdagStaked = await tokenContract.getStakedAmount(account)
        const bdagFormatted = ethers.formatEther(bdagStaked)

        // Calculate reports statistics
        const reportCount = await climateContract.reportCount()
        let userReportsSubmitted = 0
        let validUserReports = 0
        let totalRewards = BigInt(0)

        // Iterate through reports to find user's reports
        // Note: In a production app, you'd want to use events or indexed queries for efficiency
        for (let i = 0; i < Math.min(Number(reportCount), 100); i++) { // Limit to avoid gas issues
          try {
            const report = await climateContract.reports(i)
            if (report.reporter.toLowerCase() === account.toLowerCase()) {
              userReportsSubmitted++
              if (report.status === 1) { // Assuming 1 = Valid status
                validUserReports++
                totalRewards += await tokenContract.REPORT_REWARD() // Add report reward
              }
            }
          } catch (error) {
            // Skip if report doesn't exist or error occurs
            continue
          }
        }

        // Mock USD conversion (in production, fetch from oracle or API)
        const cltPriceUSD = 0.10 // $0.10 per CLT
        const cltBalanceUSD = (parseFloat(cltFormatted) * cltPriceUSD).toFixed(2)

        setStats({
          cltBalance: parseFloat(cltFormatted).toFixed(0),
          cltBalanceUSD: cltBalanceUSD,
          bdagStaked: parseFloat(bdagFormatted).toFixed(0),
          reportsSubmitted: userReportsSubmitted,
          validReports: validUserReports,
          rewardsEarned: ethers.formatEther(totalRewards),
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        // Keep default values on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [account, isConnected, getContract])

  const statsConfig = [
    {
      title: "CLT Balance",
      value: stats.cltBalance,
      unit: "CLT",
      subtitle: `≈ $${stats.cltBalanceUSD}`,
      icon: CurrencyDollarIcon,
      color: "text-primary",
    },
    {
      title: "BDAG Staked",
      value: stats.bdagStaked,
      unit: "BDAG",
      subtitle: "(Locked)",
      icon: LockClosedIcon,
      color: "text-secondary",
    },
    {
      title: "Reports Submitted",
      value: stats.reportsSubmitted.toString(),
      unit: "",
      subtitle: `${stats.validReports} Valid`,
      icon: DocumentTextIcon,
      color: "text-success",
    },
    {
      title: "Rewards Earned",
      value: parseFloat(stats.rewardsEarned).toFixed(0),
      unit: "CLT",
      subtitle: "This Month",
      icon: TrophyIcon,
      color: "text-warning",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
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