"use client"

import { useEffect, type ReactNode, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useRole, type UserRole } from "@/lib/roles"
import { useWeb3 } from "@/lib/web3"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TransactionModal } from "@/components/blockchain/transaction-modal"
import { Loader2, Users, FileText, AlertCircle, ShieldCheck, Coins } from "lucide-react"

interface RoleGuardProps {
  children: ReactNode
  requiredRole?: UserRole | UserRole[]
  fallbackPath?: string
  allowStakerAccess?: boolean
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
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false)
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null)

  // Special handling for different pages
  const isDAOPage = pathname?.includes('/dao')
  const isValidationPage = pathname?.includes('/validate')
  const isPortfolioPage = pathname?.includes('/portfolio')
  const isProfilePage = pathname?.includes('/profile')
  const isSubmitPage = pathname?.includes('/submit')
  const isLandingPage = pathname === "/" || pathname === ""
  const isDashboardPage = pathname?.includes('/dashboard')

  // More careful redirect logic with proper delays
  useEffect(() => {
    // Don't redirect if we're already on the landing page or dashboard
    if (isLandingPage || isDashboardPage) {
      setHasCheckedConnection(true)
      return
    }

    // Clear any existing timer
    if (redirectTimer) {
      clearTimeout(redirectTimer)
      setRedirectTimer(null)
    }

    // Wait for initial loading to complete
    if (isLoading) {
      return
    }

    // Only start checking connection after a delay to avoid premature redirects
    if (!hasCheckedConnection) {
      const checkTimer = setTimeout(() => {
        setHasCheckedConnection(true)
      }, 2000) // 2 second delay before checking
      
      setRedirectTimer(checkTimer)
      return
    }

    // Only redirect if wallet was disconnected AFTER initial check
    if (!isConnected && hasCheckedConnection) {
      console.log("🔄 Wallet disconnected, redirecting to landing")
      const redirectTimer = setTimeout(() => {
        router.push(fallbackPath)
      }, 1000) // 1 second delay before redirect
      
      setRedirectTimer(redirectTimer)
    }

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer)
      }
    }
  }, [isConnected, isLoading, router, fallbackPath, hasCheckedConnection, isLandingPage, isDashboardPage])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer)
      }
    }
  }, [])

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
      return debugInfo.hasStaked || userRole === "dao_member"
    }

    if (isValidationPage) {
      return userRole === "validator" || userRole === "dao_member" || debugInfo.hasStaked
    }

    if (isPortfolioPage || isProfilePage) {
      return isMember || debugInfo.hasStaked
    }

    if (isSubmitPage) {
      return isMember
    }

    // Allow staker access if enabled
    if (allowStakerAccess && debugInfo.hasStaked) {
      return true
    }

    // Default: check membership
    return isMember
  }

  // Show loading state with longer wait time
  if (isLoading || !hasCheckedConnection) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isLoading ? "Loading user data..." : "Checking wallet connection..."}
          </p>
        </div>
      </div>
    )
  }

  // Not connected to wallet - show prompt instead of immediate redirect
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
            <div className="space-y-2">
              <Button onClick={() => router.push("/")}>Connect Wallet</Button>
              <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
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
            <Button onClick={() => window.location.reload()}>Retry Connection</Button>
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
    try {
      await stakeBDAG()
      
      // If on validation page, join as validator
      if (currentPage?.includes('/validate')) {
        setTimeout(async () => {
          try {
            await joinAsValidator()
            // Force page refresh after successful upgrade
            setTimeout(() => {
              window.location.reload()
            }, 2000)
          } catch (error) {
            console.error("Failed to join as validator:", error)
          }
        }, 2000)
      }
      
      return "Staking completed successfully"
    } catch (error) {
      console.error("Failed to stake:", error)
      throw error
    }
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
  const [isProcessing, setIsProcessing] = useState(false)

  const handleJoinReporter = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      await joinAsReporter()
      // Wait for transaction to complete, then redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (error) {
      console.error("Failed to join as reporter:", error)
      alert("Failed to join as reporter. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleJoinValidator = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      await joinAsValidator()
      // Wait for transaction to complete, then redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (error) {
      console.error("Failed to join as validator:", error)
      alert("Failed to join as validator. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStakeAndJoin = async (): Promise<string> => {
    try {
      // Stake BDAG first
      await stakeBDAG()
      
      // Then join as validator after a delay
      setTimeout(async () => {
        try {
          await joinAsValidator()
          // Redirect to dashboard after successful completion
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } catch (error) {
          console.error("Failed to join as validator:", error)
        }
      }, 2000)
      
      return "Staking BDAG and joining as validator..."
    } catch (error) {
      console.error("Failed to stake and join:", error)
      throw error
    }
  }

  const handleJoinDAO = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      if (!debugInfo.hasStaked) {
        await stakeBDAG()
        // Wait for staking to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      await joinDAO()
      // Wait for transaction to complete, then redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (error) {
      console.error("Failed to join DAO:", error)
      alert("Failed to join DAO. Make sure you have enough CLT tokens.")
    } finally {
      setIsProcessing(false)
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
            <h1 className="text-3xl font-bold text-green-600 mb-4">{title}</h1>
            <p className="text-muted-foreground">{suggestion}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
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
                <Button 
                  onClick={handleJoinReporter} 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
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
                  disabled={isProcessing}
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Stake & Become Validator
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
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
                  disabled={parseFloat(debugInfo.cltBalance) < parseFloat(debugInfo.membershipFee) || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
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