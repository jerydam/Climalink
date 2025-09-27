"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, XCircle, AlertTriangle, ExternalLink, Coins } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { ethers } from "ethers"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  onConfirm: () => Promise<string> // Return transaction hash
  requiresApproval?: boolean // New prop for DAO transactions
  approvalAmount?: string // Amount to approve (for DAO membership fee)
  approvalSpender?: string // DAO contract address
}

type TransactionStatus = "pending" | "approving" | "confirming" | "success" | "error"

interface TransactionStep {
  name: string
  status: "pending" | "active" | "completed" | "error"
  hash?: string
}

export function TransactionModal({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  requiresApproval = false,
  approvalAmount,
  approvalSpender,
}: TransactionModalProps) {
  const [status, setStatus] = useState<TransactionStatus>("pending")
  const [txHash, setTxHash] = useState<string>("")
  const [approvalHash, setApprovalHash] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [gasEstimate, setGasEstimate] = useState<string>("Calculating...")
  const [currentStep, setCurrentStep] = useState(0)
  
  const { provider, getContract, account } = useWeb3()

  // Define transaction steps
  const getSteps = (): TransactionStep[] => {
    if (requiresApproval) {
      return [
        { name: "Approve CLT Spending", status: "pending" },
        { name: "Join DAO", status: "pending" }
      ]
    }
    return [{ name: "Execute Transaction", status: "pending" }]
  }

  const [steps, setSteps] = useState<TransactionStep[]>(getSteps())

  // Calculate gas estimate when modal opens
  useEffect(() => {
    if (isOpen && provider) {
      calculateGasEstimate()
      // Reset state when modal opens
      setStatus("pending")
      setCurrentStep(0)
      setSteps(getSteps())
      setTxHash("")
      setApprovalHash("")
      setError("")
    }
  }, [isOpen, provider, requiresApproval])

  const calculateGasEstimate = async () => {
    try {
      const feeData = await provider!.getFeeData()
      const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei")
      
      // Estimate gas (higher for multi-step transactions)
      const estimatedGas = BigInt(requiresApproval ? 300000 : 150000)
      const totalCost = gasPrice * estimatedGas
      
      setGasEstimate(`${ethers.formatEther(totalCost)} ETH`)
    } catch (error) {
      console.warn("Could not calculate gas estimate:", error)
      setGasEstimate(requiresApproval ? "~0.006 ETH" : "~0.003 ETH")
    }
  }

  const updateStepStatus = (stepIndex: number, status: "pending" | "active" | "completed" | "error", hash?: string) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status, hash } : step
    ))
  }

  const handleApproval = async (): Promise<string> => {
    if (!approvalAmount || !approvalSpender) {
      throw new Error("Approval parameters missing")
    }

    const tokenContract = getContract("TOKEN")
    if (!tokenContract) {
      throw new Error("Token contract not available")
    }

    console.log("Approving DAO to spend CLT tokens...")
    
    try {
      // Check current allowance first (with error handling)
      let currentAllowance = BigInt(0)
      try {
        currentAllowance = await tokenContract.allowance(account, approvalSpender)
        console.log("Current allowance:", ethers.formatEther(currentAllowance), "CLT")
      } catch (allowanceError) {
        console.warn("Could not check current allowance, proceeding with approval:", allowanceError.message)
        // Continue with approval even if we can't check current allowance
      }
      
      const requiredAmount = ethers.parseEther(approvalAmount)
      
      if (currentAllowance >= requiredAmount) {
        console.log("Already approved sufficient amount")
        return "already-approved"
      }

      // Approve the DAO contract to spend CLT tokens
      console.log("Submitting approval transaction...")
      const approveTx = await tokenContract.approve(approvalSpender, requiredAmount)
      console.log("Approval transaction submitted:", approveTx.hash)
      
      // Wait for approval confirmation
      const receipt = await approveTx.wait()
      console.log("Approval confirmed in block:", receipt.blockNumber)
      
      return approveTx.hash
    } catch (error: any) {
      console.error("Approval error:", error)
      
      // Provide more specific error messages
      if (error.code === "USER_REJECTED" || error.code === 4001) {
        throw new Error("Transaction rejected by user")
      } else if (error.code === "INSUFFICIENT_FUNDS" || error.code === -32000) {
        throw new Error("Insufficient funds for gas fee")
      } else if (error.message && error.message.includes("insufficient allowance")) {
        throw new Error("Token approval failed - insufficient balance")
      } else if (error.message && error.message.includes("insufficient funds")) {
        throw new Error("Insufficient CLT balance for approval")
      } else if (error.reason) {
        throw new Error(`Approval failed: ${error.reason}`)
      } else {
        throw new Error(`Approval failed: ${error.message || "Unknown error"}`)
      }
    }
  }

  const handleConfirm = async () => {
    try {
      if (requiresApproval) {
        // Step 1: Handle approval
        setStatus("approving")
        setCurrentStep(0)
        updateStepStatus(0, "active")
        
        console.log("Starting approval process...")
        const approvalResult = await handleApproval()
        
        if (approvalResult !== "already-approved") {
          setApprovalHash(approvalResult)
          updateStepStatus(0, "completed", approvalResult)
        } else {
          updateStepStatus(0, "completed")
        }
        
        // Small delay before next step
        console.log("Approval completed, waiting before next step...")
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Step 2: Execute main transaction
        setStatus("confirming")
        setCurrentStep(1)
        updateStepStatus(1, "active")
      } else {
        // Single step transaction
        setStatus("confirming")
        updateStepStatus(0, "active")
      }
      
      // Execute the main transaction
      console.log("Executing main transaction...")
      const hash = await onConfirm()
      setTxHash(hash)
      console.log("Main transaction submitted:", hash)
      
      // Wait for transaction confirmation
      if (provider) {
        console.log("Waiting for transaction confirmation...")
        const receipt = await provider.waitForTransaction(hash, 1)
        console.log("Transaction confirmed in block:", receipt?.blockNumber)
      }
      
      // Mark final step as completed
      const finalStepIndex = requiresApproval ? 1 : 0
      updateStepStatus(finalStepIndex, "completed", hash)
      setStatus("success")
      console.log("All transactions completed successfully!")
      
    } catch (err: any) {
      console.error("Transaction error:", err)
      
      let errorMessage = "Transaction failed"
      
      if (err.code === "USER_REJECTED" || err.code === 4001) {
        errorMessage = "Transaction rejected by user"
      } else if (err.code === "INSUFFICIENT_FUNDS" || err.code === -32000) {
        errorMessage = "Insufficient funds for transaction"
      } else if (err.message && err.message.includes("already a member")) {
        errorMessage = "You are already a DAO member"
      } else if (err.message && err.message.includes("must stake")) {
        errorMessage = "You must stake BDAG tokens first"
      } else if (err.message && err.message.includes("must have minimum")) {
        errorMessage = "Insufficient CLT balance for membership fee"
      } else if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        errorMessage = err.message
      }
      
      // Handle specific approval errors
      if (status === "approving") {
        errorMessage = `Approval failed: ${errorMessage}`
        updateStepStatus(0, "error")
      } else {
        const errorStepIndex = requiresApproval ? 1 : 0
        updateStepStatus(errorStepIndex, "error")
      }
      
      setError(errorMessage)
      setStatus("error")
    }
  }

  const handleClose = () => {
    setStatus("pending")
    setTxHash("")
    setApprovalHash("")
    setError("")
    setCurrentStep(0)
    setSteps(getSteps())
    onClose()
  }

  const getStatusIcon = () => {
    switch (status) {
      case "approving":
        return <Coins className="h-6 w-6 animate-pulse text-amber-500" />
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
      case "approving":
        return "Approving token spending..."
      case "confirming":
        return requiresApproval ? "Executing DAO join transaction..." : "Confirming transaction on blockchain..."
      case "success":
        return "All transactions completed successfully!"
      case "error":
        return "Transaction failed"
      default:
        return "Confirm transaction in your wallet"
    }
  }

  const getProgressPercentage = () => {
    if (!requiresApproval) {
      return status === "success" ? 100 : status === "confirming" ? 50 : 0
    }
    
    const completedSteps = steps.filter(step => step.status === "completed").length
    return (completedSteps / steps.length) * 100
  }

  const openEtherscan = (hash: string) => {
    // Change this URL to match your network
    const etherscanUrl = `https://etherscan.io/tx/${hash}`
    window.open(etherscanUrl, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>

          {/* Multi-step progress */}
          {requiresApproval && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="w-full" />
              
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      step.status === "completed" ? "bg-green-500" :
                      step.status === "active" ? "bg-blue-500 animate-pulse" :
                      step.status === "error" ? "bg-red-500" :
                      "bg-gray-300"
                    }`} />
                    <span className={step.status === "active" ? "font-medium" : ""}>
                      {step.name}
                    </span>
                    {step.status === "completed" && step.hash && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-1 text-xs"
                        onClick={() => openEtherscan(step.hash!)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === "pending" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Estimated Gas Fee</span>
                <Badge variant="secondary">{gasEstimate}</Badge>
              </div>

              {requiresApproval && (
                <Alert className="border-amber-200 bg-amber-50">
                  <Coins className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    This transaction requires two steps: first approve CLT spending, then join the DAO.
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please confirm {requiresApproval ? "both transactions" : "this transaction"} in your wallet to proceed.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {(status === "approving" || status === "confirming") && (
            <div className="space-y-3">
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  {status === "approving" 
                    ? "Approving CLT token spending for DAO membership..." 
                    : "Transaction submitted and waiting for blockchain confirmation..."
                  }
                </AlertDescription>
              </Alert>
              
              {(txHash || approvalHash) && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {approvalHash && (
                    <p className="font-mono break-all">Approval Tx: {approvalHash}</p>
                  )}
                  {txHash && (
                    <p className="font-mono break-all">Main Tx: {txHash}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {status === "success" && (
            <div className="space-y-3">
              <Alert className="border-climate-green">
                <CheckCircle className="h-4 w-4 text-climate-green" />
                <AlertDescription>
                  {requiresApproval 
                    ? "DAO membership completed! Both approval and join transactions confirmed."
                    : "Your transaction has been confirmed on the blockchain."
                  }
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                {approvalHash && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => openEtherscan(approvalHash)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Approval on Etherscan
                  </Button>
                )}
                
                {txHash && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => openEtherscan(txHash)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View {requiresApproval ? "Join Transaction" : "Transaction"} on Etherscan
                  </Button>
                )}
              </div>
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
                <Button onClick={handleConfirm} className="">
                  {requiresApproval ? "Start Process" : "Confirm"}
                </Button>
              </>
            )}

            {(status === "approving" || status === "confirming") && (
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