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
  joinDAO: () => Promise<void>
  stakeBDAG: () => Promise<void>
  debugInfo: {
    hasStaked: boolean
    stakedAmount: string
    cltBalance: string
    climateRole: number
    isDaoMember: boolean
    isEligibleForMinting: boolean
    contractsAvailable: boolean
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
        isEligibleForMinting
      ] = await Promise.all([
        daoContract!.isMember(account).catch((e) => { console.warn("DAO member check failed:", e); return false; }),
        climateContract!.userRoles(account).catch((e) => { console.warn("Climate role check failed:", e); return 0; }),
        tokenContract!.getStakedAmount(account).catch((e) => { console.warn("Staked amount check failed:", e); return ethers.parseEther("0"); }),
        tokenContract!.balanceOf(account).catch((e) => { console.warn("CLT balance check failed:", e); return ethers.parseEther("0"); }),
        tokenContract!.isEligibleForMinting(account).catch((e) => { console.warn("Minting eligibility check failed:", e); return false; })
      ])

      const stakedFormatted = ethers.formatEther(stakedAmount)
      const cltFormatted = ethers.formatEther(cltBalance)
      const hasStaked = parseFloat(stakedFormatted) > 0
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
      }
      setDebugInfo(newDebugInfo)

      console.log("📊 Role check results:", {
        account,
        isDaoMember,
        climateRole: climateRoleNum,
        hasStaked,
        stakedAmount: stakedFormatted,
        cltBalance: cltFormatted,
        isEligibleForMinting
      })

      // Determine role based on contract state
      let role: UserRole = "none"
      let memberStatus = false

      if (isDaoMember) {
        role = "dao_member"
        memberStatus = true
        console.log("✅ User detected as DAO member")
      } else if (climateRoleNum === 2) {
        role = "validator"
        memberStatus = true
        console.log("✅ User detected as Validator")
      } else if (climateRoleNum === 1) {
        role = "reporter"
        memberStatus = true
        console.log("✅ User detected as Reporter")
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
      console.log("✅ Transaction confirmed")
      
      // Wait a bit then refresh role
      setTimeout(async () => {
        await checkRole()
      }, 2000)
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
      // Check if user has already staked
      if (!debugInfo.hasStaked) {
        console.log("🚀 Staking BDAG first...")
        await stakeBDAG()
      }
      
      const climateContract = getContract("CLIMATE")
      if (!climateContract) throw new Error("Climate contract not available")
      
      console.log("🚀 Upgrading to validator...")
      const tx = await climateContract.upgradeToValidator()
      console.log("⏳ Transaction submitted:", tx.hash)
      await tx.wait()
      console.log("✅ Transaction confirmed")
      
      // Wait a bit then refresh role
      setTimeout(async () => {
        await checkRole()
      }, 2000)
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
      if (!daoContract) throw new Error("DAO contract not available")
      
      console.log("🚀 Joining DAO...")
      const tx = await daoContract.joinDao()
      console.log("⏳ Transaction submitted:", tx.hash)
      await tx.wait()
      console.log("✅ Transaction confirmed")
      
      // Wait a bit then refresh role
      setTimeout(async () => {
        await checkRole()
      }, 2000)
    } catch (error) {
      console.error("❌ Error joining DAO:", error)
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
      
      console.log("🚀 Staking BDAG...")
      const tx = await tokenContract.stakeBDAG()
      console.log("⏳ Transaction submitted:", tx.hash)
      await tx.wait()
      console.log("✅ Transaction confirmed")
      
      // Wait a bit then refresh role
      setTimeout(async () => {
        await checkRole()
      }, 2000)
    } catch (error) {
      // Don't throw if already staked
      if (error.message && error.message.includes("Already staked")) {
        console.log("ℹ️ User has already staked BDAG")
        return
      }
      console.error("❌ Error staking BDAG:", error)
      throw error
    }
  }

  useEffect(() => {
    checkRole()
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
        joinDAO,
        stakeBDAG,
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