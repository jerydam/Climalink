"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  gasEstimate?: string
  onConfirm: () => Promise<void>
}

type TransactionStatus = "pending" | "confirming" | "success" | "error"

export function TransactionModal({
  isOpen,
  onClose,
  title,
  description,
  gasEstimate = "0.002 ETH",
  onConfirm,
}: TransactionModalProps) {
  const [status, setStatus] = useState<TransactionStatus>("pending")
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleConfirm = async () => {
    setStatus("confirming")
    try {
      await onConfirm()
      setTxHash("0x1234567890abcdef1234567890abcdef12345678")
      setStatus("success")
    } catch (err: any) {
      setError(err.message || "Transaction failed")
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
        return "Confirming transaction..."
      case "success":
        return "Transaction successful!"
      case "error":
        return "Transaction failed"
      default:
        return "Confirm transaction in your wallet"
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
                <AlertDescription>Please confirm this transaction in your wallet to proceed.</AlertDescription>
              </Alert>
            </div>
          )}

          {status === "confirming" && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Transaction is being processed. Please wait...</AlertDescription>
            </Alert>
          )}

          {status === "success" && txHash && (
            <div className="space-y-3">
              <Alert className="border-climate-green">
                <CheckCircle className="h-4 w-4 text-climate-green" />
                <AlertDescription>Your transaction has been confirmed on the blockchain.</AlertDescription>
              </Alert>

              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, "_blank")}
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
