"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useRole, type UserRole } from "@/lib/roles"
import { useWeb3 } from "@/lib/web3"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TransactionModal } from "@/components/blockchain/transaction-modal"
import { Loader2, Users, FileText, AlertCircle, ShieldCheck, Coins } from "lucide-react"
import { useState } from "react"

interface RoleGuardProps {
  children: ReactNode
  requiredRole?: UserRole | UserRole[]
  fallbackPath?: string
  allowStakerAccess?: boolean // Allow users with staked BDAG
}

export function RoleGuard({ 
  children, 
  requiredRole, 
  fallbackPath = "/",
  allowStakerAccess = false
}: RoleGuardProps) {
  const { userRole, isLoading, isMember, debugInfo } = useRole()
  const { isConnected, isCorrectNetwork } = useWeb3()
  const router = useRouter()
  const pathname = usePathname()

  // Special handling for different pages
  const isDAOPage = pathname?.includes('/dao')
  const isValidationPage = pathname?.includes('/validate')
  const isPortfolioPage = pathname?.includes('/portfolio')
  const isProfilePage = pathname?.includes('/profile')
  const isSubmitPage = pathname?.includes('/submit')

  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.push(fallbackPath)
    }
  }, [isConnected, isLoading, router, fallbackPath])

  // Determine if user has access based on smart rules
  const hasAccess = () => {
    // Always allow if user has required role
    if (requiredRole) {
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (requiredRoles.includes(userRole)) {
        return true
      }
    }

    // Special cases for different pages
    if (isDAOPage) {
      // DAO page: Allow if user has staked (even if role isn't updated)
      return debugInfo.hasStaked || userRole === "dao_member"
    }

    if (isValidationPage) {
      // Validation page: Allow validators, DAO members, or users with staked BDAG
      return userRole === "validator" || userRole === "dao_member" || debugInfo.hasStaked
    }

    if (isPortfolioPage || isProfilePage) {
      // Portfolio/Profile: Allow any member or staker
      return isMember || debugInfo.hasStaked
    }

    if (isSubmitPage) {
      // Submit page: Allow any member
      return isMember
    }

    // Allow staker access if enabled
    if (allowStakerAccess && debugInfo.hasStaked) {
      return true
    }

    // Default: check membership
    return isMember
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    )
  }

  // Not connected to wallet
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Wallet Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Please connect your wallet to access this page.</p>
            <Button onClick={() => router.push("/")}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Wrong Network</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <p className="text-muted-foreground mb-4">Please connect to the BlockDAG network.</p>
            <Button onClick={() => router.push("/")}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check access
  if (hasAccess()) {
    return <>{children}</>
  }

  // Show appropriate access denied screen
  if (userRole === "none" && !debugInfo.hasStaked) {
    return <JoinPrompt currentPage={pathname} />
  }

  return <AccessDenied userRole={userRole} requiredRoles={requiredRole} currentPage={pathname} />
}

