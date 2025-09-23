"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TransactionModal } from "./transaction-modal"
import { useContract } from "@/hooks/use-contract"
import { useWeb3 } from "@/lib/web3"
import { Coins, Lock, FileText, Vote } from "lucide-react"

export function BlockchainActions() {
  const { isConnected } = useWeb3()
  const tokenContract = useContract("TOKEN")
  const climateContract = useContract("CLIMATE")

  const [activeModal, setActiveModal] = useState<string | null>(null)

  const handleStakeBDAG = async () => {
    await tokenContract.write("stakeBDAG")
  }

  const handleUnstakeBDAG = async () => {
    await tokenContract.write("unstakeBDAG")
  }

  const handleSubmitReport = async () => {
    const reportData = {
      weather: "Sunny",
      temperature: 25,
      humidity: 60,
      location: "New York, NY",
      longitude: -74006,
      latitude: 40714,
    }
    await climateContract.write("createClimateReport", [reportData])
  }

  const handleValidateReport = async () => {
    await climateContract.write("validateReport", [1, true])
  }

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Connect your wallet to interact with smart contracts</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button onClick={() => setActiveModal("stake")} className="bg-sky-blue hover:bg-sky-blue/90">
          <Lock className="h-4 w-4 mr-2" />
          Stake BDAG
        </Button>

        <Button onClick={() => setActiveModal("unstake")} variant="outline">
          <Coins className="h-4 w-4 mr-2" />
          Unstake BDAG
        </Button>

        <Button onClick={() => setActiveModal("submit")} className="bg-climate-green hover:bg-climate-green/90">
          <FileText className="h-4 w-4 mr-2" />
          Submit Report
        </Button>

        <Button onClick={() => setActiveModal("validate")} variant="outline">
          <Vote className="h-4 w-4 mr-2" />
          Validate Report
        </Button>
      </div>

      <TransactionModal
        isOpen={activeModal === "stake"}
        onClose={() => setActiveModal(null)}
        title="Stake BDAG Tokens"
        description="Stake 100 BDAG tokens to become a DAO member and earn CLT rewards."
        gasEstimate="0.003 ETH"
        onConfirm={handleStakeBDAG}
      />

      <TransactionModal
        isOpen={activeModal === "unstake"}
        onClose={() => setActiveModal(null)}
        title="Unstake BDAG Tokens"
        description="Unstake your BDAG tokens. This will remove your DAO membership."
        gasEstimate="0.002 ETH"
        onConfirm={handleUnstakeBDAG}
      />

      <TransactionModal
        isOpen={activeModal === "submit"}
        onClose={() => setActiveModal(null)}
        title="Submit Weather Report"
        description="Submit your weather report to the blockchain and earn 20 CLT tokens if validated."
        gasEstimate="0.004 ETH"
        onConfirm={handleSubmitReport}
      />

      <TransactionModal
        isOpen={activeModal === "validate"}
        onClose={() => setActiveModal(null)}
        title="Validate Report"
        description="Validate a community weather report and earn validation rewards."
        gasEstimate="0.002 ETH"
        onConfirm={handleValidateReport}
      />
    </div>
  )
}
