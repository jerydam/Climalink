"use client"

import { useState } from "react"
import { useWeb3 } from "@/lib/web3"
import type { CONTRACTS } from "@/lib/contracts"

export function useContract(contractName: keyof typeof CONTRACTS) {
  const { getContract, isConnected } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contract = getContract(contractName)

  const read = async (method: string, params: any[] = []) => {
    if (!isConnected) {
      throw new Error("Wallet not connected")
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await contract.read(method, params)
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const write = async (method: string, params: any[] = []) => {
    if (!isConnected) {
      throw new Error("Wallet not connected")
    }

    setIsLoading(true)
    setError(null)

    try {
      const txHash = await contract.write(method, params)
      return txHash
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    read,
    write,
    isLoading,
    error,
    contract,
  }
}
