"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { ClimateMap } from "@/components/dashboard/climate-map"
import { useRole } from "@/lib/roles"
import { useWeb3 } from "@/lib/web3"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus, ShieldCheck, Users } from "lucide-react"

function AccessDenied() {
  const { joinAsReporter, joinAsValidator, joinDAO, stakeBDAG } = useRole()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-climate-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
              <p className="text-muted-foreground mb-6">
                This dashboard is only accessible to registered members. Please join as a reporter, validator, or DAO member to continue.
              </p>
              
              <div className="grid gap-4">
                <Button 
                  onClick={joinAsReporter} 
                  className="bg-climate-green hover:bg-climate-green/90"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join as Reporter
                </Button>
                
                <Button 
                  onClick={joinAsValidator}
                  variant="outline"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Join as Validator
                </Button>
                
                <Button 
                  onClick={() => {
                    stakeBDAG().then(() => joinDAO())
                  }}
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Stake BDAG & Join DAO
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Note: DAO membership requires staking BDAG tokens first.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking your membership status...</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  const { isConnected } = useWeb3()
  const { isMember, isLoading, userRole } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  if (isLoading) {
    return <LoadingDashboard />
  }

  if (!isMember) {
    return <AccessDenied />
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back{userRole === "dao_member" ? ", DAO Member" : userRole === "reporter" ? ", Reporter" : userRole === "validator" ? ", Validator" : ""}!
            </h1>
            <p className="text-muted-foreground">Here's what's happening with your climate reporting activity.</p>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <QuickActions />
              <ClimateMap />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}