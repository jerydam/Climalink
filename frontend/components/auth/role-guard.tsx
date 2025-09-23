"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useRole, type UserRole } from "@/lib/roles"
import { useWeb3 } from "@/lib/web3"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Users, FileText, AlertCircle } from "lucide-react"

interface RoleGuardProps {
  children: ReactNode
  requiredRole?: UserRole | UserRole[]
  fallbackPath?: string
}

export function RoleGuard({ children, requiredRole, fallbackPath = "/" }: RoleGuardProps) {
  const { userRole, isLoading, joinAsReporter, joinAsDAO } = useRole()
  const { isConnected } = useWeb3()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.push(fallbackPath)
    }
  }, [isConnected, isLoading, router, fallbackPath])

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

  // Check if user has required role
  if (requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const hasRequiredRole = requiredRoles.includes(userRole)

    if (!hasRequiredRole) {
      return <AccessDenied userRole={userRole} requiredRoles={requiredRoles} />
    }
  }

  // User has no role - show join options
  if (userRole === "none") {
    return <JoinPrompt />
  }

  return <>{children}</>
}

function AccessDenied({ userRole, requiredRoles }: { userRole: UserRole; requiredRoles: UserRole[] }) {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground mb-4">
            This page requires {requiredRoles.join(" or ")} access. Your current role:{" "}
            {userRole === "none" ? "No role assigned" : userRole}
          </p>
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

function JoinPrompt() {
  const { joinAsReporter, joinAsDAO } = useRole()
  const router = useRouter()

  const handleJoinReporter = async () => {
    try {
      await joinAsReporter()
      router.refresh()
    } catch (error) {
      console.error("Failed to join as reporter:", error)
    }
  }

  const handleJoinDAO = async () => {
    try {
      await joinAsDAO()
      router.refresh()
    } catch (error) {
      console.error("Failed to join DAO:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-climate-green mb-4">Join ClimaLink</h1>
          <p className="text-muted-foreground">Choose your role to start participating in the ClimaLink ecosystem</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-climate-green" />
                Join as Reporter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Submit weather reports, earn CLT tokens, and contribute to climate data collection.
              </p>
              <ul className="text-sm text-muted-foreground mb-6 space-y-1">
                <li>• Submit weather reports</li>
                <li>• Earn CLT token rewards</li>
                <li>• Access reporting dashboard</li>
                <li>• View your submission history</li>
              </ul>
              <Button onClick={handleJoinReporter} className="w-full">
                Join as Reporter
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-climate-green" />
                Join DAO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Participate in governance, validate reports, and shape the future of ClimaLink.
              </p>
              <ul className="text-sm text-muted-foreground mb-6 space-y-1">
                <li>• Vote on proposals</li>
                <li>• Validate weather reports</li>
                <li>• Create governance proposals</li>
                <li>• Earn staking rewards</li>
              </ul>
              <Alert className="mb-4">
                <AlertDescription className="text-xs">
                  Requires minimum 1,000 CLT tokens for membership fee
                </AlertDescription>
              </Alert>
              <Button onClick={handleJoinDAO} className="w-full">
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
  )
}
