"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, LogOut, Copy, ExternalLink } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { WalletConnectModal } from "./wallet-connect-modal"

export function WalletInfo() {
  const { account, isConnected, disconnect } = useWeb3()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
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
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="bg-climate-green/10 text-climate-green border-climate-green/20">
        <div className="h-2 w-2 bg-climate-green rounded-full mr-2"></div>
        Connected
      </Badge>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={copyAddress} className="text-xs font-mono">
          {formatAddress(account!)}
          <Copy className="h-3 w-3 ml-1" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`https://etherscan.io/address/${account}`, "_blank")}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>

        <Button variant="ghost" size="sm" onClick={disconnect}>
          <LogOut className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
