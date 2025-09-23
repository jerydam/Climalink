import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Award } from "lucide-react"

export function EarningsAnalytics() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-climate-green" />
          Earnings Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">[Line Chart: CLT Earned Over Time]</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-climate-green">160 CLT</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Last Month</p>
            <p className="text-2xl font-bold">140 CLT</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <p className="text-2xl font-bold">890 CLT</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            Top Earning Activities
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Climate Reports</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="w-3/5 bg-climate-green h-2 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">540 CLT (61%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Initial Staking</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="w-2/5 bg-sky-blue h-2 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">350 CLT (39%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
