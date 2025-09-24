"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { TokenBalances } from "@/components/portfolio/token-balances"
import { StakingDashboard } from "@/components/portfolio/staking-dashboard"
import { TransactionHistory } from "@/components/portfolio/transaction-history"
import { EarningsAnalytics } from "@/components/portfolio/earnings-analytics"
import { useRole } from "@/lib/roles"
import { useWeb3 } from "@/lib/web3"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus, ShieldCheck, Users, Wallet } from "lucide-react"

function AccessDenied() {
  const { joinAsReporter, joinAsValidator, joinDAO, stakeBDAG } = useRole()

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-climate-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Portfolio Access Restricted</h1>
              <p className="text-muted-foreground mb-6">
                Access to portfolio features is restricted to registered members. Please join as a reporter, validator, or DAO member to view your portfolio.
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

function LoadingPortfolio() {
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

export default function PortfolioPage() {
  const { isConnected } = useWeb3()
  const { isMember, isLoading, userRole } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  if (isLoading) {
    return <LoadingPortfolio />
  }

  if (!isMember) {
    return <AccessDenied />
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-climate-green mb-2">
            Portfolio {userRole === "dao_member" && "(DAO Member)"}
          </h1>
          <p className="text-muted-foreground">
            Manage your CLT and BDAG tokens, track earnings, and view transaction history
          </p>
        </div>

        <div className="space-y-8">
          <TokenBalances />
          <StakingDashboard />
          <EarningsAnalytics />
          <TransactionHistory />
        </div>
      </main>

      <MobileNav />
    </div>
  )
}