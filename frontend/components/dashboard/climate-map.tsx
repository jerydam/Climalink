import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ClimateMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Global Climate Reports
          <Badge variant="secondary">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Placeholder for interactive map */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗺️</span>
            </div>
            <p className="text-sm text-muted-foreground">Interactive world map showing real-time climate reports</p>
            <p className="text-xs text-muted-foreground mt-2">Map integration coming soon</p>
          </div>

          {/* Sample location pins */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-8 w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
          <div className="absolute bottom-6 left-1/3 w-3 h-3 bg-success rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 right-1/4 w-3 h-3 bg-warning rounded-full animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  )
}