function AccessDenied({ 
  userRole, 
  requiredRoles, 
  currentPage 
}: { 
  userRole: UserRole
  requiredRoles?: UserRole | UserRole[]
  currentPage?: string
}) {
  const router = useRouter()
  const { debugInfo, joinAsValidator, joinDAO, stakeBDAG } = useRole()
  const [showStakeModal, setShowStakeModal] = useState(false)

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case "dao_member": return "DAO Member"
      case "reporter": return "Reporter"
      case "validator": return "Validator"
      default: return "No role"
    }
  }

  const getRequiredRolesText = () => {
    if (!requiredRoles) return "appropriate access"
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return roles.map(getRoleDisplayName).join(" or ")
  }

  const handleStakeAndUpgrade = async (): Promise<string> => {
    await stakeBDAG()
    
    // If on validation page, join as validator
    if (currentPage?.includes('/validate')) {
      setTimeout(async () => {
        await joinAsValidator()
        window.location.reload()
      }, 2000)
    }
    
    return "Staking completed"
  }

  // Special handling for reporters trying to access validation
  if (userRole === "reporter" && currentPage?.includes('/validate')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Upgrade to Validator</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Coins className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <p className="text-muted-foreground mb-4">
              Validation requires validator status. Stake 100 BDAG tokens to upgrade and access validation features.
            </p>
            <div className="text-sm text-muted-foreground mb-4">
              <p>Current role: {getRoleDisplayName(userRole)}</p>
              <p>BDAG staked: {parseFloat(debugInfo.stakedAmount).toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => setShowStakeModal(true)}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                <Coins className="h-4 w-4 mr-2" />
                Stake BDAG & Upgrade
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <TransactionModal
          isOpen={showStakeModal}
          onClose={() => setShowStakeModal(false)}
          title="Stake BDAG & Upgrade to Validator"
          description="This will stake 100 BDAG tokens and upgrade you to validator status, giving you access to validation features."
          onConfirm={handleStakeAndUpgrade}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground mb-2">
            This page requires {getRequiredRolesText()} access.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Your current role: {getRoleDisplayName(userRole)}
          </p>
          
          {debugInfo.hasStaked && (
            <Alert className="mb-4 text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have staked BDAG tokens. Your role should update to "validator" soon. 
                Try refreshing the page or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="w-full">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function JoinPrompt({ currentPage }: { currentPage?: string }) {
  const { joinAsReporter, joinAsValidator, joinDAO, stakeBDAG, debugInfo } = useRole()
  const router = useRouter()
  const [showStakeModal, setShowStakeModal] = useState(false)

  const handleJoinReporter = async () => {
    try {
      await joinAsReporter()
      window.location.reload()
    } catch (error) {
      console.error("Failed to join as reporter:", error)
      alert("Failed to join as reporter. Please try again.")
    }
  }

  const handleJoinValidator = async () => {
    try {
      await joinAsValidator()
      window.location.reload()
    } catch (error) {
      console.error("Failed to join as validator:", error)
      alert("Failed to join as validator. Please try again.")
    }
  }

  const handleStakeAndJoin = async (): Promise<string> => {
    try {
      // Stake BDAG first
      await stakeBDAG()
      
      // Then join as validator
      setTimeout(async () => {
        await joinAsValidator()
        window.location.reload()
      }, 2000)
      
      return "Staking and joining as validator..."
    } catch (error) {
      console.error("Failed to stake and join:", error)
      throw error
    }
  }

  const handleJoinDAO = async () => {
    try {
      if (!debugInfo.hasStaked) {
        await stakeBDAG()
      }
      await joinDAO()
      window.location.reload()
    } catch (error) {
      console.error("Failed to join DAO:", error)
      alert("Failed to join DAO. Make sure you have enough CLT tokens.")
    }
  }

  // Suggest appropriate role based on the current page
  const getSuggestedAction = () => {
    if (currentPage?.includes('/validate')) {
      return {
        title: "Validation requires validator access",
        suggestion: "Become a validator to validate reports and earn rewards",
        primaryAction: handleJoinValidator,
        primaryText: "Stake & Become Validator"
      }
    }
    
    if (currentPage?.includes('/dao')) {
      return {
        title: "DAO requires membership",
        suggestion: "Join the DAO to participate in governance",
        primaryAction: handleJoinDAO,
        primaryText: "Join DAO"
      }
    }

    return {
      title: "Choose your role",
      suggestion: "Select a role to start participating in ClimaLink",
      primaryAction: handleJoinReporter,
      primaryText: "Join as Reporter"
    }
  }

  const { title, suggestion, primaryAction, primaryText } = getSuggestedAction()

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-climate-green mb-4">{title}</h1>
            <p className="text-muted-foreground">{suggestion}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-climate-green" />
                  Reporter (Free)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Submit weather reports and earn 20 CLT per validated report.
                </p>
                <ul className="text-sm text-muted-foreground mb-6 space-y-1">
                  <li>• Submit weather reports</li>
                  <li>• Earn CLT token rewards</li>
                  <li>• Access reporting dashboard</li>
                  <li>• View community data</li>
                </ul>
                <Button onClick={handleJoinReporter} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Join as Reporter
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-600" />
                  Validator (Requires Staking)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Validate reports, earn rewards, and get 1000 CLT staking bonus.
                </p>
                <ul className="text-sm text-muted-foreground mb-6 space-y-1">
                  <li>• Validate weather reports</li>
                  <li>• Earn validation rewards</li>
                  <li>• 1000 CLT staking bonus</li>
                  <li>• Access validation features</li>
                </ul>
                <Button 
                  onClick={() => setShowStakeModal(true)}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Stake & Become Validator
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-climate-green" />
                  DAO Member
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Participate in governance and shape ClimaLink's future.
                </p>
                <ul className="text-sm text-muted-foreground mb-6 space-y-1">
                  <li>• Vote on proposals</li>
                  <li>• Create governance proposals</li>
                  <li>• Validate reports</li>
                  <li>• Earn staking rewards</li>
                </ul>
                <Alert className="mb-4">
                  <AlertDescription className="text-xs">
                    Requires {debugInfo.membershipFee} CLT tokens + staking
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleJoinDAO} 
                  className="w-full"
                  disabled={parseFloat(debugInfo.cltBalance) < parseFloat(debugInfo.membershipFee)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join DAO
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={showStakeModal}
        onClose={() => setShowStakeModal(false)}
        title="Stake BDAG & Become Validator"
        description="This will stake 100 BDAG tokens and upgrade you to validator status. You'll receive 1000 CLT tokens as a bonus and gain access to validation features."
        onConfirm={handleStakeAndJoin}
      />
    </>
  )
}