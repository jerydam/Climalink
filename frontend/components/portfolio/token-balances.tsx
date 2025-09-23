import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, Lock, Gift } from "lucide-react"

export function TokenBalances() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CLT Balance</CardTitle>
          <Coins className="h-4 w-4 text-climate-green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,520.00</div>
          <p className="text-xs text-muted-foreground">≈ $152.00</p>
          <Button size="sm" className="mt-3 w-full bg-climate-green hover:bg-climate-green/90">
            Transfer
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BDAG Staked</CardTitle>
          <Lock className="h-4 w-4 text-sky-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">100.00</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              Locked
            </Badge>
            <span className="text-xs text-muted-foreground">25 days</span>
          </div>
          <Button size="sm" variant="outline" className="mt-3 w-full bg-transparent">
            Unstake
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
          <Gift className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">60.00</div>
          <p className="text-xs text-muted-foreground">≈ $6.00</p>
          <Button size="sm" className="mt-3 w-full bg-amber-500 hover:bg-amber-600">
            Claim
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
