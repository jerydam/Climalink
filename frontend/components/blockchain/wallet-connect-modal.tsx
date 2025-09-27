"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, AlertCircle, Loader2 } from "lucide-react"
import { useWeb3 } from "@/lib/web3"

interface WalletConnectModalProps {
  children?: React.ReactNode
}

// BlockDAG Network Configuration
const BLOCKDAG_NETWORK = {
  chainId: '0x413', // 1043 in hex
  chainName: 'BlockDAG',
  rpcUrls: ['https://rpc.awakening.bdagscan.com'],
  nativeCurrency: {
    name: 'BDAG',
    symbol: 'BDAG',
    decimals: 18,
  },
  blockExplorerUrls: ['https://bdagscan.com'],
}

export function WalletConnectModal({ children }: WalletConnectModalProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>("")
  const { connect, isConnecting } = useWeb3()
  const [hasEthereum, setHasEthereum] = useState<boolean | null>(null);

  useEffect(() => {
    setHasEthereum(!!window.ethereum);
  }, []);

  const addBlockDAGNetwork = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed")
    }

    try {
      // Try to switch to BlockDAG network first
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BLOCKDAG_NETWORK.chainId }],
      })
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BLOCKDAG_NETWORK],
          })
        } catch (addError) {
          console.error('Failed to add BlockDAG network:', addError)
          throw new Error('Failed to add BlockDAG network to wallet')
        }
      } else {
        console.error('Failed to switch to BlockDAG network:', switchError)
        throw switchError
      }
    }
  }

  const handleConnect = async (walletType: string) => {
    setError("")
    
    try {
      if (walletType === "metamask") {
        if (!window.ethereum) {
          setError("MetaMask is not installed. Please install MetaMask extension.")
          return
        }

        // Add/switch to BlockDAG network first
        await addBlockDAGNetwork()
        
        // Then connect wallet
        await connect()
        setOpen(false)
      } else if (walletType === "walletconnect") {
        // For WalletConnect, you might need to configure it differently
        // This depends on your Web3 context implementation
        await connect()
        setOpen(false)
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error)
      setError(error.message || "Failed to connect wallet. Please try again.")
    }
  }

  const openMetaMaskDownload = () => {
    window.open("https://metamask.io/download/", "_blank")
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
          <DialogTitle>Connect to BlockDAG Network</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to BlockDAG network to start earning CLT tokens by submitting weather reports and participating in DAO governance.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              <div className="ml-auto">
                <div className="text-xs text-muted-foreground">Recommended</div>
              </div>
            </Button>

            {hasEthereum === false && (
              <Button
                onClick={openMetaMaskDownload}
                className="w-full justify-start h-12"
                variant="secondary"
              >
                <div className="h-5 w-5 mr-3 bg-orange-500 rounded"></div>
                Install MetaMask
              </Button>
            )}

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
              <div className="ml-auto">
                <div className="text-xs text-muted-foreground">Mobile</div>
              </div>
            </Button>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm font-medium mb-1">Network Details:</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Network: BlockDAG</div>
              <div>Chain ID: 1043</div>
              <div>Currency: BDAG</div>
              <div>RPC: rpc.awakening.bdagscan.com</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}