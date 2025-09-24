"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { ethers } from "ethers"
import { CONTRACTS } from "@/lib/contracts"

declare global {
  interface Window {
    ethereum?: any
  }
}

interface Web3ContextType {
  account: string | null
  isConnected: boolean
  isConnecting: boolean
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  connect: () => Promise<void>
  disconnect: () => void
  getContract: (contractName: keyof typeof CONTRACTS) => ethers.Contract
  sendTransaction: (to: string, data: string, value?: string) => Promise<string>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)

  const isConnected = !!account

  const connect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this application")
      return
    }

    setIsConnecting(true)
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      await browserProvider.send("eth_requestAccounts", [])
      
      const userSigner = await browserProvider.getSigner()
      const address = await userSigner.getAddress()
      
      setProvider(browserProvider)
      setSigner(userSigner)
      setAccount(address)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
  }

  const getContract = (contractName: keyof typeof CONTRACTS) => {
    if (!provider || !signer) {
      throw new Error("Provider not connected")
    }

    const contractConfig = CONTRACTS[contractName]
    return new ethers.Contract(contractConfig.address, contractConfig.abi, signer)
  }

  const sendTransaction = async (to: string, data: string, value = "0") => {
    if (!signer || !account) {
      throw new Error("Wallet not connected")
    }

    const tx = await signer.sendTransaction({
      to,
      data,
      value: ethers.parseEther(value),
    })

    return tx.hash
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAccount(accounts[0])
        }
      })

      window.ethereum.on("chainChanged", () => {
        window.location.reload()
      })

      // Check if already connected
      const checkConnection = async () => {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await browserProvider.listAccounts()
          if (accounts.length > 0) {
            const userSigner = await browserProvider.getSigner()
            const address = await userSigner.getAddress()
            setProvider(browserProvider)
            setSigner(userSigner)
            setAccount(address)
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }

      checkConnection()
    }
  }, [])

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected,
        isConnecting,
        provider,
        signer,
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