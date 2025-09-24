"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, DocumentTextIcon, UserGroupIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline"
import { useWeb3 } from "@/lib/web3"
import { Loader2 } from "lucide-react"

interface Activity {
  id: string
  type: "validation" | "report" | "vote" | "reward" | "stake"
  message: string
  reward: string | null
  time: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  txHash?: string
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { account, isConnected, getContract, provider } = useWeb3()

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!isConnected || !account || !provider) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const tokenContract = getContract("TOKEN")
        const climateContract = getContract("CLIMATE")
        const daoContract = getContract("DAO")

        const activities: Activity[] = []

        // Get current block number and look back ~1000 blocks (roughly last few hours)
        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - 1000)

        try {
          // Fetch token minting events (rewards)
          const mintEvents = await tokenContract.queryFilter(
            tokenContract.filters.Mint(account),
            fromBlock,
            currentBlock
          )

          for (const event of mintEvents.slice(-5)) { // Get last 5 events
            const block = await event.getBlock()
            const amount = event.args?.[1] || 0
            activities.push({
              id: `mint-${event.transactionHash}`,
              type: "reward",
              message: "Earned CLT tokens from platform activities",
              reward: `+${(Number(amount) / 1e18).toFixed(0)} CLT`,
              time: formatTimeAgo(Number(block.timestamp) * 1000),
              icon: CurrencyDollarIcon,
              color: "text-success",
              txHash: event.transactionHash,
            })
          }
        } catch (error) {
          console.error("Error fetching mint events:", error)
        }

        try {
          // Fetch climate report events
          const reportEvents = await climateContract.queryFilter(
            climateContract.filters.ClimateEvent(),
            fromBlock,
            currentBlock
          )

          for (const event of reportEvents.slice(-3)) { // Get last 3 events
            const block = await event.getBlock()
            const reportId = event.args?.[0] || 0
            activities.push({
              id: `report-${event.transactionHash}`,
              type: "report",
              message: `Climate report #${reportId} submitted`,
              reward: "+20 CLT",
              time: formatTimeAgo(Number(block.timestamp) * 1000),
              icon: DocumentTextIcon,
              color: "text-primary",
              txHash: event.transactionHash,
            })
          }
        } catch (error) {
          console.error("Error fetching report events:", error)
        }

        try {
          // Fetch validation events
          const validationEvents = await climateContract.queryFilter(
            climateContract.filters.ReportValidated(),
            fromBlock,
            currentBlock
          )

          for (const event of validationEvents.slice(-3)) { // Get last 3 events
            const block = await event.getBlock()
            const reportId = event.args?.[0] || 0
            activities.push({
              id: `validation-${event.transactionHash}`,
              type: "validation",
              message: `Report #${reportId} was validated`,
              reward: "+10 CLT",
              time: formatTimeAgo(Number(block.timestamp) * 1000),
              icon: CheckCircleIcon,
              color: "text-success",
              txHash: event.transactionHash,
            })
          }
        } catch (error) {
          console.error("Error fetching validation events:", error)
        }

        try {
          // Fetch DAO vote events
          const voteEvents = await daoContract.queryFilter(
            daoContract.filters.VoteCast(null, account),
            fromBlock,
            currentBlock
          )

          for (const event of voteEvents.slice(-3)) { // Get last 3 events
            const block = await event.getBlock()
            const proposalId = event.args?.[0] || 0
            activities.push({
              id: `vote-${event.transactionHash}`,
              type: "vote",
              message: `Voted on Proposal #${proposalId}`,
              reward: null,
              time: formatTimeAgo(Number(block.timestamp) * 1000),
              icon: UserGroupIcon,
              color: "text-secondary",
              txHash: event.transactionHash,
            })
          }
        } catch (error) {
          console.error("Error fetching vote events:", error)
        }

        // Sort activities by time (most recent first)
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

        setActivities(activities.slice(0, 6)) // Show only latest 6 activities
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentActivities()
  }, [account, isConnected, getContract, provider])

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    return "Just now"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading recent activities...</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent activities found</p>
            <p className="text-sm text-muted-foreground mt-1">Start by submitting a climate report!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={cn("p-2 rounded-full bg-muted/50", activity.color)}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.message}</p>
                    {activity.reward && (
                      <Badge variant="secondary" className="ml-2">
                        {activity.reward}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                    {activity.txHash && (
                      <button
                        onClick={() => window.open(`https://etherscan.io/tx/${activity.txHash}`, "_blank")}
                        className="text-xs text-blue-500 hover:text-blue-600 underline"
                      >
                        View Tx
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}