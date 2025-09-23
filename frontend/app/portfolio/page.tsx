"use client"

import { TokenBalances } from "@/components/portfolio/token-balances"
import { StakingDashboard } from "@/components/portfolio/staking-dashboard"
import { TransactionHistory } from "@/components/portfolio/transaction-history"
import { EarningsAnalytics } from "@/components/portfolio/earnings-analytics"

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-climate-green mb-2">Portfolio</h1>
        <p className="text-muted-foreground">
          Manage your CLT and BDAG tokens, track earnings, and view transaction history
        </p>
      </div>

      <TokenBalances />
      <StakingDashboard />
      <EarningsAnalytics />
      <TransactionHistory />
    </div>
  )
}
