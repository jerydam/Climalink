"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, User, Thermometer, Droplets, Eye } from "lucide-react"

interface Report {
  id: string
  location: string
  weather: string
  temperature: number
  humidity: number
  timeAgo: string
  reporter: string
  weatherIcon: string
  submittedAt?: string
  coordinates?: { lat: number; lng: number }
  status: number
  validationCount: number
}

interface ReportCardProps {
  report: Report
  onViewDetails: (report: Report) => void
}

export function ReportCard({ report, onViewDetails }: ReportCardProps) {
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-amber-100 text-amber-800 border-amber-200"
      case 1:
        return "bg-green-100 text-green-800 border-green-200"
      case 2:
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Pending"
      case 1:
        return "Valid"
      case 2:
        return "Invalid"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{report.weatherIcon}</span>
              <div>
                <h3 className="font-semibold capitalize">{report.weather}</h3>
                <p className="text-sm text-muted-foreground">Report #{report.id}</p>
              </div>
            </div>
            <Badge className={getStatusColor(report.status)}>
              {getStatusText(report.status)}
            </Badge>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{report.location}</span>
          </div>

          {/* Weather Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-lg font-bold">{report.temperature}°C</p>
                <p className="text-xs text-muted-foreground">Temperature</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{report.humidity}%</p>
                <p className="text-xs text-muted-foreground">Humidity</p>
              </div>
            </div>
          </div>

          {/* Reporter Info */}
          <div className="flex items-center justify-between text-sm border-t pt-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs">{report.reporter}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{report.timeAgo}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(report)}
              className="flex-1 bg-transparent"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>

          {/* Validation Count */}
          {report.validationCount > 0 && (
            <div className="text-xs text-muted-foreground text-center">
              {report.validationCount} validation{report.validationCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}