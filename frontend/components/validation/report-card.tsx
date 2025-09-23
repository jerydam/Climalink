"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPinIcon, UserIcon } from "@heroicons/react/24/outline"

interface Report {
  id: string
  location: string
  weather: string
  temperature: number
  humidity: number
  timeAgo: string
  reporter: string
  weatherIcon: string
}

interface ReportCardProps {
  report: Report
  onViewDetails: (report: Report) => void
}

export function ReportCard({ report, onViewDetails }: ReportCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Badge variant="outline">Report #{report.id}</Badge>
            <span className="text-xs text-muted-foreground">{report.timeAgo}</span>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-4 h-4 text-primary" />
            <span className="font-medium">{report.location}</span>
          </div>

          {/* Weather Info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{report.weatherIcon}</span>
              <span className="font-medium">{report.weather}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>🌡️ {report.temperature}°C</div>
              <div>💧 {report.humidity}%</div>
            </div>
          </div>

          {/* Reporter */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <UserIcon className="w-4 h-4" />
            <span>{report.reporter}</span>
          </div>

          {/* Action Button */}
          <Button onClick={() => onViewDetails(report)} className="w-full" variant="outline">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
