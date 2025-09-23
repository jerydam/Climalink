"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, AlertCircle, Loader2 } from "lucide-react"
import { useWeb3 } from "@/lib/web3"

interface WalletConnectModalProps {
  children?: React.ReactNode
}

export function WalletConnectModal({ children }: WalletConnectModalProps) {
  const [open, setOpen] = useState(false)
  const { connect, isConnecting } = useWeb3()

  const handleConnect = async (walletType: string) => {
    try {
      await connect()
      setOpen(false)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-climate-green hover:bg-climate-green/90">
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to start earning CLT tokens by submitting weather reports and participating in DAO
              governance.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={() => handleConnect("metamask")}
              disabled={isConnecting}
              className="w-full justify-start h-12"
              variant="outline"
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              ) : (
                <div className="h-5 w-5 mr-3 bg-orange-500 rounded"></div>
              )}
              MetaMask
            </Button>

            <Button
              onClick={() => handleConnect("walletconnect")}
              disabled={isConnecting}
              className="w-full justify-start h-12"
              variant="outline"
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              ) : (
                <div className="h-5 w-5 mr-3 bg-blue-500 rounded"></div>
              )}
              WalletConnect
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
