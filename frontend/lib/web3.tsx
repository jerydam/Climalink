"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

declare global {
  interface Window {
    ethereum?: any
  }
}

interface Web3ContextType {
  account: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  getContract: (contractName: string) => any
  sendTransaction: (to: string, data: string, value?: string) => Promise<string>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const isConnected = !!account

  const connect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this application")
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      setAccount(accounts[0])
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
  }

  const getContract = (contractName: string) => {
    // Mock contract interface for demo
    return {
      read: async (method: string, params: any[] = []) => {
        console.log(`Reading ${method} from ${contractName}`, params)
        // Return mock data based on method
        switch (method) {
          case "balanceOf":
            return "1520000000000000000000" // 1520 CLT
          case "getStakedAmount":
            return "100000000000000000000" // 100 BDAG
          case "isDaoMember":
            // Mock: return true for demo purposes (in real app, check blockchain)
            return true
          case "isReporter":
            // Mock: return false to show DAO member status
            return false
          default:
            return "0"
        }
      },
      write: async (method: string, params: any[] = []) => {
        console.log(`Writing ${method} to ${contractName}`, params)
        // Mock responses for join functions
        if (method === "joinAsReporter" || method === "joinDao") {
          // Simulate successful transaction
          return "0x1234567890abcdef"
        }
        return "0x1234567890abcdef"
      },
    }
  }

  const sendTransaction = async (to: string, data: string, value = "0") => {
    if (!window.ethereum || !account) {
      throw new Error("Wallet not connected")
    }

    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: account,
          to,
          data,
          value,
        },
      ],
    })

    return txHash
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null)
      })

      window.ethereum.on("chainChanged", () => {
        window.location.reload()
      })
    }
  }, [])

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        getContract,
        sendTransaction,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}
