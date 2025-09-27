"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { BackButton } from "@/components/ui/back-button"
import { CreateProposalModal } from "@/components/dao/create-proposal-modal"
import { MembershipStatus } from "@/components/dao/membership-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TransactionModal } from "@/components/blockchain/transaction-modal"
import { useRole } from "@/lib/roles"
import { useWeb3 } from "@/lib/web3"
import { Loader2, Users, Coins, AlertTriangle, CheckCircle, XCircle, Crown, Vote, TrendingUp } from "lucide-react"
import { ethers } from "ethers"

interface DAOEligibility {
  hasStaked: boolean
  hasCLTBalance: boolean
  requiredCLT: string
  currentCLT: string
  stakedAmount: string
  canJoin: boolean
  alreadyMember: boolean
  isLoading: boolean
}

interface Proposal {
  id: number
  name: string
  description: string
  deadline: number
  proposer: string
  status: number
  forVotes: number
  againstVotes: number
  abstainVotes: number
  totalVotes: number
  executed: boolean
  quorumRequired: number
  createdAt: number
}

function LoadingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading DAO information...</p>
          </div>
        </div>
      </main>
    </div>
  )
}

function DAOJoinSection({ eligibility }: { eligibility: DAOEligibility }) {
  const [showJoinModal, setShowJoinModal] = useState(false)
  const { checkRole } = useRole()
  const { getContract, isConnected, isCorrectNetwork } = useWeb3()

  const handleJoinDAO = async (): Promise<string> => {
    if (!isConnected || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    const daoContract = getContract("DAO")
    if (!daoContract) {
      throw new Error("DAO contract not available")
    }

    const tx = await daoContract.joinDao()
    
    // Refresh role after transaction
    setTimeout(() => {
      checkRole()
      window.location.reload()
    }, 3000)
    
    return tx.hash
  }

  // Get contract addresses safely
  const getDaoContractAddress = () => {
    const daoContract = getContract("DAO")
    if (!daoContract) return undefined
    
    // Try different ways to get the contract address
    return daoContract.target || daoContract.address || daoContract.getAddress?.()
  }

  const handleOpenJoinModal = () => {
    const daoAddress = getDaoContractAddress()
    console.log("DAO Contract Address:", daoAddress)
    console.log("Approval Amount:", eligibility.requiredCLT)
    
    if (!daoAddress) {
      alert("DAO contract not available. Please try again.")
      return
    }
    
    if (!eligibility.requiredCLT || eligibility.requiredCLT === "0") {
      alert("Invalid membership fee amount. Please refresh the page.")
      return
    }
    
    setShowJoinModal(true)
  }

  if (eligibility.isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Checking DAO eligibility...</span>
        </CardContent>
      </Card>
    )
  }

  if (eligibility.alreadyMember) {
    return (
      <Card className="border-green-200 bg-green-50 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="text-center">
              <h3 className="font-semibold text-green-800">Welcome DAO Member!</h3>
              <p className="text-sm text-green-700">You have full access to DAO governance features</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-purple-200 bg-purple-50 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            Join the DAO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-purple-800">
            Join the DAO to participate in governance, vote on proposals, and shape the future of ClimaLink.
          </p>

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">BDAG Staked</p>
              <p className="text-lg font-bold">{parseFloat(eligibility.stakedAmount).toFixed(0)}</p>
              {eligibility.hasStaked ? (
                <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mx-auto mt-1" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">CLT Balance</p>
              <p className="text-lg font-bold">{parseFloat(eligibility.currentCLT).toFixed(0)}</p>
              {eligibility.hasCLTBalance ? (
                <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mx-auto mt-1" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Membership Fee</p>
              <p className="text-lg font-bold">{eligibility.requiredCLT} CLT</p>
              <Coins className="h-4 w-4 text-purple-500 mx-auto mt-1" />
            </div>
          </div>

          {/* Requirements Check */}
          <div className="space-y-3">
            <h4 className="font-medium text-purple-800">Membership Requirements:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Stake 100+ BDAG tokens</span>
                <div className="flex items-center gap-2">
                  {eligibility.hasStaked ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={eligibility.hasStaked ? "text-green-600" : "text-red-600"}>
                    {eligibility.hasStaked ? "Complete" : "Required"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Hold {eligibility.requiredCLT}+ CLT tokens</span>
                <div className="flex items-center gap-2">
                  {eligibility.hasCLTBalance ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={eligibility.hasCLTBalance ? "text-green-600" : "text-red-600"}>
                    {eligibility.hasCLTBalance ? "Complete" : `Need ${(parseFloat(eligibility.requiredCLT) - parseFloat(eligibility.currentCLT)).toFixed(0)} more`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {eligibility.canJoin ? (
            <div className="space-y-3">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  You meet all requirements! You can join the DAO now.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleOpenJoinModal}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Join DAO (Pay {eligibility.requiredCLT} CLT Fee)
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {!eligibility.hasStaked && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Step 1:</strong> You need to stake at least 100 BDAG tokens first. 
                    <Button variant="link" className="p-0 h-auto text-amber-800 underline ml-1">
                      Visit Portfolio to stake
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {eligibility.hasStaked && !eligibility.hasCLTBalance && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Step 2:</strong> You need {eligibility.requiredCLT} CLT tokens. 
                    Earn CLT by submitting weather reports (20 CLT each) or participating in validation.
                  </AlertDescription>
                </Alert>
              )}
              <Button 
                disabled
                className="w-full"
                size="lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Join DAO (Requirements Not Met)
              </Button>
              
              {/* Helpful Actions */}
              <div className="grid grid-cols-1 gap-2 text-sm">
                {!eligibility.hasStaked && (
                  <Button variant="outline" onClick={() => window.location.href = '/portfolio'}>
                    Go to Portfolio to Stake BDAG
                  </Button>
                )}
                {eligibility.hasStaked && !eligibility.hasCLTBalance && (
                  <Button variant="outline" onClick={() => window.location.href = '/reports'}>
                    Submit Reports to Earn CLT
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Join Modal */}
      {showJoinModal && (
        <TransactionModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          title="Join DAO"
          description={`Pay ${eligibility.requiredCLT} CLT tokens to join the DAO. You'll gain voting rights, proposal creation, and governance participation.`}
          onConfirm={handleJoinDAO}
          requiresApproval={true}
          approvalAmount={eligibility.requiredCLT}
          approvalSpender={getDaoContractAddress()}
        />
      )}
    </>
  )
}

function ProposalsList({ proposals, isReadonly = false }: { proposals: Proposal[], isReadonly?: boolean }) {
  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No proposals available at this time.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <Card key={proposal.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-lg">{proposal.name}</CardTitle>
                <Badge variant={proposal.status === 0 ? "default" : proposal.executed ? "secondary" : "outline"}>
                  {proposal.status === 0 ? "Active" : proposal.executed ? "Executed" : "Pending"}
                </Badge>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Proposal #{proposal.id}</p>
                {proposal.deadline > Date.now() / 1000 && (
                  <p>{Math.ceil((proposal.deadline - Date.now() / 1000) / 86400)} days left</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{proposal.description}</p>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">For</p>
                <p className="text-lg font-bold text-green-600">{proposal.forVotes}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Against</p>
                <p className="text-lg font-bold text-red-600">{proposal.againstVotes}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abstain</p>
                <p className="text-lg font-bold text-gray-600">{proposal.abstainVotes}</p>
              </div>
            </div>

            {isReadonly && (
              <Alert>
                <Vote className="h-4 w-4" />
                <AlertDescription>
                  Join the DAO to vote on proposals and participate in governance.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function DAOPage() {
  const [eligibility, setEligibility] = useState<DAOEligibility>({
    hasStaked: false,
    hasCLTBalance: false,
    requiredCLT: "1000",
    currentCLT: "0",
    stakedAmount: "0",
    canJoin: false,
    alreadyMember: false,
    isLoading: true
  })
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoadingProposals, setIsLoadingProposals] = useState(true)
  
  const { isConnected, getContract, account, isCorrectNetwork, provider } = useWeb3()
  const router = useRouter()

  // Debug functions
  const debugContractAddresses = () => {
    const tokenContract = getContract("TOKEN")
    const daoContract = getContract("DAO")
    
    console.log("Debug Contract Info:")
    console.log("Token Contract:", tokenContract?.address || "Not found")
    console.log("DAO Contract:", daoContract?.address || "Not found")
    console.log("Connected Account:", account)
    console.log("Network Connected:", isCorrectNetwork)
    console.log("Provider:", !!provider)
  }

  const testBasicContractCalls = async () => {
    try {
      const tokenContract = getContract("TOKEN")
      const daoContract = getContract("DAO")
      
      if (!tokenContract || !daoContract) {
        console.error("Contracts not available")
        return
      }
      
      console.log("Testing basic contract calls...")
      
      // Test DAO calls
      try {
        const membershipFee = await daoContract.MEMBERSHIP_FEE()
        console.log("✅ DAO MEMBERSHIP_FEE:", ethers.formatEther(membershipFee), "CLT")
      } catch (e) {
        console.error("❌ Failed to get membership fee:", e.message)
      }
      
      try {
        const isMember = await daoContract.isMember(account)
        console.log("✅ DAO isMember:", isMember)
      } catch (e) {
        console.error("❌ Failed to check membership:", e.message)
      }
      
      // Test Token calls
      try {
        const balance = await tokenContract.balanceOf(account)
        console.log("✅ Token balance:", ethers.formatEther(balance), "CLT")
      } catch (e) {
        console.error("❌ Failed to get token balance:", e.message)
      }
      
      try {
        const stakedAmount = await tokenContract.getStakedAmount(account)
        console.log("✅ Staked amount:", ethers.formatEther(stakedAmount), "BDAG")
      } catch (e) {
        console.error("❌ Failed to get staked amount:", e.message)
      }
      
    } catch (error) {
      console.error("❌ Test failed:", error)
    }
  }

  const runDiagnostics = () => {
    console.log("🔍 Running DAO Diagnostics...")
    debugContractAddresses()
    testBasicContractCalls()
  }

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  useEffect(() => {
    const checkEligibility = async () => {
      if (!isConnected || !account || !isCorrectNetwork) {
        setEligibility(prev => ({ ...prev, isLoading: false }))
        return
      }

      try {
        const tokenContract = getContract("TOKEN")
        const daoContract = getContract("DAO")

        if (!tokenContract || !daoContract) {
          console.warn("Contracts not available")
          setEligibility(prev => ({ ...prev, isLoading: false }))
          return
        }

        // Check DAO membership first (this is the most important check)
        let isDaoMember = false
        try {
          isDaoMember = await daoContract.isMember(account)
        } catch (memberError) {
          console.warn("Could not check DAO membership:", memberError.message)
          // Continue with other checks
        }
        
        if (isDaoMember) {
          // If already a member, set state and return early
          setEligibility({
            hasStaked: true,
            hasCLTBalance: true,
            requiredCLT: "1000",
            currentCLT: "0",
            stakedAmount: "0",
            canJoin: false,
            alreadyMember: true,
            isLoading: false
          })
          return
        }

        // Get membership fee and other requirements with individual error handling
        let membershipFee = ethers.parseEther("1000") // Default fallback
        let stakedAmount = BigInt(0)
        let cltBalance = BigInt(0)

        try {
          membershipFee = await daoContract.MEMBERSHIP_FEE()
        } catch (feeError) {
          console.warn("Could not get membership fee, using default 1000 CLT:", feeError.message)
        }

        try {
          stakedAmount = await tokenContract.getStakedAmount(account)
        } catch (stakeError) {
          console.warn("Could not get staked amount:", stakeError.message)
        }

        try {
          cltBalance = await tokenContract.balanceOf(account)
        } catch (balanceError) {
          console.warn("Could not get CLT balance:", balanceError.message)
        }

        const requiredCLT = ethers.formatEther(membershipFee)
        const currentCLT = ethers.formatEther(cltBalance)
        const stakedFormatted = ethers.formatEther(stakedAmount)
        
        const hasStaked = parseFloat(stakedFormatted) >= 100
        const hasCLTBalance = parseFloat(currentCLT) >= parseFloat(requiredCLT)
        const canJoin = hasStaked && hasCLTBalance && !isDaoMember

        setEligibility({
          hasStaked,
          hasCLTBalance,
          requiredCLT,
          currentCLT,
          stakedAmount: stakedFormatted,
          canJoin,
          alreadyMember: isDaoMember,
          isLoading: false
        })
      } catch (error) {
        console.error("Error checking DAO eligibility:", error)
        
        // Set default state on error
        setEligibility({
          hasStaked: false,
          hasCLTBalance: false,
          requiredCLT: "1000",
          currentCLT: "0",
          stakedAmount: "0",
          canJoin: false,
          alreadyMember: false,
          isLoading: false
        })
      }
    }

    const loadProposals = async () => {
      if (!isConnected || !account || !isCorrectNetwork) {
        setIsLoadingProposals(false)
        return
      }

      try {
        const daoContract = getContract("DAO")
        if (!daoContract) {
          setIsLoadingProposals(false)
          return
        }

        const proposalsList = await daoContract.viewProposals()
        setProposals(proposalsList || [])
      } catch (error) {
        console.error("Error loading proposals:", error)
        setProposals([])
      } finally {
        setIsLoadingProposals(false)
      }
    }

    checkEligibility()
    loadProposals()
  }, [isConnected, account, getContract, isCorrectNetwork])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Connect your wallet to access DAO features</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please connect to the BlockDAG network</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (eligibility.isLoading) {
    return <LoadingPage />
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="space-y-8">
          <BackButton href="/dashboard">Back to Dashboard</BackButton>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">DAO Governance</h1>
            <p className="text-muted-foreground">
              Participate in ClimaLink governance, vote on proposals, and shape the platform's future
            </p>
          </div>

          {/* Debug Button (remove in production) */}
          <Button 
            variant="outline" 
            onClick={runDiagnostics}
            className="mb-4"
            size="sm"
          >
            Run Diagnostics
          </Button>

          {/* Join Section - Always show this */}
          <DAOJoinSection eligibility={eligibility} />

          {/* DAO Content */}
          {eligibility.alreadyMember ? (
            <>
              {/* Full DAO Member Experience */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Active Proposals</h2>
                <CreateProposalModal />
              </div>
              
              {isLoadingProposals ? (
                <Card>
                  <CardContent className="p-8 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading proposals...</span>
                  </CardContent>
                </Card>
              ) : (
                <ProposalsList proposals={proposals} />
              )}
              
              <MembershipStatus />
            </>
          ) : (
            <>
              {/* Limited View for Non-Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Public Proposals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    View active governance proposals. Join the DAO to vote and create proposals.
                  </p>
                  {isLoadingProposals ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading proposals...</span>
                    </div>
                  ) : (
                    <ProposalsList proposals={proposals} isReadonly />
                  )}
                </CardContent>
              </Card>

              {/* Benefits Preview */}
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-purple-800">DAO Member Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Vote className="h-4 w-4 text-purple-600" />
                      <span>Vote on all governance proposals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span>Create new proposals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span>Participate in protocol decisions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-600" />
                      <span>Access to exclusive governance features</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}