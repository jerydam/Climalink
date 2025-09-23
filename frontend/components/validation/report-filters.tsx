"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

interface ReportFiltersProps {
  location: string
  timeFilter: string
  weatherFilter: string
  onLocationChange: (value: string) => void
  onTimeFilterChange: (value: string) => void
  onWeatherFilterChange: (value: string) => void
}

export function ReportFilters({
  location,
  timeFilter,
  weatherFilter,
  onLocationChange,
  onTimeFilterChange,
  onWeatherFilterChange,
}: ReportFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MagnifyingGlassIcon className="w-5 h-5" />
          <span>Filter Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Select value={location} onValueChange={onLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌍 All Locations</SelectItem>
                <SelectItem value="miami">📍 Miami, FL</SelectItem>
                <SelectItem value="nyc">📍 New York, NY</SelectItem>
                <SelectItem value="la">📍 Los Angeles, CA</SelectItem>
                <SelectItem value="chicago">📍 Chicago, IL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Time Period</label>
            <Select value={timeFilter} onValueChange={onTimeFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Last 24h" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">📅 Last 24 hours</SelectItem>
                <SelectItem value="7d">📅 Last 7 days</SelectItem>
                <SelectItem value="30d">📅 Last 30 days</SelectItem>
                <SelectItem value="all">📅 All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Weather Type</label>
            <Select value={weatherFilter} onValueChange={onWeatherFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Weather" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌡️ All Weather</SelectItem>
                <SelectItem value="sunny">☀️ Sunny</SelectItem>
                <SelectItem value="cloudy">☁️ Cloudy</SelectItem>
                <SelectItem value="rainy">🌧️ Rainy</SelectItem>
                <SelectItem value="stormy">⛈️ Stormy</SelectItem>
                <SelectItem value="snowy">❄️ Snowy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
