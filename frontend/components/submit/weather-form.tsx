"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CloudIcon, CameraIcon } from "@heroicons/react/24/outline"

interface WeatherData {
  temperature: number
  humidity: number
  weather: string
  notes: string
  photo?: File
}

interface WeatherFormProps {
  data: WeatherData
  onDataChange: (data: WeatherData) => void
}

const weatherOptions = [
  { value: "sunny", label: "☀️ Sunny", icon: "☀️" },
  { value: "cloudy", label: "☁️ Cloudy", icon: "☁️" },
  { value: "rainy", label: "🌧️ Rainy", icon: "🌧️" },
  { value: "stormy", label: "⛈️ Stormy", icon: "⛈️" },
  { value: "snowy", label: "❄️ Snowy", icon: "❄️" },
  { value: "foggy", label: "🌫️ Foggy", icon: "🌫️" },
  { value: "windy", label: "💨 Windy", icon: "💨" },
]

export function WeatherForm({ data, onDataChange }: WeatherFormProps) {
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onDataChange({ ...data, photo: file })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CloudIcon className="w-5 h-5" />
          <span>Weather Data</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Temperature Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Temperature</label>
            <span className="text-sm font-bold text-primary">{data.temperature}°C</span>
          </div>
          <Slider
            value={[data.temperature]}
            onValueChange={(value) => onDataChange({ ...data, temperature: value[0] })}
            min={-50}
            max={50}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-50°C</span>
            <span>50°C</span>
          </div>
        </div>

        {/* Humidity Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Humidity</label>
            <span className="text-sm font-bold text-secondary">{data.humidity}%</span>
          </div>
          <Slider
            value={[data.humidity]}
            onValueChange={(value) => onDataChange({ ...data, humidity: value[0] })}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Weather Condition */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Weather Condition</label>
          <Select value={data.weather} onValueChange={(value) => onDataChange({ ...data, weather: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select weather condition" />
            </SelectTrigger>
            <SelectContent>
              {weatherOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Notes */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Additional Notes (Optional)</label>
          <Textarea
            value={data.notes}
            onChange={(e) => onDataChange({ ...data, notes: e.target.value })}
            placeholder="Add any additional weather observations..."
            className="min-h-[100px]"
          />
        </div>

        {/* Photo Upload */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Add Photo (Optional)</label>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="relative bg-transparent">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <CameraIcon className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
            {data.photo && <span className="text-sm text-muted-foreground">{data.photo.name}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
