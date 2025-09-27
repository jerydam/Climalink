"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { ethers } from "ethers"
import { CONTRACTS } from "@/lib/contracts"

interface Web3ContextType {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  account: string | null
  isConnected: boolean
  isConnecting: boolean
  chainId: number | null
  isCorrectNetwork: boolean
  connect: () => Promise<void>
  disconnect: () => void
  switchToBlockDAG: () => Promise<void>
  getContract: (contractName: keyof typeof CONTRACTS) => ethers.Contract | null
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  isConnected: false,
  isConnecting: false,
  chainId: null,
  isCorrectNetwork: false,
  connect: async () => {},
  disconnect: () => {},
  switchToBlockDAG: async () => {},
  getContract: () => null,
})

// BlockDAG Network Configuration
const BLOCKDAG_CHAIN_ID = 1043
const BLOCKDAG_NETWORK = {
  chainId: '0x413', // 1043 in hex
  chainName: 'BlockDAG',
  rpcUrls: ['https://rpc.awakening.bdagscan.com'],
  nativeCurrency: {
    name: 'BDAG',
    symbol: 'BDAG',
    decimals: 18,
  },
  blockExplorerUrls: ['https://bdagscan.com'],
}

interface Web3ProviderProps {
  children: React.ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  // Check if we're on the correct network
  useEffect(() => {
    setIsCorrectNetwork(chainId === BLOCKDAG_CHAIN_ID)
  }, [chainId])

  // Initialize connection on page load
  useEffect(() => {
    checkConnection()
  }, [])

  // Listen for account and network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16))
        // Reload the page when network changes to avoid stale state
        window.location.reload()
      }

      const handleDisconnect = () => {
        disconnect()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('disconnect', handleDisconnect)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
          window.ethereum.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [])

  const checkConnection = async () => {
    if (!window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.listAccounts()
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner()
        const network = await provider.getNetwork()
        
        setProvider(provider)
        setSigner(signer)
        setAccount(accounts[0].address)
        setChainId(Number(network.chainId))
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error checking connection:', error)
    }
  }

  const switchToBlockDAG = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      // Try to switch to BlockDAG network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BLOCKDAG_NETWORK.chainId }],
      })
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [BLOCKDAG_NETWORK],
        })
      } else {
        throw switchError
      }
    }
  }

  const connect = async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask or another Web3 wallet')
    }

    setIsConnecting(true)

    try {
      // First, ensure we're on the correct network
      await switchToBlockDAG()

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Set up provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()

      setProvider(provider)
      setSigner(signer)
      setAccount(accounts[0])
      setChainId(Number(network.chainId))
      setIsConnected(true)

      console.log('Connected to BlockDAG network:', {
        account: accounts[0],
        chainId: Number(network.chainId),
        networkName: network.name,
      })
    } catch (error: any) {
      console.error('Connection failed:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setProvider(null)
    setSigner(null)
    setAccount(null)
    setIsConnected(false)
    setChainId(null)
    setIsCorrectNetwork(false)
  }

  const getContract = (contractName: keyof typeof CONTRACTS) => {
    if (!provider || !signer || !isConnected) {
      console.warn('Wallet not connected or provider not available')
      return null
    }

    if (!isCorrectNetwork) {
      console.warn('Not connected to BlockDAG network')
      return null
    }

    try {
      const contractConfig = CONTRACTS[contractName]
      if (!contractConfig) {
        console.error(`Contract ${contractName} not found`)
        return null
      }

      return new ethers.Contract(contractConfig.address, contractConfig.abi, signer)
    } catch (error) {
      console.error('Error creating contract instance:', error)
      return null
    }
  }

  const contextValue: Web3ContextType = {
    provider,
    signer,
    account,
    isConnected,
    isConnecting,
    chainId,
    isCorrectNetwork,
    connect,
    disconnect,
    switchToBlockDAG,
    getContract,
  }

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}