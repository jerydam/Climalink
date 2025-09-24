"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Award, Medal, Target, Globe, Flame, Shield, Vote, Coins, Users, Loader2 } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { useRole } from "@/lib/roles"

interface Achievement {
  icon: React.ComponentType<{ className?: string }>
  name: string
  description: string
  earned: boolean
  progress?: number
  maxProgress?: number
  rarity?: "common" | "rare" | "epic" | "legendary"
}

interface AchievementProgress {
  name: string
  progress: number
  maxProgress: number
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [progressTracker, setProgressTracker] = useState<AchievementProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { account, isConnected, getContract, provider } = useWeb3()
  const { userRole } = useRole()

  useEffect(() => {
    const calculateAchievements = async () => {
      if (!isConnected || !account || !provider) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const climateContract = getContract("CLIMATE")
        const tokenContract = getContract("TOKEN")
        const daoContract = getContract("DAO")

        // Initialize tracking variables
        let reportsSubmitted = 0
        let validReports = 0
        let validationsPerformed = 0
        let daoVotes = 0
        let uniqueLocations = new Set<string>()
        let cltBalance = 0
        let consecutiveDays = 0
        let isDAOMember = false
        let reportDates: number[] = []
        let validationAccuracy = 0

        // Get current block for time range
        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - 100000)

        // Check DAO membership
        if (userRole === "dao_member") {
          isDAOMember = await daoContract.isMember(account)
        }

        // Get CLT balance
        const balance = await tokenContract.balanceOf(account)
        cltBalance = Number(balance) / 1e18

        // Fetch user's reports
        const reportCount = await climateContract.reportCount()
        for (let i = 0; i < Math.min(Number(reportCount), 200); i++) {
          try {
            const report = await climateContract.reports(i)
            if (report.reporter.toLowerCase() === account.toLowerCase()) {
              reportsSubmitted++
              reportDates.push(Number(report.timestamp))
              
              // Track unique locations
              const location = report.location.split(',')[0].trim()
              uniqueLocations.add(location.toLowerCase())
              
              if (report.status === 1) { // Valid report
                validReports++
              }
            }
          } catch (error) {
            continue
          }
        }

        // Calculate consecutive days
        if (reportDates.length > 0) {
          reportDates.sort((a, b) => a - b)
          let currentStreak = 1
          let maxStreak = 1
          
          for (let i = 1; i < reportDates.length; i++) {
            const daysDiff = Math.floor((reportDates[i] - reportDates[i-1]) / (24 * 60 * 60))
            if (daysDiff <= 1) {
              currentStreak++
              maxStreak = Math.max(maxStreak, currentStreak)
            } else {
              currentStreak = 1
            }
          }
          consecutiveDays = maxStreak
        }

        // Fetch validation events
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

            const totalValidations = validatedEvents.length + rejectedEvents.length
            validationsPerformed = totalValidations
            validationAccuracy = totalValidations > 0 ? (validatedEvents.length / totalValidations) * 100 : 0
          } catch (error) {
            console.error("Error fetching validation events:", error)
          }
        }

        // Fetch DAO votes
        if (userRole === "dao_member") {
          try {
            const voteEvents = await daoContract.queryFilter(
              daoContract.filters.VoteCast(null, account),
              fromBlock,
              currentBlock
            )
            daoVotes = voteEvents.length
          } catch (error) {
            console.error("Error fetching vote events:", error)
          }
        }

        // Define achievements based on calculated stats
        const calculatedAchievements: Achievement[] = [
          {
            icon: Medal,
            name: "First Steps",
            description: "Submit your first weather report",
            earned: reportsSubmitted >= 1,
            rarity: "common"
          },
          {
            icon: Shield,
            name: "Validator Initiate",
            description: "Perform your first report validation",
            earned: validationsPerformed >= 1,
            rarity: "common"
          },
          {
            icon: Vote,
            name: "Voice Heard",
            description: "Cast your first DAO vote",
            earned: daoVotes >= 1,
            rarity: "common"
          },
          {
            icon: Users,
            name: "DAO Member",
            description: "Join the ClimaLink DAO",
            earned: isDAOMember,
            rarity: "rare"
          },
          {
            icon: Target,
            name: "Dedicated Reporter",
            description: "Submit 10 weather reports",
            earned: reportsSubmitted >= 10,
            progress: reportsSubmitted,
            maxProgress: 10,
            rarity: "common"
          },
          {
            icon: Award,
            name: "Validation Expert",
            description: "Validate 50 community reports",
            earned: validationsPerformed >= 50,
            progress: validationsPerformed,
            maxProgress: 50,
            rarity: "rare"
          },
          {
            icon: Globe,
            name: "Globe Trotter",
            description: "Submit reports from 5 different locations",
            earned: uniqueLocations.size >= 5,
            progress: uniqueLocations.size,
            maxProgress: 5,
            rarity: "rare"
          },
          {
            icon: Flame,
            name: "Perfect Week",
            description: "Submit reports for 7 consecutive days",
            earned: consecutiveDays >= 7,
            progress: consecutiveDays,
            maxProgress: 7,
            rarity: "epic"
          },
          {
            icon: Coins,
            name: "Token Collector",
            description: "Earn 1000 CLT tokens",
            earned: cltBalance >= 1000,
            progress: Math.min(cltBalance, 1000),
            maxProgress: 1000,
            rarity: "rare"
          },
          {
            icon: Trophy,
            name: "Climate Champion",
            description: "Submit reports for 30 consecutive days",
            earned: consecutiveDays >= 30,
            progress: consecutiveDays,
            maxProgress: 30,
            rarity: "legendary"
          }
        ]

