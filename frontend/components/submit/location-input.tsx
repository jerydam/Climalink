"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPinIcon, GlobeAltIcon } from "@heroicons/react/24/outline"
import { Loader2, MapPin } from "lucide-react"

interface LocationInputProps {
  location: string
  coordinates: { lat: number; lng: number }
  onLocationChange: (location: string, coordinates: { lat: number; lng: number }) => void
}

export function LocationInput({ location, coordinates, onLocationChange }: LocationInputProps) {
  const [inputValue, setInputValue] = useState(location)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")

  // Update input value when location prop changes
  useEffect(() => {
    setInputValue(location)
  }, [location])

  const handleLocationSubmit = () => {
    if (inputValue.trim()) {
      // In a real implementation, you'd geocode the address to get coordinates
      // For now, we'll use mock coordinates based on common city names
      const mockCoordinates = getMockCoordinates(inputValue)
      onLocationChange(inputValue.trim(), mockCoordinates)
      setLocationError("")
    }
  }

  const getMockCoordinates = (locationName: string): { lat: number; lng: number } => {
    const lowerName = locationName.toLowerCase()
    
    // Mock coordinates for common cities
    if (lowerName.includes("miami")) return { lat: 25.7617, lng: -80.1918 }
    if (lowerName.includes("new york") || lowerName.includes("nyc")) return { lat: 40.7128, lng: -74.0060 }
    if (lowerName.includes("los angeles") || lowerName.includes("la")) return { lat: 34.0522, lng: -118.2437 }
    if (lowerName.includes("chicago")) return { lat: 41.8781, lng: -87.6298 }
    if (lowerName.includes("houston")) return { lat: 29.7604, lng: -95.3698 }
    if (lowerName.includes("phoenix")) return { lat: 33.4484, lng: -112.0740 }
    if (lowerName.includes("philadelphia")) return { lat: 39.9526, lng: -75.1652 }
    if (lowerName.includes("san antonio")) return { lat: 29.4241, lng: -98.4936 }
    if (lowerName.includes("san diego")) return { lat: 32.7157, lng: -117.1611 }
    if (lowerName.includes("dallas")) return { lat: 32.7767, lng: -96.7970 }
    if (lowerName.includes("san francisco")) return { lat: 37.7749, lng: -122.4194 }
    if (lowerName.includes("austin")) return { lat: 30.2672, lng: -97.7431 }
    if (lowerName.includes("seattle")) return { lat: 47.6062, lng: -122.3321 }
    if (lowerName.includes("denver")) return { lat: 39.7392, lng: -104.9903 }
    if (lowerName.includes("boston")) return { lat: 42.3601, lng: -71.0589 }
    
    // Default to current coordinates if no match found
    return coordinates
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    setLocationError("")

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        // In a real app, you'd reverse geocode to get the address
        const mockLocation = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
        
        onLocationChange(mockLocation, { lat, lng })
        setInputValue(mockLocation)
        setIsGettingLocation(false)
      },
      (error) => {
        let errorMessage = "Unable to get your location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        setLocationError(errorMessage)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPinIcon className="w-5 h-5" />
          <span>Location</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location Display */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <GlobeAltIcon className="w-4 h-4 text-primary" />
            <span className="font-medium">Current Location</span>
          </div>
          <p className="text-sm">{location}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {coordinates.lat.toFixed(4)}°N, {Math.abs(coordinates.lng).toFixed(4)}°W
          </p>
        </div>

        {/* Manual Location Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Enter Location</label>
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., Miami, Florida, USA"
              onKeyPress={(e) => e.key === "Enter" && handleLocationSubmit()}
            />
            <Button onClick={handleLocationSubmit} variant="outline">
              Set Location
            </Button>
          </div>
        </div>

        {/* GPS Location Button */}
        <div className="space-y-3">
          <Button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full"
            variant="outline"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Use Current Location
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {locationError && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {locationError}
          </div>
        )}

        {/* Location Guidelines */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong> For best results, use specific locations like "Miami Beach, FL" or enable GPS 
            for automatic location detection. Accurate locations help improve report quality and validation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}