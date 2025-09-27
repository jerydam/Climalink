"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, LogOut, Copy, ExternalLink, AlertTriangle } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { WalletConnectModal } from "./wallet-connect-modal"

export function WalletInfo() {
  const { 
    account, 
    isConnected, 
    disconnect, 
    chainId, 
    isCorrectNetwork, 
    switchToBlockDAG 
  } = useWeb3()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      // You could add a toast notification here
    }
  }

  const openBlockExplorer = () => {
    if (account) {
      window.open(`https://bdagscan.com/address/${account}`, "_blank")
    }
  }

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1043:
        return "BlockDAG"
      case 1:
        return "Ethereum"
      case 137:
        return "Polygon"
      case 56:
        return "BSC"
      default:
        return chainId ? `Chain ${chainId}` : "Unknown"
    }
  }

  if (!isConnected) {
    return (
      <WalletConnectModal>
        <Button variant="outline" size="sm">
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </WalletConnectModal>
    )
  }

  return (
    <div className="space-y-2">
      {/* Wrong Network Warning */}
      {!isCorrectNetwork && (
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Wrong network. Switch to BlockDAG to use ClimaLink.</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={switchToBlockDAG}
              className="ml-2"
            >
              Switch Network
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        {/* Connection Status Badge */}
        <Badge 
          variant="secondary" 
          className={`${
            isCorrectNetwork 
              ? "bg-climate-green/10 text-climate-green border-climate-green/20" 
              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
          }`}
        >
          <div className={`h-2 w-2 rounded-full mr-2 ${
            isCorrectNetwork ? "bg-climate-green" : "bg-amber-500"
          }`}></div>
          {isCorrectNetwork ? "BlockDAG" : getNetworkName(chainId)}
        </Badge>

        {/* Wallet Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={copyAddress} className="text-xs font-mono">
            {formatAddress(account!)}
            <Copy className="h-3 w-3 ml-1" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={openBlockExplorer}
            title="View on BlockDAG Explorer"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>

          <Button variant="ghost" size="sm" onClick={disconnect} title="Disconnect Wallet">
            <LogOut className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Network Info for debugging */}
      {chainId && (
        <div className="text-xs text-muted-foreground">
          Chain ID: {chainId}
        </div>
      )}
    </div>
  )
}