"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useWeb3 } from "@/lib/web3"

export type UserRole = "dao" | "reporter" | "none"

interface RoleContextType {
  userRole: UserRole
  isLoading: boolean
  checkRole: () => Promise<void>
  joinAsReporter: () => Promise<void>
  joinAsDAO: () => Promise<void>
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>("none")
  const [isLoading, setIsLoading] = useState(true)
  const { account, isConnected, getContract } = useWeb3()

  const checkRole = async () => {
    if (!isConnected || !account) {
      setUserRole("none")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const contract = getContract("ClimaLink")

      // Check if user is a DAO member
      const daoMember = await contract.read("isDaoMember", [account])
      if (daoMember) {
        setUserRole("dao")
        setIsLoading(false)
        return
      }

      // Check if user is a reporter
      const reporter = await contract.read("isReporter", [account])
      if (reporter) {
        setUserRole("reporter")
        setIsLoading(false)
        return
      }

      setUserRole("none")
    } catch (error) {
      console.error("Error checking user role:", error)
      setUserRole("none")
    } finally {
      setIsLoading(false)
    }
  }

  const joinAsReporter = async () => {
    if (!isConnected || !account) return

    try {
      const contract = getContract("ClimaLink")
      await contract.write("joinAsReporter", [])
      await checkRole() // Refresh role after joining
    } catch (error) {
      console.error("Error joining as reporter:", error)
      throw error
    }
  }

  const joinAsDAO = async () => {
    if (!isConnected || !account) return

    try {
      const contract = getContract("ClimaLink")
      await contract.write("joinDao", [])
      await checkRole() // Refresh role after joining
    } catch (error) {
      console.error("Error joining DAO:", error)
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
        checkRole,
        joinAsReporter,
        joinAsDAO,
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
