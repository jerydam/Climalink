import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Plus, AlertTriangle } from "lucide-react"

export function StakingDashboard() {
  const unlockProgress = 75 // 75% complete
  const daysLeft = 25

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-sky-blue" />
          BDAG Staking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Stake</p>
              <p className="text-2xl font-bold">100.00 BDAG</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Stake Date</p>
              <p className="font-medium">February 15, 2024</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Unlock Date</p>
              <p className="font-medium">March 16, 2024 ({daysLeft} days left)</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-sky-blue" />
                <span className="font-medium text-sky-blue">Locked</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Unlock Progress</p>
                <span className="text-sm font-medium">{unlockProgress}%</span>
              </div>
              <Progress value={unlockProgress} className="h-3" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Available to Stake</p>
              <p className="text-xl font-bold">50.00 BDAG</p>
            </div>

            <Button className="w-full bg-sky-blue hover:bg-sky-blue/90">
              <Plus className="h-4 w-4 mr-2" />
              Stake More BDAG
            </Button>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Warning: Unstaking will remove you from DAO membership and you'll lose voting rights.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
