"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useWeb3 } from "@/lib/web3"
import { ethers } from "ethers"
import { useRouter, usePathname } from "next/navigation"

export type UserRole = "dao_member" | "reporter" | "validator" | "none"

interface RoleContextType {
  userRole: UserRole
  isLoading: boolean
  isMember: boolean
  checkRole: () => Promise<void>
  joinAsReporter: () => Promise<void>
  joinAsValidator: () => Promise<void>
  joinDAO: () => Promise<void>
  stakeBDAG: () => Promise<void>
  smartJoinSystem: () => Promise<void>
  debugInfo: {
    hasStaked: boolean
    stakedAmount: string
    cltBalance: string
    climateRole: number
    isDaoMember: boolean
    isEligibleForMinting: boolean
    contractsAvailable: boolean
    membershipFee: string
    daoAllowance: string
  }
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>("none")
  const [isLoading, setIsLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [debugInfo, setDebugInfo] = useState({
    hasStaked: false,
    stakedAmount: "0",
    cltBalance: "0",
    climateRole: 0,
    isDaoMember: false,
    isEligibleForMinting: false,
    contractsAvailable: false,
    membershipFee: "0",
    daoAllowance: "0",
  })
  
  const { account, isConnected, getContract, isCorrectNetwork } = useWeb3()
  const router = useRouter()
  const pathname = usePathname()

  // Improved checkRole function with better error handling
  const checkRole = useCallback(async () => {
    console.log("🔍 Checking user role...", { account, isConnected, isCorrectNetwork })
    
    if (!isConnected || !account || !isCorrectNetwork) {
      console.log("❌ Not connected or wrong network")
      setUserRole("none")
      setIsMember(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const daoContract = getContract("DAO")
      const climateContract = getContract("CLIMATE")
      const tokenContract = getContract("TOKEN")

      const contractsAvailable = !!(daoContract && climateContract && tokenContract)
      console.log("📋 Contract availability:", { 
        daoContract: !!daoContract, 
        climateContract: !!climateContract, 
        tokenContract: !!tokenContract 
      })

      if (!contractsAvailable) {
        console.error("❌ Contracts not available")
        setUserRole("none")
        setIsMember(false)
        setDebugInfo(prev => ({ ...prev, contractsAvailable: false }))
        setIsLoading(false)
        return
      }

      // Fetch all relevant data with Promise.allSettled for better error handling
      const [
        isDaoMemberResult,
        climateRoleResult,
        stakedAmountResult,
        cltBalanceResult,
        isEligibleForMintingResult,
        membershipFeeResult,
        daoAllowanceResult
      ] = await Promise.allSettled([
        daoContract!.isMember(account),
        climateContract!.userRoles(account),
        tokenContract!.getStakedAmount(account),
        tokenContract!.balanceOf(account),
        tokenContract!.isEligibleForMinting(account),
        daoContract!.MEMBERSHIP_FEE(),
        tokenContract!.allowance(account, daoContract!.target || daoContract!.address)
      ])

      // Extract values with proper error handling and fallbacks
      const isDaoMember = isDaoMemberResult.status === 'fulfilled' ? isDaoMemberResult.value : false
      const climateRole = climateRoleResult.status === 'fulfilled' ? climateRoleResult.value : 0
      const stakedAmount = stakedAmountResult.status === 'fulfilled' ? stakedAmountResult.value : ethers.parseEther("0")
      const cltBalance = cltBalanceResult.status === 'fulfilled' ? cltBalanceResult.value : ethers.parseEther("0")
      const isEligibleForMinting = isEligibleForMintingResult.status === 'fulfilled' ? isEligibleForMintingResult.value : false
      const membershipFee = membershipFeeResult.status === 'fulfilled' ? membershipFeeResult.value : ethers.parseEther("1000")
      const daoAllowance = daoAllowanceResult.status === 'fulfilled' ? daoAllowanceResult.value : ethers.parseEther("0")

      // Log any failed promises for debugging
      const failedPromises = [
        { name: 'isDaoMember', result: isDaoMemberResult },
        { name: 'climateRole', result: climateRoleResult },
        { name: 'stakedAmount', result: stakedAmountResult },
        { name: 'cltBalance', result: cltBalanceResult },
        { name: 'isEligibleForMinting', result: isEligibleForMintingResult },
        { name: 'membershipFee', result: membershipFeeResult },
        { name: 'daoAllowance', result: daoAllowanceResult }
      ].filter(p => p.result.status === 'rejected')

      if (failedPromises.length > 0) {
        console.warn("⚠️ Some contract calls failed:", failedPromises.map(p => ({
          name: p.name,
          reason: p.result.status === 'rejected' ? p.result.reason : 'Unknown'
        })))
      }

      const stakedFormatted = ethers.formatEther(stakedAmount)
      const cltFormatted = ethers.formatEther(cltBalance)
      const membershipFeeFormatted = ethers.formatEther(membershipFee)
      const daoAllowanceFormatted = ethers.formatEther(daoAllowance)
      const hasStaked = parseFloat(stakedFormatted) >= 100
      const climateRoleNum = Number(climateRole)

      // Update debug info
      const newDebugInfo = {
        hasStaked,
        stakedAmount: stakedFormatted,
        cltBalance: cltFormatted,
        climateRole: climateRoleNum,
        isDaoMember,
        isEligibleForMinting,
        contractsAvailable: true,
        membershipFee: membershipFeeFormatted,
        daoAllowance: daoAllowanceFormatted,
      }
      setDebugInfo(newDebugInfo)

      console.log("📊 Role check results:", {
        account,
        isDaoMember,
        climateRole: climateRoleNum,
        hasStaked,
        stakedAmount: stakedFormatted,
        cltBalance: cltFormatted,
        membershipFee: membershipFeeFormatted,
        daoAllowance: daoAllowanceFormatted,
        isEligibleForMinting
      })

      // Determine role based on contract state with proper priority
      let role: UserRole = "none"
      let memberStatus = false

      if (isDaoMember) {
        role = "dao_member"
        memberStatus = true
        console.log("✅ User detected as DAO member")
      } else if (climateRoleNum > 0) {
        if (hasStaked && climateRoleNum >= 1) {
          role = "validator"
          console.log("✅ User detected as Validator (has staked BDAG)")
        } else if (climateRoleNum >= 1) {
          role = "reporter"
          console.log("✅ User detected as Reporter")
        }
        memberStatus = true
      } else {
        console.log("❌ No role detected - user needs to join system")
        role = "none"
        memberStatus = false
      }

      setUserRole(role)
      setIsMember(memberStatus)

      console.log("🎯 Final role decision:", { role, memberStatus })

    } catch (error) {
      console.error("❌ Error checking user role:", error)
      setUserRole("none")
      setIsMember(false)
      setDebugInfo(prev => ({ ...prev, contractsAvailable: false }))
    } finally {
      setIsLoading(false)
    }
  }, [account, isConnected, isCorrectNetwork, getContract])

  // Improved transaction success handling with better routing
  const handleTransactionSuccess = useCallback((operation: string, customRedirect?: string) => {
    console.log(`✅ ${operation} completed successfully`)
    
    // Don't redirect from landing page or if already on dashboard
    const isLandingPage = pathname === "/" || pathname === ""
    const isDashboardPage = pathname?.includes('/dashboard')
    
    if (isLandingPage) {
      console.log("ℹ️ On landing page, no redirect needed")
      return
    }
    
    // Wait for blockchain state to update, then refresh role
    setTimeout(async () => {
      try {
        await checkRole()
        
        // Navigate to appropriate page
        if (customRedirect) {
          console.log(`🚀 Redirecting to custom path: ${customRedirect}`)
          router.push(customRedirect)
        } else if (!isDashboardPage) {
          console.log("🚀 Redirecting to dashboard")
          router.push("/dashboard")
        } else {
          console.log("ℹ️ Already on dashboard, no redirect needed")
        }
      } catch (error) {
        console.error("Failed to refresh role after transaction:", error)
      }
    }, 2000) // 2 second delay to allow blockchain state to update
  }, [pathname, router, checkRole])

  // Smart join system with improved error handling
  const smartJoinSystem = async () => {
    if (!isConnected || !account || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    try {
      const climateContract = getContract("CLIMATE")
      const tokenContract = getContract("TOKEN")
      
      if (!climateContract || !tokenContract) {
        throw new Error("Contracts not available")
      }
      
      console.log("🤖 Smart joining system...")
      
      const stakedAmount = await tokenContract.getStakedAmount(account)
      const hasStaked = parseFloat(ethers.formatEther(stakedAmount)) >= 100
      
      console.log("💎 Staking status:", { 
        stakedAmount: ethers.formatEther(stakedAmount), 
        hasStaked 
      })
      
      const tx = await climateContract.joinSystem()
      console.log("⏳ Transaction submitted:", tx.hash)
      await tx.wait()
      
      console.log(hasStaked ? "✅ Joined as validator" : "✅ Joined as reporter")
      handleTransactionSuccess("Smart join system")
    } catch (error) {
      console.error("❌ Error joining system:", error)
      throw error
    }
  }

  const joinAsReporter = async () => {
    if (!isConnected || !account || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    try {
      const climateContract = getContract("CLIMATE")
      if (!climateContract) throw new Error("Climate contract not available")
      
      console.log("🚀 Joining as reporter...")
      const tx = await climateContract.joinSystem()
      console.log("⏳ Transaction submitted:", tx.hash)
      await tx.wait()
      
      console.log("✅ Successfully joined as reporter")
      handleTransactionSuccess("Join as reporter")
    } catch (error) {
      console.error("❌ Error joining as reporter:", error)
      throw error
    }
  }

  const joinAsValidator = async () => {
    if (!isConnected || !account || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    try {
      const tokenContract = getContract("TOKEN")
      const climateContract = getContract("CLIMATE")
      
      if (!tokenContract || !climateContract) {
        throw new Error("Contracts not available")
      }
      
      const currentStaked = await tokenContract.getStakedAmount(account)
      const hasStaked = parseFloat(ethers.formatEther(currentStaked)) >= 100
      
      if (!hasStaked) {
        console.log("🚀 Staking BDAG first...")
        const stakeTx = await tokenContract.stakeBDAG()
        console.log("⏳ Staking transaction submitted:", stakeTx.hash)
        await stakeTx.wait()
        console.log("✅ BDAG staked successfully")
      }
      
      console.log("🚀 Joining as validator...")
      const tx = await climateContract.joinSystem()
      console.log("⏳ Transaction submitted:", tx.hash)
      await tx.wait()
      
      console.log("✅ Successfully joined as validator")
      handleTransactionSuccess("Join as validator")
    } catch (error) {
      console.error("❌ Error joining as validator:", error)
      throw error
    }
  }

  const joinDAO = async () => {
    if (!isConnected || !account || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    try {
      const daoContract = getContract("DAO")
      const tokenContract = getContract("TOKEN")
      const climateContract = getContract("CLIMATE")
      
      if (!daoContract || !tokenContract || !climateContract) {
        throw new Error("Contracts not available")
      }

      // Ensure user has staked BDAG (required for DAO)
      const currentStaked = await tokenContract.getStakedAmount(account)
      const hasStaked = parseFloat(ethers.formatEther(currentStaked)) >= 100
      
      if (!hasStaked) {
        console.log("🚀 Staking BDAG first (required for DAO)...")
        const stakeTx = await tokenContract.stakeBDAG()
        console.log("⏳ Staking transaction submitted:", stakeTx.hash)
        await stakeTx.wait()
        console.log("✅ BDAG staked successfully")
      }

      // Ensure user is in climate system
      const currentRole = await climateContract.userRoles(account)
      if (Number(currentRole) === 0) {
        console.log("🚀 Joining climate system as validator first...")
        const climateTx = await climateContract.joinSystem()
        console.log("⏳ Climate join transaction submitted:", climateTx.hash)
        await climateTx.wait()
        console.log("✅ Joined climate system as validator")
      }

      // Check CLT balance for DAO membership fee
      const currentBalance = await tokenContract.balanceOf(account)
      const membershipFee = await daoContract.MEMBERSHIP_FEE()
      
      const balanceFormatted = ethers.formatEther(currentBalance)
      const feeFormatted = ethers.formatEther(membershipFee)
      
      console.log("💳 Balance check:", {
        currentBalance: balanceFormatted,
        membershipFee: feeFormatted,
        hasSufficient: parseFloat(balanceFormatted) >= parseFloat(feeFormatted)
      })

      if (parseFloat(balanceFormatted) < parseFloat(feeFormatted)) {
        throw new Error(`Insufficient CLT balance. You have ${balanceFormatted} CLT but need ${feeFormatted} CLT to join DAO.`)
      }

      // Check and approve allowance if needed
      const currentAllowance = await tokenContract.allowance(account, daoContract.target || daoContract.address)
      const allowanceFormatted = ethers.formatEther(currentAllowance)
      
      console.log("🔐 Current DAO allowance:", allowanceFormatted)

      if (parseFloat(allowanceFormatted) < parseFloat(feeFormatted)) {
        console.log("🚀 Approving DAO contract to spend CLT tokens...")
        const approveTx = await tokenContract.approve(
          daoContract.target || daoContract.address, 
          membershipFee
        )
        console.log("⏳ Approval transaction submitted:", approveTx.hash)
        await approveTx.wait()
        console.log("✅ Token approval confirmed")
        
        // Wait for the approval to be processed
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        console.log("✅ DAO already has sufficient allowance")
      }
      
      // Join the DAO
      console.log("🚀 Joining DAO...")
      const tx = await daoContract.joinDao()
      console.log("⏳ DAO join transaction submitted:", tx.hash)
      await tx.wait()
      console.log("✅ Successfully joined DAO")
      
      handleTransactionSuccess("Join DAO")
    } catch (error) {
      console.error("❌ Error joining DAO:", error)
      
      // Provide more specific error messages
      if (error.message && error.message.includes("Insufficient balance")) {
        throw new Error("Failed to transfer CLT tokens. Please ensure you have sufficient balance and the DAO contract is approved to spend your tokens.")
      }
      
      throw error
    }
  }

  const stakeBDAG = async () => {
    if (!isConnected || !account || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    try {
      const tokenContract = getContract("TOKEN")
      if (!tokenContract) throw new Error("Token contract not available")
      
      // Check if already staked enough
      const currentStaked = await tokenContract.getStakedAmount(account)
      const hasStaked = parseFloat(ethers.formatEther(currentStaked)) >= 100
      
      if (hasStaked) {
        console.log("ℹ️ User already has sufficient BDAG staked")
        return
      }
      
      console.log("🚀 Staking BDAG...")
      const tx = await tokenContract.stakeBDAG()
      console.log("⏳ Transaction submitted:", tx.hash)
      await tx.wait()
      console.log("✅ BDAG staked successfully")
      
      handleTransactionSuccess("BDAG staking")
    } catch (error) {
      // Handle already staked error gracefully
      if (error.message && (error.message.includes("Already staked") || error.message.includes("already staked"))) {
        console.log("ℹ️ User has already staked BDAG")
        return
      }
      console.error("❌ Error staking BDAG:", error)
      throw error
    }
  }

  // Better connection monitoring with debouncing
  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    if (isConnected && account && isCorrectNetwork) {
      // Debounce the checkRole call to avoid rapid calls
      timeoutId = setTimeout(() => {
        if (mounted) {
          checkRole()
        }
      }, 500)
    } else {
      // Only update state if component is still mounted
      if (mounted) {
        setUserRole("none")
        setIsMember(false)
        setIsLoading(false)
      }
    }

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [account, isConnected, isCorrectNetwork, checkRole])

  // Reset state when account changes
  useEffect(() => {
    if (account) {
      setIsLoading(true)
      setUserRole("none")
      setIsMember(false)
    }
  }, [account])

  return (
    <RoleContext.Provider
      value={{
        userRole,
        isLoading,
        isMember,
        checkRole,
        joinAsReporter,
        joinAsValidator,
        joinDAO,
        stakeBDAG,
        smartJoinSystem,
        debugInfo,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}