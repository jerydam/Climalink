"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPinIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"

interface LocationInputProps {
  location: string
  coordinates: { lat: number; lng: number }
  onLocationChange: (location: string, coordinates: { lat: number; lng: number }) => void
}

export function LocationInput({ location, coordinates, onLocationChange }: LocationInputProps) {
  const [isUsingGPS, setIsUsingGPS] = useState(false)

  const handleUseCurrentLocation = () => {
    setIsUsingGPS(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          onLocationChange("Current Location", { lat: latitude, lng: longitude })
          setIsUsingGPS(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsUsingGPS(false)
        },
      )
    }
  }

  const handleSearchAddress = () => {
    // Placeholder for address search functionality
    onLocationChange("Miami, Florida, USA", { lat: 25.7617, lng: -80.1918 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPinIcon className="w-5 h-5" />
          <span>Select Location</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Interactive Map Placeholder */}
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPinIcon className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Interactive map with draggable pin</p>
            <p className="text-xs text-muted-foreground mt-2">Map integration coming soon</p>
          </div>

          {/* Sample location pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg animate-pulse"></div>
          </div>
        </div>

        {/* Location Input */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Input
              value={location}
              onChange={(e) => onLocationChange(e.target.value, coordinates)}
              placeholder="Enter location..."
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Coordinates</label>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              {coordinates.lat.toFixed(4)}°N, {Math.abs(coordinates.lng).toFixed(4)}°W
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleUseCurrentLocation} disabled={isUsingGPS} className="flex-1">
            <MapPinIcon className="w-4 h-4 mr-2" />
            {isUsingGPS ? "Getting Location..." : "Use Current Location"}
          </Button>
          <Button variant="outline" onClick={handleSearchAddress} className="flex-1 bg-transparent">
            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
            Search Address
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
