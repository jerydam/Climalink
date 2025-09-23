import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Award, Medal, Target, Globe, Flame } from "lucide-react"

export function Achievements() {
  const achievements = [
    { icon: Medal, name: "First Report", description: "Submit your first weather report", earned: true },
    { icon: Target, name: "100 Validations", description: "Validate 100 community reports", earned: true },
    { icon: Award, name: "Active Voter", description: "Participate in 10 DAO proposals", earned: true },
    { icon: Globe, name: "Globe Trotter", description: "Submit reports from 5 different countries", earned: true },
    { icon: Target, name: "Perfect Week", description: "Submit reports for 7 consecutive days", earned: true },
    { icon: Trophy, name: "Top Contributor", description: "Be in top 10% of monthly contributors", earned: false },
  ]

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border text-center ${
                achievement.earned ? "bg-amber-50 border-amber-200" : "bg-muted/50 border-muted opacity-60"
              }`}
            >
              <achievement.icon
                className={`h-8 w-8 mx-auto mb-2 ${achievement.earned ? "text-amber-500" : "text-muted-foreground"}`}
              />
              <h4 className="font-medium text-sm">{achievement.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
              {achievement.earned && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  Earned
                </Badge>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Progress Towards Next Badge:</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Climate Champion</span>
              </div>
              <span className="text-sm text-muted-foreground">7/10 consecutive days</span>
            </div>
            <Progress value={70} className="h-2" />
            <p className="text-xs text-muted-foreground">70% complete</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
