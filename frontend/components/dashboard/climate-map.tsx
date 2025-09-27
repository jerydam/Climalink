"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/lib/web3"
import { Loader2, MapPin, Thermometer, Droplets, Clock, User } from "lucide-react"

interface ClimateReport {
  id: string
  location: string
  weather: string
  temperature: number
  humidity: number
  timestamp: number
  reporter: string
  coordinates: { lat: number; lng: number }
  status: number
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

export function ClimateMap() {
  const [reports, setReports] = useState<ClimateReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<ClimateReport | null>(null)
  
  const { isConnected, getContract, provider } = useWeb3()

  useEffect(() => {
    const fetchClimateReports = async () => {
      if (!isConnected || !provider) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const climateContract = getContract("CLIMATE")
        
        if (!climateContract) {
          console.error("Climate contract not available")
          setIsLoading(false)
          return
        }

        // Get total report count
        const reportCount = await climateContract.reportCount()
        const reports: ClimateReport[] = []

        // Fetch recent reports for the map (last 20)
        const maxReports = Math.min(Number(reportCount), 20)
        const startIndex = Math.max(0, Number(reportCount) - maxReports)

        for (let i = startIndex; i < Number(reportCount); i++) {
          try {
            // Using the correct method name from ABI
            const reportData = await climateContract.getReport(i)
            
            // Only show valid reports on the map
            if (reportData.status === 1) { // 1 = Valid
              reports.push({
                id: i.toString(),
                location: reportData.data.location,
                weather: reportData.data.weather,
                temperature: Number(reportData.data.temperature) / 100, // Convert from int128 format
                humidity: Number(reportData.data.humidity),
                timestamp: Number(reportData.timestamp),
                reporter: reportData.reporter,
                coordinates: {
                  lat: Number(reportData.data.latitude) / 1000000, // Convert from int128 format
                  lng: Number(reportData.data.longitude) / 1000000,
                },
                status: reportData.status,
              })
            }
          } catch (error) {
            console.error(`Error fetching report ${i}:`, error)
            continue
          }
        }

        // Sort by most recent first
        reports.sort((a, b) => b.timestamp - a.timestamp)
        setReports(reports)
      } catch (error) {
        console.error("Error fetching climate reports:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClimateReports()
  }, [isConnected, provider, getContract])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000)
    const diff = now - timestamp
    const hours = Math.floor(diff / 3600)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return "text-blue-600"
    if (temp < 10) return "text-blue-400"
    if (temp < 20) return "text-green-500"
    if (temp < 30) return "text-yellow-500"
    return "text-red-500"
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Global Climate Reports
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Live</Badge>
            <Badge variant="outline">{reports.length} Reports</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-green-50 rounded-lg relative overflow-hidden border">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading climate reports...</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <p className="text-sm text-muted-foreground">No climate reports available</p>
                <p className="text-xs text-muted-foreground mt-2">Reports will appear here once submitted and validated</p>
              </div>
            </div>
          ) : (
            <>
              {/* Simulated World Map Background */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 800 400" className="w-full h-full">
                  {/* Simplified world map outline */}
                  <path
                    d="M150,80 Q180,60 220,80 Q260,70 300,90 Q340,85 380,100 Q420,95 460,110 Q500,100 540,120 Q580,115 620,130 L650,140 L680,150 L680,200 L650,220 L620,210 L580,200 L540,190 L500,180 L460,170 L420,160 L380,170 L340,180 L300,190 L260,200 L220,190 L180,180 L150,170 Z"
                    fill="currentColor"
                    className="text-green-200"
                  />
                  <path
                    d="M100,200 Q130,180 160,200 Q190,190 220,210 Q250,200 280,220 Q310,210 340,230 Q370,220 400,240 L400,280 L370,300 L340,290 L310,280 L280,270 L250,260 L220,270 L190,280 L160,270 L130,260 L100,250 Z"
                    fill="currentColor"
                    className="text-green-200"
                  />
                </svg>
              </div>

              {/* Climate Report Pins */}
              {reports.map((report, index) => {
                // Convert lat/lng to map coordinates (simplified positioning)
                const x = ((report.coordinates.lng + 180) / 360) * 100
                const y = ((90 - report.coordinates.lat) / 180) * 100
                
                return (
                  <div
                    key={report.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: `${Math.max(5, Math.min(95, x))}%`,
                      top: `${Math.max(5, Math.min(95, y))}%`,
                    }}
                    onClick={() => setSelectedReport(report)}
                  >
                    {/* Report Pin */}
                    <div className={`w-3 h-3 ${getStatusColor(report.status)} rounded-full animate-pulse shadow-lg group-hover:scale-150 transition-transform duration-200`}>
                      <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                    </div>

                    {/* Hover Tooltip */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs rounded-lg p-2 whitespace-nowrap pointer-events-none z-10">
                      <div className="flex items-center gap-1">
                        <span>{weatherIcons[report.weather.toLowerCase()] || "🌤️"}</span>
                        <span className={`font-bold ${getTemperatureColor(report.temperature)}`}>
                          {report.temperature}°C
                        </span>
                        <span>{report.humidity}%</span>
                      </div>
                      <div className="text-xs opacity-80">{report.location}</div>
                    </div>
                  </div>
                )
              })}

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs">
                <h4 className="font-semibold mb-2">Legend</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Valid Reports</span>
                  </div>
                  <div className="text-muted-foreground">
                    Total: {reports.length} reports
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Selected Report Details */}
        {selectedReport && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {selectedReport.location}
                </h4>
                <p className="text-sm text-muted-foreground">Report #{selectedReport.id}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{weatherIcons[selectedReport.weather.toLowerCase()] || "🌤️"}</span>
                <div>
                  <p className="text-sm font-medium capitalize">{selectedReport.weather}</p>
                  <p className="text-xs text-muted-foreground">Condition</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <div>
                  <p className={`text-sm font-bold ${getTemperatureColor(selectedReport.temperature)}`}>
                    {selectedReport.temperature}°C
                  </p>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-bold">{selectedReport.humidity}%</p>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{formatTimeAgo(selectedReport.timestamp)}</p>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs">{formatAddress(selectedReport.reporter)}</span>
              <Badge variant="secondary" className="ml-auto">
                Valid Report
              </Badge>
            </div>
          </div>
        )}

        {/* Real-time Stats */}
        {!isLoading && reports.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-climate-green">{reports.length}</p>
              <p className="text-xs text-muted-foreground">Active Reports</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-500">
                {(reports.reduce((sum, r) => sum + r.temperature, 0) / reports.length).toFixed(1)}°C
              </p>
              <p className="text-xs text-muted-foreground">Avg Temperature</p>
            </div>
            <div>
              <p className="text-lg font-bold text-cyan-500">
                {Math.round(reports.reduce((sum, r) => sum + r.humidity, 0) / reports.length)}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Humidity</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-500">
                {new Set(reports.map(r => r.location.split(',')[0])).size}
              </p>
              <p className="text-xs text-muted-foreground">Locations</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}