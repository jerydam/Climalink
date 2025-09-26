"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TransactionModal } from "@/components/blockchain/transaction-modal"
import { useWeb3 } from "@/lib/web3"
import { useRole } from "@/lib/roles"
import { Coins, Lock, FileText, Vote, UserPlus, Users, TrendingUp } from "lucide-react"

export function BlockchainActions() {
  const { isConnected, account, getContract } = useWeb3()
  const { userRole, isMember } = useRole()
  
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const handleJoinAsReporter = async (): Promise<string> => {
    const climateContract = getContract("CLIMATE")
    const tx = await climateContract.joinAsReporterOrValidator()
    return tx.hash
  }

  const handleStakeBDAG = async (): Promise<string> => {
    const tokenContract = getContract("TOKEN")
    const tx = await tokenContract.stakeBDAG()
    return tx.hash
  }

  const handleUpgradeToValidator = async (): Promise<string> => {
    // First stake BDAG, then check for role upgrade
    const tokenContract = getContract("TOKEN")
    const tx = await tokenContract.stakeBDAG()
    
    // After staking, try to upgrade role
    setTimeout(async () => {
      try {
        const climateContract = getContract("CLIMATE")
        await climateContract.checkAndUpgradeRole(account!)
      } catch (error) {
        console.error("Role upgrade failed:", error)
      }
    }, 3000)
    
    return tx.hash
  }

  const handleUnstakeBDAG = async (): Promise<string> => {
    const tokenContract = getContract("TOKEN")
    const tx = await tokenContract.unstakeBDAG()
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
      temperature: 2500, // 25.00°C in int128 format (scaled by 100)
      humidity: 65,
      location: "New York, NY",
      longitude: -74006000, // -74.006° in int128 format (scaled by 1000000)
      latitude: 40714000,   // 40.714° in int128 format (scaled by 1000000)
    }
    
    const tx = await climateContract.createClimateReport(reportData)
    return tx.hash
  }

  const handleValidateReport = async (): Promise<string> => {
    const climateContract = getContract("CLIMATE")
    
    // Get active reports for validation
    const activeReports = await climateContract.getActiveVotingReports()
    if (activeReports.length === 0) {
      throw new Error("No reports available for validation")
    }
    
    const reportIndex = activeReports[0] // First available report
    const isValid = 1 // VoteChoice.Valid
    
    const tx = await climateContract.voteOnReport(reportIndex, isValid)
    return tx.hash
  }

  const handleCheckRoleUpgrade = async (): Promise<string> => {
    const climateContract = getContract("CLIMATE")
    const tx = await climateContract.checkAndUpgradeRole(account!)
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

  // Show join options if user hasn't joined yet
  if (!isMember) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Join ClimaLink</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Choose how you want to participate - both roles can earn CLT tokens
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-climate-green/5 border-climate-green/20">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-climate-green" />
                <h4 className="font-medium">Reporter (Free)</h4>
              </div>
              <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                <li>• Submit weather reports</li>
                <li>• <strong>Earn 20 CLT per validated report</strong></li>
                <li>• View global climate data</li>
                <li>• Community participation</li>
              </ul>
              <Button 
                onClick={() => setActiveModal("join-reporter")} 
                className="w-full bg-climate-green hover:bg-climate-green/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join Free & Start Earning
              </Button>
            </div>

            <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Vote className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium">Validator (Staking)</h4>
              </div>
              <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                <li>• Validate community reports</li>
                <li>• <strong>Share reward pools for correct votes</strong></li>
                <li>• 1000 CLT staking bonus</li>
                <li>• DAO governance access</li>
              </ul>
              <Button 
                onClick={() => setActiveModal("stake-and-join")}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                Stake & Join
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              💡 <strong>Both roles earn:</strong> Reporters get 20 CLT when their reports are validated. 
              Validators share reward pools when they vote correctly on validations.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show role-specific actions for existing members
  return (
    <div className="space-y-6">
      {/* Main Platform Actions */}
      <div>
        <h3 className="font-semibold mb-3">Platform Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* All members can submit reports */}
          <Button 
            onClick={() => setActiveModal("submit")} 
            className="bg-climate-green hover:bg-climate-green/90"
          >
            <FileText className="h-4 w-4 mr-2" />
            Submit Report
            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">+20 CLT</span>
          </Button>

          {/* Only validators can validate */}
          {(userRole === "validator" || userRole === "dao_member") && (
            <Button 
              onClick={() => setActiveModal("validate")} 
              variant="outline"
            >
              <Vote className="h-4 w-4 mr-2" />
              Validate Reports
              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Share Pool</span>
            </Button>
          )}

          {/* Upgrade option for reporters */}
          {userRole === "reporter" && (
            <Button 
              onClick={() => setActiveModal("upgrade-to-validator")} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Become Validator
              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">+1000 CLT</span>
            </Button>
          )}
        </div>
      </div>

      {/* Earning Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-climate-green/5 border border-climate-green/20 rounded-lg">
          <h4 className="font-medium text-climate-green mb-2">Reporter Earnings</h4>
          <ul className="text-sm space-y-1">
            <li>• 20 CLT per validated report</li>
            <li>• Immediate payout when validated</li>
            <li>• No staking required</li>
          </ul>
        </div>
        
        {(userRole === "validator" || userRole === "dao_member") && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-600 mb-2">Validator Earnings</h4>
            <ul className="text-sm space-y-1">
              <li>• Share reward pools for correct votes</li>
              <li>• 1000 CLT staking bonus (one-time)</li>
              <li>• Higher rewards for accuracy</li>
            </ul>
          </div>
        )}
      </div>

      {/* Token Management (for validators) */}
      {(userRole === "validator" || userRole === "dao_member") && (
        <div>
          <h3 className="font-semibold mb-3">Token Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setActiveModal("stake-more")} 
              className="bg-sky-blue hover:bg-sky-blue/90"
            >
              <Lock className="h-4 w-4 mr-2" />
              Stake More BDAG
            </Button>

            <Button 
              onClick={() => setActiveModal("unstake")} 
              variant="outline"
            >
              <Coins className="h-4 w-4 mr-2" />
              Unstake BDAG
            </Button>

            <Button 
              onClick={() => setActiveModal("check-upgrade")} 
              variant="outline"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Check Role Status
            </Button>
          </div>
        </div>
      )}

      {/* DAO Actions */}
      {userRole === "validator" && (
        <div>
          <h3 className="font-semibold mb-3">DAO Membership</h3>
          <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-800">Ready for Full Governance?</p>
                <p className="text-sm text-amber-700">Join the DAO to vote on proposals and shape the platform's future</p>
              </div>
              <Button 
                onClick={() => setActiveModal("join-dao")} 
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Join DAO
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modals */}
      <TransactionModal
        isOpen={activeModal === "join-reporter"}
        onClose={() => setActiveModal(null)}
        title="Join as Reporter"
        description="Join ClimaLink as a Reporter completely free! Submit weather reports from any location and earn 20 CLT tokens when your reports are validated by the community. No staking required to start earning."
        onConfirm={handleJoinAsReporter}
      />

      <TransactionModal
        isOpen={activeModal === "stake-and-join"}
        onClose={() => setActiveModal(null)}
        title="Stake BDAG & Join as Validator"
        description="Stake 100 BDAG tokens to become a Validator. You'll receive 1000 CLT tokens immediately as a bonus, then earn rewards by correctly validating community reports. Winning validators share additional reward pools. Tokens are locked for 60 days."
        onConfirm={handleUpgradeToValidator}
      />

      <TransactionModal
        isOpen={activeModal === "upgrade-to-validator"}
        onClose={() => setActiveModal(null)}
        title="Upgrade to Validator"
        description="Upgrade from Reporter to Validator by staking 100 BDAG tokens. Keep earning 20 CLT per report PLUS share validator reward pools for correct votes. Get 1000 CLT bonus immediately!"
        onConfirm={handleUpgradeToValidator}
      />

      <TransactionModal
        isOpen={activeModal === "stake-more"}
        onClose={() => setActiveModal(null)}
        title="Stake More BDAG"
        description="Stake additional BDAG tokens to increase your commitment to the platform. Current minimum is 100 BDAG tokens with a 60-day lock period."
        onConfirm={handleStakeBDAG}
      />

      <TransactionModal
        isOpen={activeModal === "unstake"}
        onClose={() => setActiveModal(null)}
        title="Unstake BDAG Tokens"
        description="Unstake your BDAG tokens after the 60-day lock period. Warning: This will remove your Validator status, DAO membership, and ability to earn from validation reward pools."
        onConfirm={handleUnstakeBDAG}
      />

      <TransactionModal
        isOpen={activeModal === "join-dao"}
        onClose={() => setActiveModal(null)}
        title="Join ClimaLink DAO"
        description="Join the DAO for full governance participation. Requires 1000 CLT membership fee and maintaining your 100 BDAG stake. You'll get voting rights and can create proposals."
        onConfirm={handleJoinDAO}
      />

      <TransactionModal
        isOpen={activeModal === "submit"}
        onClose={() => setActiveModal(null)}
        title="Submit Weather Report"
        description="Submit a weather report to the blockchain for community validation. You'll earn 20 CLT tokens when your report is validated within the 24-hour validation period."
        onConfirm={handleSubmitReport}
      />

      <TransactionModal
        isOpen={activeModal === "validate"}
        onClose={() => setActiveModal(null)}
        title="Validate Weather Report"
        description="Vote on a community weather report during the 24-hour validation period. Validators who vote with the winning majority share reward pools. Help maintain data quality and earn rewards for accuracy."
        onConfirm={handleValidateReport}
      />

      <TransactionModal
        isOpen={activeModal === "check-upgrade"}
        onClose={() => setActiveModal(null)}
        title="Check Role Status"
        description="Check if you're eligible for role upgrades. Reporters who join the DAO are automatically upgraded to Validator status with enhanced privileges."
        onConfirm={handleCheckRoleUpgrade}
      />
    </div>
  )
}