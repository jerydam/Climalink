"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useWeb3 } from "@/lib/web3"
import { ethers } from "ethers"

export type UserRole = "dao_member" | "reporter" | "validator" | "none"

interface RoleContextType {
  userRole: UserRole
  isLoading: boolean
  isMember: boolean
  checkRole: () => Promise<void>
  joinAsReporter: () => Promise<void>
  joinAsValidator: () => Promise<void>
  upgradeToValidator: () => Promise<void>
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

  const checkRole = async () => {
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
      console.log("📋 Contract availability:", { daoContract: !!daoContract, climateContract: !!climateContract, tokenContract: !!tokenContract })

      if (!contractsAvailable) {
        console.error("❌ Contracts not available")
        setUserRole("none")
        setIsMember(false)
        setDebugInfo(prev => ({ ...prev, contractsAvailable: false }))
        setIsLoading(false)
        return
      }

      // Fetch all relevant data with error handling
      const [
        isDaoMember,
        climateRole,
        stakedAmount,
        cltBalance,
        isEligibleForMinting,
        membershipFee,
        daoAllowance
      ] = await Promise.all([
        daoContract!.isMember(account).catch((e) => { console.warn("DAO member check failed:", e); return false; }),
        climateContract!.userRoles(account).catch((e) => { console.warn("Climate role check failed:", e); return 0; }),
        tokenContract!.getStakedAmount(account).catch((e) => { console.warn("Staked amount check failed:", e); return ethers.parseEther("0"); }),
        tokenContract!.balanceOf(account).catch((e) => { console.warn("CLT balance check failed:", e); return ethers.parseEther("0"); }),
        tokenContract!.isEligibleForMinting(account).catch((e) => { console.warn("Minting eligibility check failed:", e); return false; }),
        daoContract!.MEMBERSHIP_FEE().catch((e) => { console.warn("Membership fee check failed:", e); return ethers.parseEther("1000"); }),
        tokenContract!.allowance(account, daoContract!.target || daoContract!.address).catch((e) => { console.warn("Allowance check failed:", e); return ethers.parseEther("0"); })
      ])

      const stakedFormatted = ethers.formatEther(stakedAmount)
      const cltFormatted = ethers.formatEther(cltBalance)
      const membershipFeeFormatted = ethers.formatEther(membershipFee)
      const daoAllowanceFormatted = ethers.formatEther(daoAllowance)
      const hasStaked = parseFloat(stakedFormatted) >= 100 // Must have at least 100 BDAG staked
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
        // If user has staked BDAG, they should be a validator
        // If they haven't staked, they should be a reporter
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
    } finally {
      setIsLoading(false)
    }
  }

  // Smart join system - assigns role based on staking status
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
      
      // Check current staking status
      const stakedAmount = await tokenContract.getStakedAmount(account)
      const hasStaked = parseFloat(ethers.formatEther(stakedAmount)) >= 100
      
      console.log("💎 Staking status:", { 
        stakedAmount: ethers.formatEther(stakedAmount), 
        hasStaked 
      })
      
      // Join the climate system (this sets initial role based on staking status)
      const tx = await climateContract.joinSystem()
      console.log("⏳ Transaction submitted:", tx.hash)
      await tx.wait()
      
      if (hasStaked) {
        console.log("✅ Joined as validator (has staked BDAG)")
      } else {
        console.log("✅ Joined as reporter (no BDAG staked)")
      }
      
      // Wait a bit then refresh role
      setTimeout(async () => {
        await checkRole()
      }, 2000)
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
      
      // Immediately refresh role
      setTimeout(async () => {
        await checkRole()
      }, 1000)
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
      
      // First, ensure user has staked BDAG
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
      
      // Immediately refresh role
      setTimeout(async () => {
        await checkRole()
      }, 1000)
    } catch (error) {
      console.error("❌ Error joining as validator:", error)
      throw error
    }
  }

  const upgradeToValidator = async () => {
    if (!isConnected || !account || !isCorrectNetwork) {
      throw new Error("Please connect to the BlockDAG network")
    }

    try {
      const tokenContract = getContract("TOKEN")
      const climateContract = getContract("CLIMATE")
      
      if (!tokenContract || !climateContract) {
        throw new Error("Contracts not available")
      }
      
      // Check current role - must be a reporter to upgrade
      const currentRole = await climateContract.userRoles(account)
      if (Number(currentRole) === 0) {
        throw new Error("You must be a reporter first before upgrading to validator")
      }
      
      // Check if user already has validator access
      const currentStaked = await tokenContract.getStakedAmount(account)
      const hasStaked = parseFloat(ethers.formatEther(currentStaked)) >= 100
      
      if (hasStaked) {
        // User has staked, just call upgradeToValidator
        console.log("🚀 Upgrading to validator (BDAG already staked)...")
        const tx = await climateContract.upgradeToValidator()
        console.log("⏳ Upgrade transaction submitted:", tx.hash)
        await tx.wait()
        console.log("✅ Successfully upgraded to validator")
      } else {
        // User needs to stake BDAG first, then upgrade
        console.log("🚀 Staking BDAG for validator upgrade...")
        const stakeTx = await tokenContract.stakeBDAG()
        console.log("⏳ Staking transaction submitted:", stakeTx.hash)
        await stakeTx.wait()
        console.log("✅ BDAG staked successfully")
        
        // Wait a moment for the stake to be processed
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log("🚀 Upgrading to validator...")
        const upgradeTx = await climateContract.upgradeToValidator()
        console.log("⏳ Upgrade transaction submitted:", upgradeTx.hash)
        await upgradeTx.wait()
        console.log("✅ Successfully upgraded to validator")
      }
      
      // Refresh role after upgrade
      setTimeout(async () => {
        await checkRole()
      }, 1000)
    } catch (error) {
      console.error("❌ Error upgrading to validator:", error)
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

      // Ensure user is in climate system (join as validator since they staked)
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

      // Check current allowance for DAO contract
      const currentAllowance = await tokenContract.allowance(account, daoContract.target || daoContract.address)
      const allowanceFormatted = ethers.formatEther(currentAllowance)
      
      console.log("🔐 Current DAO allowance:", allowanceFormatted)

      // Step 1: Approve DAO contract to spend CLT tokens if needed
      if (parseFloat(allowanceFormatted) < parseFloat(feeFormatted)) {
        console.log("🚀 Approving DAO contract to spend CLT tokens...")
        const approveTx = await tokenContract.approve(
          daoContract.target || daoContract.address, 
          membershipFee
        )
        console.log("⏳ Approval transaction submitted:", approveTx.hash)
        await approveTx.wait()
        console.log("✅ Token approval confirmed")
        
        // Wait a moment for the approval to be processed
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        console.log("✅ DAO already has sufficient allowance")
      }
      
      // Step 2: Join the DAO
      console.log("🚀 Joining DAO...")
      const tx = await daoContract.joinDao()
      console.log("⏳ DAO join transaction submitted:", tx.hash)
      await tx.wait()
      console.log("✅ Successfully joined DAO")
      
      // Immediately refresh role
      setTimeout(async () => {
        await checkRole()
      }, 1000)
    } catch (error) {
      console.error("❌ Error joining DAO:", error)
      
      // Provide more specific error messages
      if (error.message && error.message.includes("Insufficient balance")) {
        throw new Error("Failed to transfer CLT tokens. Please ensure you have approved the DAO contract to spend your tokens and have sufficient balance.")
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
      
      // Immediately refresh role
      setTimeout(async () => {
        await checkRole()
      }, 1000)
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

  useEffect(() => {
    if (isConnected && account && isCorrectNetwork) {
      checkRole()
    } else {
      setUserRole("none")
      setIsMember(false)
      setIsLoading(false)
    }
  }, [account, isConnected, isCorrectNetwork])

  return (
    <RoleContext.Provider
      value={{
        userRole,
        isLoading,
        isMember,
        checkRole,
        joinAsReporter,
        joinAsValidator,
        upgradeToValidator,
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