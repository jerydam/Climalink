"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPinIcon, ClockIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline"

interface SubmissionSummaryProps {
  location: string
  coordinates: { lat: number; lng: number }
  temperature: number
  humidity: number
  weather: string
  notes: string
  photo?: File
  onSubmit: () => void
  onEdit: () => void
}

const weatherIcons: Record<string, string> = {
  sunny: "☀️",
  cloudy: "☁️",
  rainy: "🌧️",
  stormy: "⛈️",
  snowy: "❄️",
  foggy: "🌫️",
  windy: "💨",
}

export function SubmissionSummary({
  location,
  coordinates,
  temperature,
  humidity,
  weather,
  notes,
  photo,
  onSubmit,
  onEdit,
}: SubmissionSummaryProps) {
  const weatherIcon = weatherIcons[weather] || "🌤️"
  const weatherLabel = weather.charAt(0).toUpperCase() + weather.slice(1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📋</span>
          <span>Report Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location */}
        <div className="flex items-start space-x-3">
          <MapPinIcon className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">{location}</p>
            <p className="text-sm text-muted-foreground">
              {coordinates.lat.toFixed(4)}°N, {Math.abs(coordinates.lng).toFixed(4)}°W
            </p>
          </div>
        </div>

        {/* Weather Data */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{temperature}°C</div>
            <div className="text-sm text-muted-foreground">Temperature</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-secondary">{humidity}%</div>
            <div className="text-sm text-muted-foreground">Humidity</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl">{weatherIcon}</div>
            <div className="text-sm text-muted-foreground">{weatherLabel}</div>
          </div>
        </div>

        {/* Additional Notes */}
        {notes && (
          <div>
            <h4 className="font-medium mb-2">Additional Notes</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{notes}</p>
          </div>
        )}

        {/* Photo */}
        {photo && (
          <div>
            <h4 className="font-medium mb-2">Attached Photo</h4>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">📸 {photo.name}</div>
          </div>
        )}

        {/* Reward Information */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="w-5 h-5 text-primary" />
              <span className="font-medium">Potential Reward</span>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              20 CLT
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Validation Time</span>
            </div>
            <span className="text-sm text-muted-foreground">~24-48 hours</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onSubmit} className="flex-1">
            🚀 Submit Report
          </Button>
          <Button variant="outline" onClick={onEdit} className="flex-1 bg-transparent">
            ✏️ Edit Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
