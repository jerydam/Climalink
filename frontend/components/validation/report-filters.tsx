"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"

interface ReportFiltersProps {
  location: string
  timeFilter: string
  weatherFilter: string
  onLocationChange: (location: string) => void
  onTimeFilterChange: (timeFilter: string) => void
  onWeatherFilterChange: (weatherFilter: string) => void
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
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filter Reports</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search location..."
                value={location === "all" ? "" : location}
                onChange={(e) => onLocationChange(e.target.value || "all")}
                className="pl-10"
              />
            </div>
          </div>

          {/* Time Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Range</label>
            <Select value={timeFilter} onValueChange={onTimeFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="6h">Last 6 Hours</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weather Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Weather</label>
            <Select value={weatherFilter} onValueChange={onWeatherFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weather</SelectItem>
                <SelectItem value="sunny">☀️ Sunny</SelectItem>
                <SelectItem value="cloudy">☁️ Cloudy</SelectItem>
                <SelectItem value="rainy">🌧️ Rainy</SelectItem>
                <SelectItem value="stormy">⛈️ Stormy</SelectItem>
                <SelectItem value="snowy">❄️ Snowy</SelectItem>
                <SelectItem value="foggy">🌫️ Foggy</SelectItem>
                <SelectItem value="windy">💨 Windy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Filters</label>
            <div className="flex flex-wrap gap-2">
              {timeFilter !== "24h" && (
                <Badge variant="secondary" className="text-xs">
                  {timeFilter === "1h" && "1 Hour"}
                  {timeFilter === "6h" && "6 Hours"}
                  {timeFilter === "7d" && "7 Days"}
                  {timeFilter === "all" && "All Time"}
                </Badge>
              )}
              {weatherFilter !== "all" && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {weatherFilter}
                </Badge>
              )}
              {location !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {location}
                </Badge>
              )}
              {timeFilter === "24h" && weatherFilter === "all" && location === "all" && (
                <Badge variant="outline" className="text-xs">
                  No filters
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}