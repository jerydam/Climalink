"use client"

import { WalletInfo } from "@/components/blockchain/wallet-info"
import { BlockchainActions } from "@/components/blockchain/blockchain-actions"
import { ContractInteractions } from "@/components/blockchain/contract-interactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/lib/web3"
import { Wallet, Link, Zap } from "lucide-react"

export default function BlockchainPage() {
  const { account, isConnected } = useWeb3()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-climate-green mb-2">Blockchain Integration</h1>
          <p className="text-muted-foreground">Connect your wallet and interact with ClimaLink smart contracts</p>
        </div>
        <WalletInfo />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Status</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isConnected ? "Connected" : "Disconnected"}</div>
            <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-climate-green" : ""}>
              {isConnected ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ethereum</div>
            <p className="text-xs text-muted-foreground">Mainnet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Price</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25 Gwei</div>
            <p className="text-xs text-muted-foreground">Standard</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Contract Data</h2>
          <ContractInteractions />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Smart Contract Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <BlockchainActions />
          </CardContent>
        </Card>

        {isConnected && account && (
          <Card>
            <CardHeader>
              <CardTitle>Contract Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CLT Token:</span>
                  <code className="font-mono">0xb6147E56105f09086C1DC3eb7d6A595F1818b499</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Climate Reports:</span>
                  <code className="font-mono">0x50AdE72a0bF3F424505c3828D140C976B99b7D06</code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
