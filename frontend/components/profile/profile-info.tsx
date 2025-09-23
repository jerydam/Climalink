import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Edit, Settings, Star } from "lucide-react"

export function ProfileInfo() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-lg">0x</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-semibold">0x1234...abcd</h3>
            <p className="text-muted-foreground">Member since: Jan 2024</p>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-current" />
              <span className="font-medium">Reputation: 4.8/5.0</span>
              <Badge variant="secondary">(92 ratings)</Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-climate-green">23</p>
            <p className="text-sm text-muted-foreground">Reports Submitted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-sky-blue">94%</p>
            <p className="text-sm text-muted-foreground">Validation Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">83%</p>
            <p className="text-sm text-muted-foreground">DAO Participation</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-500">890</p>
            <p className="text-sm text-muted-foreground">Total CLT Earned</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
