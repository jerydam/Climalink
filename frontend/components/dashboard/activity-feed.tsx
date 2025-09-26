"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, DocumentTextIcon, UserGroupIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline"
import { useWeb3 } from "@/lib/web3"
import { Loader2, Lock, Users } from "lucide-react"

interface Activity {
  id: string
  type: "validation" | "report" | "vote" | "reward" | "stake" | "dao_join"
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

        // Get current block number and look back for recent activities
        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - 2000) // Look back ~2000 blocks for recent activity

        try {
          // Fetch staking events (show as initial platform join)
          const stakeEvents = await tokenContract.queryFilter(
            tokenContract.filters.Stake(account),
            fromBlock,
            currentBlock
          )

          for (const event of stakeEvents.slice(-3)) {
            const block = await event.getBlock()
            const amount = event.args?.[1] || 0
            activities.push({
              id: `stake-${event.transactionHash}`,
              type: "stake",
              message: "Staked BDAG tokens and joined ClimaLink",
              reward: "+1000 CLT",
              time: formatTimeAgo(Number(block.timestamp) * 1000),
              icon: Lock,
              color: "text-sky-blue",
              txHash: event.transactionHash,
            })
          }
        } catch (error) {
          console.error("Error fetching stake events:", error)
        }

        try {
          // Fetch DAO membership events
          const daoJoinEvents = await daoContract.queryFilter(
            daoContract.filters.MemberJoined(account),
            fromBlock,
            currentBlock
          )

          for (const event of daoJoinEvents.slice(-2)) {
            const block = await event.getBlock()
            activities.push({
              id: `dao-join-${event.transactionHash}`,
              type: "dao_join",
              message: "Joined ClimaLink DAO as Validator",
              reward: "Role Upgrade",
              time: formatTimeAgo(Number(block.timestamp) * 1000),
              icon: Users,
              color: "text-purple-500",
              txHash: event.transactionHash,
            })
          }
        } catch (error) {
          console.error("Error fetching DAO events:", error)
        }

        try {
          // Fetch climate report events
          const reportEvents = await climateContract.queryFilter(
            climateContract.filters.ClimateEvent(),
            fromBlock,
            currentBlock
          )

          for (const event of reportEvents.slice(-5)) {
            const block = await event.getBlock()
            const reportId = event.args?.[0] || 0
            
            // Check if this report belongs to current user
            try {
              const report = await climateContract.getClimateReport(reportId)
              if (report.reporter.toLowerCase() === account.toLowerCase()) {
                const status = report.status === 1 ? "validated" : report.status === 2 ? "rejected" : "pending"
                activities.push({
                  id: `report-${event.transactionHash}`,
                  type: "report",
                  message: `Weather report #${reportId} ${status}`,
                  reward: status === "validated" ? "+20 CLT" : null,
                  time: formatTimeAgo(Number(block.timestamp) * 1000),
                  icon: DocumentTextIcon,
                  color: status === "validated" ? "text-climate-green" : "text-amber-500",
                  txHash: event.transactionHash,
                })
              }
            } catch (reportError) {
              // Skip if can't get report details
              continue
            }
          }
        } catch (error) {
          console.error("Error fetching report events:", error)
        }

        try {
          // Fetch validation events (votes cast by user)
          const validationEvents = await climateContract.queryFilter(
            climateContract.filters.ReportVoteCast(null, account),
            fromBlock,
            currentBlock
          )

          for (const event of validationEvents.slice(-5)) {
            const block = await event.getBlock()
            const reportId = event.args?.[0] || 0
            const voteChoice = event.args?.[2] || 0 // 0 = Invalid, 1 = Valid
            activities.push({
              id: `validation-${event.transactionHash}`,
              type: "validation",
              message: `Voted "${voteChoice === 1 ? 'Valid' : 'Invalid'}" on report #${reportId}`,
              reward: "+5 CLT", // Validator participation reward
              time: formatTimeAgo(Number(block.timestamp) * 1000),
              icon: CheckCircleIcon,
              color: "text-blue-500",
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

          for (const event of voteEvents.slice(-3)) {
            const block = await event.getBlock()
            const proposalId = event.args?.[0] || 0
            const voteType = event.args?.[2] || 0 // 0 = Against, 1 = For, 2 = Abstain
            const voteTypeText = voteType === 1 ? "For" : voteType === 0 ? "Against" : "Abstain"
            activities.push({
              id: `vote-${event.transactionHash}`,
              type: "vote",
              message: `Voted "${voteTypeText}" on Proposal #${proposalId}`,
              reward: "Governance Participation",
              time: formatTimeAgo(Number(block.timestamp) * 1000),
              icon: UserGroupIcon,
              color: "text-purple-500",
              txHash: event.transactionHash,
            })
          }
        } catch (error) {
          console.error("Error fetching vote events:", error)
        }

        try {
          // Fetch CLT mint/reward events
          const mintEvents = await tokenContract.queryFilter(
            tokenContract.filters.Mint(account),
            fromBlock,
            currentBlock
          )

          for (const event of mintEvents.slice(-5)) {
            const block = await event.getBlock()
            const amount = event.args?.[1] || 0
            const amountFormatted = (Number(amount) / 1e18).toFixed(0)
            
            // Determine reward type based on amount
            let rewardType = "Platform reward"
            if (amountFormatted === "1000") {
              rewardType = "Initial staking bonus"
            } else if (amountFormatted === "20") {
              rewardType = "Validated report reward"
            }
            
            activities.push({
              id: `mint-${event.transactionHash}`,
              type: "reward",
              message: rewardType,
              reward: `+${amountFormatted} CLT`,
              time: formatTimeAgo(Number(block.timestamp) * 1000),
              icon: CurrencyDollarIcon,
              color: "text-climate-green",
              txHash: event.transactionHash,
            })
          }
        } catch (error) {
          console.error("Error fetching mint events:", error)
        }

        // Sort activities by time (most recent first)
        activities.sort((a, b) => {
          const timeA = new Date(a.time.includes("ago") ? Date.now() : a.time).getTime()
          const timeB = new Date(b.time.includes("ago") ? Date.now() : b.time).getTime()
          return timeB - timeA
        })

        setActivities(activities.slice(0, 8)) // Show latest 8 activities
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentActivities()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRecentActivities, 30000)
    return () => clearInterval(interval)
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
        <CardTitle className="flex items-center justify-between">
          Recent Activity
          <Badge variant="secondary" className="bg-climate-green/10 text-climate-green">
            Live
          </Badge>
        </CardTitle>
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
            <p className="text-sm text-muted-foreground mt-1">
              Start by submitting a weather report to earn 20 CLT tokens!
            </p>
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
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "ml-2",
                          activity.reward.includes("CLT") && "bg-climate-green/10 text-climate-green",
                          activity.reward === "Role Upgrade" && "bg-purple-100 text-purple-800",
                          activity.reward === "Governance Participation" && "bg-blue-100 text-blue-800"
                        )}
                      >
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

        {/* Activity Summary */}
        {!isLoading && activities.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm font-bold text-climate-green">
                  {activities.filter(a => a.type === "report").length}
                </p>
                <p className="text-xs text-muted-foreground">Reports</p>
              </div>
              <div>
                <p className="text-sm font-bold text-blue-500">
                  {activities.filter(a => a.type === "validation").length}
                </p>
                <p className="text-xs text-muted-foreground">Validations</p>
              </div>
              <div>
                <p className="text-sm font-bold text-purple-500">
                  {activities.filter(a => a.type === "vote").length}
                </p>
                <p className="text-xs text-muted-foreground">DAO Votes</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}