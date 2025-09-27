"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPinIcon, GlobeAltIcon } from "@heroicons/react/24/outline"
import { Loader2, MapPin } from "lucide-react"

interface WeatherData {
  temperature: number
  humidity: number
  weather: string
  notes: string
}

interface FetchedWeatherData {
  current?: {
    temperature: number
    humidity: number
    weatherCondition: string
  }
}

interface LocationInputProps {
  location: string
  coordinates: { lat: number; lng: number }
  onLocationChange: (location: string, coordinates: { lat: number; lng: number }) => void
  onWeatherDataFetched?: (weatherData: WeatherData) => void
  isFetchingWeather?: boolean
  weatherFetchError?: string | null
  onWeatherFetchError?: (error: string | null) => void
}

export function LocationInput({ 
  location, 
  coordinates, 
  onLocationChange, 
  onWeatherDataFetched,
  isFetchingWeather = false,
  weatherFetchError,
  onWeatherFetchError
}: LocationInputProps) {
  const [inputValue, setInputValue] = useState(location)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false)

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

  // Function to get user's current location and fetch weather
  const handleUseCurrentLocationAndWeather = async () => {
    setIsUsingCurrentLocation(true)
    setIsGettingLocation(true)
    setLocationError("")
    onWeatherFetchError?.(null)

    try {
      // Get user's current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser"))
          return
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { 
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 
          }
        )
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude

      // Update coordinates
      onLocationChange(location, { lat, lng })

      // Reverse geocode to get location name
      let locationName = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        )
        const geoData = await geoRes.json()
        
        locationName = geoData.display_name || 
          `${geoData.address?.road || "Unknown road"}, ${
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            "Unknown place"
          }`
        
      } catch (error) {
        console.warn("Failed to reverse geocode:", error)
      }

      // Update location
      onLocationChange(locationName, { lat, lng })
      setInputValue(locationName)

      // Fetch weather data if callback is provided
      if (onWeatherDataFetched) {
        try {
          const weatherRes = await fetch(`/api/weather?latitude=${lat}&longitude=${lng}`)
          
          if (!weatherRes.ok) {
            throw new Error(`Weather API returned ${weatherRes.status}`)
          }

          const fetchedWeather: FetchedWeatherData = await weatherRes.json()
          
          // Update weather data with fetched information
          if (fetchedWeather.current) {
            const weatherData: WeatherData = {
              temperature: fetchedWeather.current.temperature,
              humidity: fetchedWeather.current.humidity,
              weather: fetchedWeather.current.weatherCondition.toLowerCase(),
              notes: `Automatically fetched from current location at ${new Date().toLocaleString()}`
            }
            onWeatherDataFetched(weatherData)
          } else {
            throw new Error("No current weather data available")
          }

        } catch (weatherError) {
          console.warn("Weather fetch failed:", weatherError)
          onWeatherFetchError?.("Weather data not available, please enter manually")
        }
      }

    } catch (error) {
      console.error("Failed to get current location:", error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to get your current location"
      
      setLocationError(errorMessage)
      onWeatherFetchError?.(errorMessage)
    } finally {
      setIsGettingLocation(false)
      setIsUsingCurrentLocation(false)
    }
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

        {/* Use Current Location & Weather Button */}
        {onWeatherDataFetched && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">Auto-fetch Weather Data</h4>
              <p className="text-sm text-green-700 mb-3">
                Get your current location and automatically fetch real-time weather data for more accurate reporting.
              </p>
              <Button 
                onClick={handleUseCurrentLocationAndWeather}
                disabled={isFetchingWeather || isUsingCurrentLocation || isGettingLocation}
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isFetchingWeather || isUsingCurrentLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUsingCurrentLocation ? "Getting location..." : "Fetching weather..."}
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Use Current Location & Weather
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {locationError && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {locationError}
          </div>
        )}
        
        {weatherFetchError && (
          <div className="text-sm text-orange-800 bg-orange-50 border border-orange-200 p-3 rounded-lg">
            {weatherFetchError}
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