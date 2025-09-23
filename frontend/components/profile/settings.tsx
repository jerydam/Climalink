import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { SettingsIcon, Bell, Globe, Shield, Key, Smartphone } from "lucide-react"

export function Settings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-proposals">New proposals</Label>
              <Switch id="new-proposals" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="validation-required">Validation required</Label>
              <Switch id="validation-required" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="rewards-earned">Rewards earned</Label>
              <Switch id="rewards-earned" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="marketing-updates">Marketing updates</Label>
              <Switch id="marketing-updates" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Preferences
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Temperature Unit</Label>
              <Select defaultValue="celsius">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">Celsius</SelectItem>
                  <SelectItem value="fahrenheit">Fahrenheit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency Display</Label>
              <Select defaultValue="usd">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="btc">BTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select defaultValue="english">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </h4>
          <div className="flex gap-3">
            <Button variant="outline">
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline">
              <Smartphone className="h-4 w-4 mr-2" />
              2FA Setup
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
