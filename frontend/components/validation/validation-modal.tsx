"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPinIcon, CalendarIcon, UserIcon, ChartBarIcon } from "@heroicons/react/24/outline"

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
}

interface ValidationModalProps {
  report: Report | null
  isOpen: boolean
  onClose: () => void
  onValidate: (reportId: string, isValid: boolean, notes: string) => void
}

export function ValidationModal({ report, isOpen, onClose, onValidate }: ValidationModalProps) {
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!report) return null

  const handleValidate = async (isValid: boolean) => {
    setIsSubmitting(true)
    try {
      await onValidate(report.id, isValid, notes)
      setNotes("")
      onClose()
    } catch (error) {
      console.error("Validation error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>✅</span>
            <span>Validate Report #{report.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-5 h-5 text-primary" />
              <span className="font-medium">{report.location}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              <span>Submitted: {report.submittedAt || "March 15, 2024, 2:30 PM"}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <UserIcon className="w-4 h-4" />
              <span>Reporter: {report.reporter}</span>
            </div>
          </div>

          {/* Weather Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{report.temperature}°C</div>
              <div className="text-sm text-muted-foreground">Temperature</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{report.humidity}%</div>
              <div className="text-sm text-muted-foreground">Humidity</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl">{report.weatherIcon}</div>
              <div className="text-sm text-muted-foreground">{report.weather}</div>
            </div>
          </div>

          {/* External Data Comparison */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">External Data Comparison</span>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Weather.com:</span>
                <Badge variant="secondary">
                  {report.temperature + 1}°C, {report.weather}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">NOAA:</span>
                <Badge variant="secondary">{report.temperature - 1}°C, Clear</Badge>
              </div>
            </div>
          </div>

          {/* Validation Notes */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Validation Notes (Optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any comments about this report..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => handleValidate(false)} disabled={isSubmitting}>
            ❌ Invalid Report
          </Button>
          <Button onClick={() => handleValidate(true)} disabled={isSubmitting}>
            ✅ Valid Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
