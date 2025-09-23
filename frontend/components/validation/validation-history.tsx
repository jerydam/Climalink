"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartBarIcon } from "@heroicons/react/24/outline"

interface ValidationRecord {
  reportId: string
  location: string
  decision: "valid" | "invalid"
  date: string
}

interface ValidationHistoryProps {
  validations: ValidationRecord[]
  accuracyRate: number
  totalRewards: number
}

export function ValidationHistory({ validations, accuracyRate, totalRewards }: ValidationHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ChartBarIcon className="w-5 h-5" />
          <span>Your Validation History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{accuracyRate}%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              <div className="text-xs text-muted-foreground mt-1">
                ({Math.floor((accuracyRate / 100) * validations.length)}/{validations.length} correct)
              </div>
            </div>
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{totalRewards}</div>
              <div className="text-sm text-muted-foreground">CLT Earned</div>
              <div className="text-xs text-muted-foreground mt-1">Community Service</div>
            </div>
          </div>

          {/* Validation Table */}
          <div className="space-y-3">
            <h4 className="font-medium">Recent Validations</h4>
            <div className="space-y-2">
              {validations.length > 0 ? (
                validations.map((validation) => (
                  <div
                    key={validation.reportId}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm">#{validation.reportId}</span>
                      <span className="text-sm">{validation.location}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={validation.decision === "valid" ? "default" : "destructive"}>
                        {validation.decision === "valid" ? "✅ Valid" : "❌ Invalid"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{validation.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No validations yet</p>
                  <p className="text-sm">Start validating reports to build your history</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
