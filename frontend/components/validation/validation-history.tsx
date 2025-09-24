"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { History, TrendingUp, Award, CheckCircle, XCircle } from "lucide-react"

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
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                <p className="text-2xl font-bold text-climate-green">{accuracyRate}%</p>
              </div>
              <div className="w-12 h-12 bg-climate-green/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-climate-green" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={accuracyRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Validations</p>
                <p className="text-2xl font-bold">{validations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <History className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rewards Earned</p>
                <p className="text-2xl font-bold">{totalRewards} CLT</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Validations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validations.length > 0 ? (
            <div className="space-y-4">
              {validations.map((validation, index) => (
                <div
                  key={`${validation.reportId}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        validation.decision === "valid"
                          ? "bg-climate-green/10 text-climate-green"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {validation.decision === "valid" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Report #{validation.reportId}</p>
                      <p className="text-sm text-muted-foreground">{validation.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={validation.decision === "valid" ? "default" : "destructive"}
                      className={
                        validation.decision === "valid"
                          ? "bg-climate-green hover:bg-climate-green/80"
                          : ""
                      }
                    >
                      {validation.decision === "valid" ? "Valid" : "Invalid"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{validation.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No validation history yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start validating reports to see your history here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}