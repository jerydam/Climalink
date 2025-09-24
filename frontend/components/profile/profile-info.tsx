"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Edit, Settings, Star, Loader2 } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { useRole } from "@/lib/roles"

interface ProfileStats {
  reportsSubmitted: number
  validationAccuracy: number
  daoParticipation: number
  totalCltEarned: number
  memberSince: string
  reputation: number
  totalRatings: number
}

export function ProfileInfo() {
  const [stats, setStats] = useState<ProfileStats>({
    reportsSubmitted: 0,
    validationAccuracy: 0,
    daoParticipation: 0,
    totalCltEarned: 0,
    memberSince: "",
    reputation: 0,
    totalRatings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const { account, isConnected, getContract, provider } = useWeb3()
  const { userRole } = useRole()

  useEffect(() => {
    const fetchProfileStats = async () => {
      if (!isConnected || !account || !provider) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const climateContract = getContract("CLIMATE")
        const tokenContract = getContract("TOKEN")
        const daoContract = getContract("DAO")

        // Initialize stats
        let reportsSubmitted = 0
        let validReports = 0
        let totalValidations = 0
        let validValidations = 0
        let totalCltEarned = 0
        let memberSince = ""
        let daoVotes = 0
        let totalProposals = 0

        // Get current block for time range calculations
        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - 50000) // Look back further for more data

        // Fetch user's reports
        const reportCount = await climateContract.reportCount()
        for (let i = 0; i < Math.min(Number(reportCount), 100); i++) {
          try {
            const report = await climateContract.reports(i)
            if (report.reporter.toLowerCase() === account.toLowerCase()) {
              reportsSubmitted++
              if (report.status === 1) { // Valid report
                validReports++
              }
            }
          } catch (error) {
            continue
          }
        }

        // Fetch validation events if user is validator or DAO member
        if (userRole === "validator" || userRole === "dao_member") {
          try {
            const validatedEvents = await climateContract.queryFilter(
              climateContract.filters.ReportValidated(null, account),
              fromBlock,
              currentBlock
            )
            
            const rejectedEvents = await climateContract.queryFilter(
              climateContract.filters.ReportRejected(null, account),
              fromBlock,
              currentBlock
            )

            totalValidations = validatedEvents.length + rejectedEvents.length
            validValidations = validatedEvents.length
          } catch (error) {
            console.error("Error fetching validation events:", error)
          }
        }

        // Fetch DAO participation if user is DAO member
        if (userRole === "dao_member") {
          try {
            const voteEvents = await daoContract.queryFilter(
              daoContract.filters.VoteCast(null, account),
              fromBlock,
              currentBlock
            )
            
            daoVotes = voteEvents.length

            // Get total proposals count for participation calculation
            totalProposals = Number(await daoContract.proposalCount())
          } catch (error) {
            console.error("Error fetching DAO events:", error)
          }
        }

        // Fetch CLT earned from mint events
        try {
          const mintEvents = await tokenContract.queryFilter(
            tokenContract.filters.Mint(account),
            fromBlock,
            currentBlock
          )

          for (const event of mintEvents) {
            const amount = event.args?.[1] || 0
            totalCltEarned += Number(amount) / 1e18
          }
        } catch (error) {
          console.error("Error fetching mint events:", error)
        }

        // Calculate member since date (simplified - using first transaction)
        try {
          // Try to get the user's first staking event or first report
          const stakeEvents = await tokenContract.queryFilter(
            tokenContract.filters.Stake(account),
            0,
            currentBlock
          )

          if (stakeEvents.length > 0) {
            const firstEvent = stakeEvents[0]
            const block = await firstEvent.getBlock()
            memberSince = new Date(Number(block.timestamp) * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short'
            })
          } else {
            memberSince = "Recent"
          }
        } catch (error) {
          memberSince = "2024"
        }

        // Calculate reputation based on validation accuracy and report validity
        let reputation = 0
        let totalRatings = 0

        if (totalValidations > 0) {
          const validationAccuracy = (validValidations / totalValidations) * 100
          reputation += (validationAccuracy / 100) * 2.5 // Max 2.5 points from validation
          totalRatings += totalValidations
        }

        if (reportsSubmitted > 0) {
          const reportAccuracy = (validReports / reportsSubmitted) * 100
          reputation += (reportAccuracy / 100) * 2.5 // Max 2.5 points from reports
          totalRatings += reportsSubmitted
        }

        // Ensure reputation is between 0 and 5
        reputation = Math.min(5, Math.max(0, reputation))

        const validationAccuracy = totalValidations > 0 ? (validValidations / totalValidations) * 100 : 0
        const daoParticipation = totalProposals > 0 ? (daoVotes / totalProposals) * 100 : 0

        setStats({
          reportsSubmitted,
          validationAccuracy: Math.round(validationAccuracy),
          daoParticipation: Math.round(daoParticipation),
          totalCltEarned: Math.round(totalCltEarned),
          memberSince,
          reputation: Math.round(reputation * 10) / 10, // Round to 1 decimal
          totalRatings,
        })
      } catch (error) {
        console.error("Error fetching profile stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileStats()
  }, [account, isConnected, getContract, provider, userRole])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "dao_member":
        return "DAO Member"
      case "reporter":
        return "Reporter"
      case "validator":
        return "Validator"
      default:
        return "Member"
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "dao_member":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "validator":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "reporter":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile information...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-lg">
              {account ? account.slice(2, 4).toUpperCase() : "??"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-semibold">
                {account ? formatAddress(account) : "Not Connected"}
              </h3>
              <Badge className={getRoleBadgeColor(userRole)}>
                {getRoleDisplayName(userRole)}
              </Badge>
            </div>
            <p className="text-muted-foreground">Member since: {stats.memberSince}</p>
            {stats.totalRatings > 0 && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-current" />
                <span className="font-medium">Reputation: {stats.reputation}/5.0</span>
                <Badge variant="secondary">({stats.totalRatings} activities)</Badge>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-climate-green">{stats.reportsSubmitted}</p>
            <p className="text-sm text-muted-foreground">Reports Submitted</p>
          </div>
          
          {(userRole === "validator" || userRole === "dao_member") && (
            <div className="text-center">
              <p className="text-2xl font-bold text-sky-blue">{stats.validationAccuracy}%</p>
              <p className="text-sm text-muted-foreground">Validation Accuracy</p>
            </div>
          )}
          
          {userRole === "dao_member" && (
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{stats.daoParticipation}%</p>
              <p className="text-sm text-muted-foreground">DAO Participation</p>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-500">{stats.totalCltEarned}</p>
            <p className="text-sm text-muted-foreground">Total CLT Earned</p>
          </div>
          
          {/* Fill remaining space if needed */}
          {userRole === "reporter" && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">
                  {stats.reportsSubmitted > 0 ? Math.round((stats.reportsSubmitted / (stats.reportsSubmitted + 1)) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Report Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">N/A</p>
                <p className="text-sm text-muted-foreground">DAO Participation</p>
              </div>
            </>
          )}
        </div>

        {/* Role-specific information */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Role Information</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {userRole === "dao_member" && (
              <>
                <p>• Full access to all ClimaLink features</p>
                <p>• Can validate reports and vote on proposals</p>
                <p>• Earns staking rewards from BDAG tokens</p>
              </>
            )}
            {userRole === "validator" && (
              <>
                <p>• Can validate community weather reports</p>
                <p>• Earns CLT tokens for accurate validations</p>
                <p>• Helps maintain data quality and integrity</p>
              </>
            )}
            {userRole === "reporter" && (
              <>
                <p>• Can submit weather reports from any location</p>
                <p>• Earns CLT tokens for validated reports</p>
                <p>• Contributes to global climate data collection</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}