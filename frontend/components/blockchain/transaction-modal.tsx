"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { ethers } from "ethers"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  onConfirm: () => Promise<string> // Return transaction hash
}

type TransactionStatus = "pending" | "confirming" | "success" | "error"

export function TransactionModal({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
}: TransactionModalProps) {
  const [status, setStatus] = useState<TransactionStatus>("pending")
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [gasEstimate, setGasEstimate] = useState<string>("Calculating...")
  
  const { provider } = useWeb3()

  // Calculate gas estimate when modal opens
  useEffect(() => {
    if (isOpen && provider) {
      calculateGasEstimate()
    }
  }, [isOpen, provider])

  const calculateGasEstimate = async () => {
    try {
      // Get current gas price
      const feeData = await provider!.getFeeData()
      const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei")
      
      // Estimate gas for a typical transaction (simplified)
      const estimatedGas = 150000n // Typical gas limit for contract interaction
      const totalCost = gasPrice * estimatedGas
      
      setGasEstimate(`${ethers.formatEther(totalCost)} ETH`)
    } catch (error) {
      setGasEstimate("~0.003 ETH")
    }
  }

  const handleConfirm = async () => {
    setStatus("confirming")
    try {
      const hash = await onConfirm()
      setTxHash(hash)
      
      // Wait for transaction confirmation
      if (provider) {
        await provider.waitForTransaction(hash, 1)
      }
      
      setStatus("success")
    } catch (err: any) {
      console.error("Transaction error:", err)
      
      let errorMessage = "Transaction failed"
      
      if (err.code === "USER_REJECTED") {
        errorMessage = "Transaction rejected by user"
      } else if (err.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient funds for transaction"
      } else if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setStatus("error")
    }
  }

  const handleClose = () => {
    setStatus("pending")
    setTxHash("")
    setError("")
    onClose()
  }

  const getStatusIcon = () => {
    switch (status) {
      case "confirming":
        return <Loader2 className="h-6 w-6 animate-spin text-sky-blue" />
      case "success":
        return <CheckCircle className="h-6 w-6 text-climate-green" />
      case "error":
        return <XCircle className="h-6 w-6 text-destructive" />
      default:
        return <AlertTriangle className="h-6 w-6 text-amber-500" />
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case "confirming":
        return "Confirming transaction on blockchain..."
      case "success":
        return "Transaction confirmed successfully!"
      case "error":
        return "Transaction failed"
      default:
        return "Confirm transaction in your wallet"
    }
  }

  const openEtherscan = () => {
    if (txHash) {
      // You can change this to match your network
      const etherscanUrl = `https://etherscan.io/tx/${txHash}`
      window.open(etherscanUrl, "_blank")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>

          {status === "pending" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Estimated Gas Fee</span>
                <Badge variant="secondary">{gasEstimate}</Badge>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please confirm this transaction in your wallet to proceed.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {status === "confirming" && (
            <div className="space-y-3">
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Transaction submitted and waiting for blockchain confirmation...
                </AlertDescription>
              </Alert>
              
              {txHash && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-mono break-all">Tx Hash: {txHash}</p>
                </div>
              )}
            </div>
          )}

          {status === "success" && txHash && (
            <div className="space-y-3">
              <Alert className="border-climate-green">
                <CheckCircle className="h-4 w-4 text-climate-green" />
                <AlertDescription>
                  Your transaction has been confirmed on the blockchain.
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground">
                <p className="font-mono break-all mb-2">Tx Hash: {txHash}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={openEtherscan}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Etherscan
              </Button>
            </div>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            {status === "pending" && (
              <>
                <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleConfirm} className="flex-1 bg-climate-green hover:bg-climate-green/90">
                  Confirm
                </Button>
              </>
            )}

            {status === "confirming" && (
              <Button variant="outline" onClick={handleClose} className="w-full" disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </Button>
            )}

            {(status === "success" || status === "error") && (
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">{getStatusMessage()}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}