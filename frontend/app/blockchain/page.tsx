"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { WalletInfo } from "@/components/blockchain/wallet-info"
import { BlockchainActions } from "@/components/blockchain/blockchain-actions"
import { ContractInteractions } from "@/components/blockchain/contract-interactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/lib/web3"
import { CONTRACTS } from "@/lib/contracts"
import { Wallet, Link, Zap, Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { ethers } from "ethers"

interface NetworkInfo {
  chainId: number
  name: string
  gasPrice: string
  blockNumber: number
  isMainnet: boolean
}

interface ContractInfo {
  name: string
  address: string
  type: string
}

export default function BlockchainPage() {
  const { account, isConnected, provider } = useWeb3()
  const router = useRouter()

  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    chainId: 0,
    name: "Unknown",
    gasPrice: "0 Gwei",
    blockNumber: 0,
    isMainnet: false,
  })
  
  const [contractInfo, setContractInfo] = useState<ContractInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    } else {
      fetchNetworkInfo()
      fetchContractInfo()
    }
  }, [isConnected, router])

  const fetchNetworkInfo = async () => {
    if (!provider) return

    try {
      setIsLoading(true)

      const [network, feeData, blockNumber] = await Promise.all([
        provider.getNetwork(),
        provider.getFeeData(),
        provider.getBlockNumber(),
      ])

      const chainId = Number(network.chainId)
      const gasPrice = feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "0"

      // Determine network name
      let networkName = "Unknown"
      let isMainnet = false

      switch (chainId) {
        case 1:
          networkName = "Ethereum Mainnet"
          isMainnet = true
          break
        case 5:
          networkName = "Goerli Testnet"
          break
        case 11155111:
          networkName = "Sepolia Testnet"
          break
        case 137:
          networkName = "Polygon Mainnet"
          break
        case 80001:
          networkName = "Mumbai Testnet"
          break
        default:
          networkName = `Chain ${chainId}`
      }

      setNetworkInfo({
        chainId,
        name: networkName,
        gasPrice: `${parseFloat(gasPrice).toFixed(1)} Gwei`,
        blockNumber,
        isMainnet,
      })
    } catch (error) {
      console.error("Error fetching network info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchContractInfo = async () => {
    const contracts: ContractInfo[] = [
      {
        name: "CLT Token",
        address: CONTRACTS.TOKEN.address,
        type: "ERC-20 Token",
      },
      {
        name: "DAO Contract",
        address: CONTRACTS.DAO.address,
        type: "Governance",
      },
      {
        name: "Climate Reports",
        address: CONTRACTS.CLIMATE.address,
        type: "Data Storage",
      },
    ]

    setContractInfo(contracts)
    setLastUpdated(new Date())
  }

  const handleRefresh = () => {
    fetchNetworkInfo()
    fetchContractInfo()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const openEtherscan = (address: string) => {
    const baseUrl = networkInfo.isMainnet 
      ? "https://etherscan.io"
      : `https://${networkInfo.chainId === 5 ? "goerli." : "sepolia."}etherscan.io`
    
    window.open(`${baseUrl}/address/${address}`, "_blank")
  }

  const getNetworkStatusColor = () => {
    if (!isConnected) return "bg-gray-500"
    if (networkInfo.isMainnet) return "bg-green-600"
    return "bg-amber-500"
  }

  const getGasPriceColor = () => {
    const gasPrice = parseFloat(networkInfo.gasPrice)
    if (gasPrice < 20) return "text-green-600"
    if (gasPrice < 50) return "text-amber-500"
    return "text-red-500"
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-green-600 mb-4">Blockchain Integration</h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to access blockchain features and interact with ClimaLink smart contracts
            </p>
            <WalletInfo />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Blockchain Integration</h1>
            <p className="text-muted-foreground">
              Connect your wallet and interact with ClimaLink smart contracts
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <WalletInfo />
          </div>
        </div>

        {/* Network Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Status</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-20 mb-1"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {isConnected ? "Connected" : "Disconnected"}
                  </div>
                  <Badge 
                    variant={isConnected ? "default" : "secondary"} 
                    className={isConnected ? "bg-green-600" : ""}
                  >
                    {isConnected ? "Active" : "Inactive"}
                  </Badge>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network</CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-20 mb-1"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              ) : (
                <>
                  <div className="text-lg font-bold">{networkInfo.name}</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${getNetworkStatusColor()} rounded-full`}></div>
                    <p className="text-xs text-muted-foreground">Chain ID: {networkInfo.chainId}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gas Price</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-20 mb-1"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              ) : (
                <>
                  <div className={`text-2xl font-bold ${getGasPriceColor()}`}>
                    {networkInfo.gasPrice}
                  </div>
                  <p className="text-xs text-muted-foreground">Standard</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Block Number</CardTitle>
              <div className="w-4 h-4 bg-blue-500 rounded" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-20 mb-1"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              ) : (
                <>
                  <div className="text-lg font-bold">
                    {networkInfo.blockNumber.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Contract Data */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Contract Data</h2>
            <ContractInteractions />
          </div>

          {/* Smart Contract Interactions */}
          <Card>
            <CardHeader>
              <CardTitle>Smart Contract Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <BlockchainActions />
            </CardContent>
          </Card>

          {/* Contract Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Contract Addresses
                <Badge variant="outline" className="text-xs">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractInfo.map((contract, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">{contract.name}</h4>
                      <p className="text-sm text-muted-foreground">{contract.type}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {contract.address}
                      </code>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(contract.address)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEtherscan(contract.address)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          {account && (
            <Card>
              <CardHeader>
                <CardTitle>Connected Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Your Wallet Address</h4>
                    <p className="text-sm text-muted-foreground">Currently connected account</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {account}
                    </code>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(account)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEtherscan(account)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}