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
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>("none")
  const [isLoading, setIsLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const { account, isConnected, getContract } = useWeb3()

  const checkRole = async () => {
    if (!isConnected || !account) {
      setUserRole("none")
      setIsMember(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const daoContract = getContract("DAO")
      const climateContract = getContract("CLIMATE")

      // Check if user is a DAO member
      const isDaoMember = await daoContract.isMember(account)
      
      if (isDaoMember) {
        setUserRole("dao_member")
        setIsMember(true)
      } else {
        // Check if user has any role in climate contract
        const userRoleInClimate = await climateContract.userRoles(account)
        
        // Role enum: 0 = None, 1 = Reporter, 2 = Validator
        if (userRoleInClimate === 1) {
          setUserRole("reporter")
          setIsMember(true)
        } else if (userRoleInClimate === 2) {
          setUserRole("validator")
          setIsMember(true)
        } else {
          setUserRole("none")
          setIsMember(false)
        }
      }
    } catch (error) {
      console.error("Error checking user role:", error)
      setUserRole("none")
      setIsMember(false)
    } finally {
      setIsLoading(false)
    }
  }

  const joinAsReporter = async () => {
    if (!isConnected || !account) throw new Error("Wallet not connected")

    try {
      const climateContract = getContract("CLIMATE")
      const tx = await climateContract.joinAsReporterOrValidator(false) // false for reporter
      await tx.wait()
      await checkRole() // Refresh role after joining
    } catch (error) {
      console.error("Error joining as reporter:", error)
      throw error
    }
  }

  const joinAsValidator = async () => {
    if (!isConnected || !account) throw new Error("Wallet not connected")

    try {
      const climateContract = getContract("CLIMATE")
      const tx = await climateContract.joinAsReporterOrValidator(true) // true for validator
      await tx.wait()
      await checkRole() // Refresh role after joining
    } catch (error) {
      console.error("Error joining as validator:", error)
      throw error
    }
  }

  const joinDAO = async () => {
    if (!isConnected || !account) throw new Error("Wallet not connected")

    try {
      const daoContract = getContract("DAO")
      const tx = await daoContract.joinDao()
      await tx.wait()
      await checkRole() // Refresh role after joining
    } catch (error) {
      console.error("Error joining DAO:", error)
      throw error
    }
  }

  const stakeBDAG = async () => {
    if (!isConnected || !account) throw new Error("Wallet not connected")

    try {
      const tokenContract = getContract("TOKEN")
      const tx = await tokenContract.stakeBDAG()
      await tx.wait()
      await checkRole() // Refresh role after staking
    } catch (error) {
      console.error("Error staking BDAG:", error)
      throw error
    }
  }

  useEffect(() => {
    checkRole()
  }, [account, isConnected])

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