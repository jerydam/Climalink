"use client"

import { ProfileInfo } from "@/components/profile/profile-info"
import { Achievements } from "@/components/profile/achievements"
import { Settings } from "@/components/profile/settings"

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-climate-green mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account, view achievements, and customize your settings</p>
      </div>

      <ProfileInfo />
      <Achievements />
      <Settings />
    </div>
  )
}