        setAchievements(calculatedAchievements)

        // Set progress tracker for the next closest achievement
        const unearned = calculatedAchievements.filter(a => !a.earned && a.progress !== undefined)
        if (unearned.length > 0) {
          // Sort by progress percentage and take the closest one
          const closest = unearned.sort((a, b) => {
            const aPercent = ((a.progress || 0) / (a.maxProgress || 1)) * 100
            const bPercent = ((b.progress || 0) / (b.maxProgress || 1)) * 100
            return bPercent - aPercent
          })[0]

          setProgressTracker({
            name: closest.name,
            progress: closest.progress || 0,
            maxProgress: closest.maxProgress || 1,
            description: closest.description,
            icon: closest.icon
          })
        }

      } catch (error) {
        console.error("Error calculating achievements:", error)
      } finally {
        setIsLoading(false)
      }
    }

    calculateAchievements()
  }, [account, isConnected, getContract, provider, userRole])

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300 bg-gray-50"
      case "rare":
        return "border-blue-300 bg-blue-50"
      case "epic":
        return "border-purple-300 bg-purple-50"
      case "legendary":
        return "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50"
      default:
        return "border-gray-300 bg-gray-50"
    }
  }

  const getRarityBadgeColor = (rarity?: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800"
      case "rare":
        return "bg-blue-100 text-blue-800"
      case "epic":
        return "bg-purple-100 text-purple-800"
      case "legendary":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Calculating achievements...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const earnedCount = achievements.filter(a => a.earned).length
  const totalCount = achievements.length

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Achievements
          </div>
          <Badge variant="secondary">
            {earnedCount}/{totalCount} Earned
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Achievement Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`relative p-4 rounded-lg border text-center transition-all duration-200 ${
                achievement.earned 
                  ? `${getRarityColor(achievement.rarity)} shadow-sm hover:shadow-md` 
                  : "bg-muted/30 border-muted opacity-60 hover:opacity-80"
              }`}
            >
              {/* Rarity indicator */}
              {achievement.earned && achievement.rarity && achievement.rarity !== "common" && (
                <div className="absolute -top-1 -right-1">
                  <Badge className={`text-xs px-1 py-0 ${getRarityBadgeColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </Badge>
                </div>
              )}

              <achievement.icon
                className={`h-8 w-8 mx-auto mb-2 ${
                  achievement.earned 
                    ? achievement.rarity === "legendary" 
                      ? "text-amber-500" 
                      : achievement.rarity === "epic"
                      ? "text-purple-500"
                      : achievement.rarity === "rare"
                      ? "text-blue-500"
                      : "text-climate-green"
                    : "text-muted-foreground"
                }`}
              />
              <h4 className="font-medium text-sm mb-1">{achievement.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
              
              {achievement.earned ? (
                <Badge variant="secondary" className="text-xs bg-climate-green text-white">
                  Earned
                </Badge>
              ) : achievement.progress !== undefined ? (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {achievement.progress}/{achievement.maxProgress}
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-1" 
                  />
                </div>
              ) : (
                <Badge variant="outline" className="text-xs opacity-60">
                  Locked
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Progress Towards Next Achievement */}
        {progressTracker && (
          <div className="space-y-3">
            <h4 className="font-semibold">Progress Towards Next Achievement:</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <progressTracker.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{progressTracker.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {progressTracker.progress}/{progressTracker.maxProgress}
                </span>
              </div>
              <Progress 
                value={(progressTracker.progress / progressTracker.maxProgress) * 100} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground">
                {Math.round((progressTracker.progress / progressTracker.maxProgress) * 100)}% complete
              </p>
              <p className="text-sm text-muted-foreground">{progressTracker.description}</p>
            </div>
          </div>
        )}

        {/* Achievement Statistics */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Achievement Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-climate-green">{earnedCount}</p>
              <p className="text-xs text-muted-foreground">Earned</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-500">
                {achievements.filter(a => a.earned && a.rarity === "legendary").length}
              </p>
              <p className="text-xs text-muted-foreground">Legendary</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-500">
                {achievements.filter(a => a.earned && a.rarity === "epic").length}
              </p>
              <p className="text-xs text-muted-foreground">Epic</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-500">
                {achievements.filter(a => a.earned && a.rarity === "rare").length}
              </p>
              <p className="text-xs text-muted-foreground">Rare</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}