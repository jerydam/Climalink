"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useContract } from "@/hooks/use-contract"
import { useWeb3 } from "@/lib/web3"
import { Coins, TrendingUp, Users, FileText } from "lucide-react"

export function ContractInteractions() {
  const { isConnected, account } = useWeb3()
  const tokenContract = useContract("TOKEN")
  const climateContract = useContract("CLIMATE")

  const [balances, setBalances] = useState({
    clt: "0",
    stakedBDAG: "0",
  })

  useEffect(() => {
    if (isConnected && account) {
      loadBalances()
    }
  }, [isConnected, account])

  const loadBalances = async () => {
    try {
      const [cltBalance, stakedAmount] = await Promise.all([
        tokenContract.read("balanceOf", [account]),
        tokenContract.read("getStakedAmount", [account]),
      ])

      setBalances({
        clt: (Number.parseInt(cltBalance) / 1e18).toFixed(2),
        stakedBDAG: (Number.parseInt(stakedAmount) / 1e18).toFixed(2),
      })
    } catch (error) {
      console.error("Failed to load balances:", error)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">Connect your wallet to view contract data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CLT Balance</CardTitle>
          <Coins className="h-4 w-4 text-climate-green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{balances.clt}</div>
          <p className="text-xs text-muted-foreground">CLT Tokens</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Staked BDAG</CardTitle>
          <TrendingUp className="h-4 w-4 text-sky-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{balances.stakedBDAG}</div>
          <p className="text-xs text-muted-foreground">BDAG Tokens</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">DAO Status</CardTitle>
          <Users className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Number.parseFloat(balances.stakedBDAG) >= 100 ? "Member" : "Not Member"}
          </div>
          <Badge
            variant={Number.parseFloat(balances.stakedBDAG) >= 100 ? "default" : "secondary"}
            className={Number.parseFloat(balances.stakedBDAG) >= 100 ? "bg-climate-green" : ""}
          >
            {Number.parseFloat(balances.stakedBDAG) >= 100 ? "Active" : "Inactive"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reports</CardTitle>
          <FileText className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">23</div>
          <p className="text-xs text-muted-foreground">Submitted</p>
        </CardContent>
      </Card>
    </div>
  )
}
