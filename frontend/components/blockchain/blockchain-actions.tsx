"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TransactionModal } from "@/components/blockchain/transaction-modal"
import { useWeb3 } from "@/lib/web3"
import { useRole } from "@/lib/roles"
import { Coins, Lock, FileText, Vote, UserPlus, Users } from "lucide-react"

export function BlockchainActions() {
  const { isConnected, account, getContract } = useWeb3()
  const { userRole, isMember } = useRole()
  
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const handleStakeBDAG = async (): Promise<string> => {
    const tokenContract = getContract("TOKEN")
    const tx = await tokenContract.stakeBDAG()
    return tx.hash
  }

  const handleUnstakeBDAG = async (): Promise<string> => {
    const tokenContract = getContract("TOKEN")
    const tx = await tokenContract.unstakeBDAG()
    return tx.hash
  }

  const handleJoinAsReporter = async (): Promise<string> => {
    const climateContract = getContract("CLIMATE")
    const tx = await climateContract.joinAsReporterOrValidator(false) // false = reporter
    return tx.hash
  }

  const handleJoinAsValidator = async (): Promise<string> => {
    const climateContract = getContract("CLIMATE")
    const tx = await climateContract.joinAsReporterOrValidator(true) // true = validator
    return tx.hash
  }

  const handleJoinDAO = async (): Promise<string> => {
    const daoContract = getContract("DAO")
    const tx = await daoContract.joinDao()
    return tx.hash
  }

  const handleSubmitReport = async (): Promise<string> => {
    const climateContract = getContract("CLIMATE")
    
    // Sample report data - in a real app this would come from a form
    const reportData = {
      weather: "sunny",
      temperature: 2500, // 25.00°C in int128 format
      humidity: 65,
      location: "New York, NY",
      longitude: -74006000, // Longitude in int128 format
      latitude: 40714000,   // Latitude in int128 format
    }
    
    const tx = await climateContract.createClimateReport(reportData)
    return tx.hash
  }

  const handleValidateReport = async (): Promise<string> => {
    const climateContract = getContract("CLIMATE")
    
    // In a real app, you'd select a specific report to validate
    const reportIndex = 0 // First report as example
    const isValid = true   // Mark as valid
    
    const tx = await climateContract.validateReport(reportIndex, isValid)
    return tx.hash
  }

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Connect your wallet to interact with smart contracts</p>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Membership Actions */}
      {!isMember && (
        <div>
          <h3 className="font-semibold mb-3">Join ClimaLink</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setActiveModal("join-reporter")} 
              className="bg-climate-green hover:bg-climate-green/90"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Join as Reporter
            </Button>

            <Button 
              onClick={() => setActiveModal("join-validator")} 
              variant="outline"
            >
              <Vote className="h-4 w-4 mr-2" />
              Join as Validator
            </Button>

            <Button 
              onClick={() => setActiveModal("join-dao")} 
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Join DAO
            </Button>
          </div>
        </div>
      )}

      {/* Main Actions */}
      {isMember && (
        <div>
          <h3 className="font-semibold mb-3">Contract Interactions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => setActiveModal("stake")} 
              className="bg-sky-blue hover:bg-sky-blue/90"
            >
              <Lock className="h-4 w-4 mr-2" />
              Stake BDAG
            </Button>

            <Button 
              onClick={() => setActiveModal("unstake")} 
              variant="outline"
            >
              <Coins className="h-4 w-4 mr-2" />
              Unstake BDAG
            </Button>

            {(userRole === "reporter" || userRole === "dao_member") && (
              <Button 
                onClick={() => setActiveModal("submit")} 
                className="bg-climate-green hover:bg-climate-green/90"
              >
                <FileText className="h-4 w-4 mr-2" />
                Submit Report
              </Button>
            )}

            {(userRole === "validator" || userRole === "dao_member") && (
              <Button 
                onClick={() => setActiveModal("validate")} 
                variant="outline"
              >
                <Vote className="h-4 w-4 mr-2" />
                Validate Report
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Transaction Modals */}
      <TransactionModal
        isOpen={activeModal === "join-reporter"}
        onClose={() => setActiveModal(null)}
        title="Join as Reporter"
        description="Register as a climate reporter to submit weather reports and earn CLT tokens."
        onConfirm={handleJoinAsReporter}
      />

      <TransactionModal
        isOpen={activeModal === "join-validator"}
        onClose={() => setActiveModal(null)}
        title="Join as Validator"
        description="Register as a validator to review weather reports and maintain data quality."
        onConfirm={handleJoinAsValidator}
      />

      <TransactionModal
        isOpen={activeModal === "join-dao"}
        onClose={() => setActiveModal(null)}
        title="Join ClimaLink DAO"
        description="Join the DAO to participate in governance and vote on proposals. Requires staking BDAG tokens first."
        onConfirm={handleJoinDAO}
      />

      <TransactionModal
        isOpen={activeModal === "stake"}
        onClose={() => setActiveModal(null)}
        title="Stake BDAG Tokens"
        description="Stake BDAG tokens to become a DAO member and earn CLT rewards. Tokens will be locked for 30 days."
        onConfirm={handleStakeBDAG}
      />

      <TransactionModal
        isOpen={activeModal === "unstake"}
        onClose={() => setActiveModal(null)}
        title="Unstake BDAG Tokens"
        description="Unstake your BDAG tokens. This will remove your DAO membership and voting rights."
        onConfirm={handleUnstakeBDAG}
      />

      <TransactionModal
        isOpen={activeModal === "submit"}
        onClose={() => setActiveModal(null)}
        title="Submit Weather Report"
        description="Submit a weather report to the blockchain. You'll earn 20 CLT tokens if the report is validated by the community."
        onConfirm={handleSubmitReport}
      />

      <TransactionModal
        isOpen={activeModal === "validate"}
        onClose={() => setActiveModal(null)}
        title="Validate Weather Report"
        description="Validate a community weather report. You'll earn validation rewards for accurate assessments."
        onConfirm={handleValidateReport}
      />
    </div>
  )
}