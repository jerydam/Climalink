"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, TrendingUp, FileText, Vote, Coins, Lock, ExternalLink, Loader2 } from "lucide-react"
import { useWeb3 } from "@/lib/web3"
import { ethers } from "ethers"

interface Transaction {
  id: string
  date: string
  type: "mint" | "stake" | "unstake" | "vote" | "report" | "validation"
  amount: string
  status: "completed" | "pending" | "failed"
  description: string
  txHash: string
  blockNumber: number
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  
  const { account, isConnected, getContract, provider } = useWeb3()

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!isConnected || !account || !provider) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const tokenContract = getContract("TOKEN")
        const climateContract = getContract("CLIMATE")
        const daoContract = getContract("DAO")

        if (!tokenContract || !climateContract || !daoContract) {
          console.error("Contracts not available")
          setIsLoading(false)
          return
        }

        const transactions: Transaction[] = []

        // Get current block number and look back more blocks for history
        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - 10000) // Look back ~10000 blocks

        try {
          // Fetch mint events (rewards)
          const mintEvents = await tokenContract.queryFilter(
            tokenContract.filters.Mint(account),
            fromBlock,
            currentBlock
          )

          for (const event of mintEvents) {
            const block = await event.getBlock()
            const amount = event.args?.[1] || 0
            transactions.push({
              id: `mint-${event.transactionHash}`,
              date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(),
              type: "mint",
              amount: `+${(Number(amount) / 1e18).toFixed(0)} CLT`,
              status: "completed",
              description: "Token reward from platform activities",
              txHash: event.transactionHash,
              blockNumber: event.blockNumber,
            })
          }
        } catch (error) {
          console.error("Error fetching mint events:", error)
        }

        try {
          // Fetch staking events
          const stakeEvents = await tokenContract.queryFilter(
            tokenContract.filters.Stake(account),
            fromBlock,
            currentBlock
          )

          for (const event of stakeEvents) {
            const block = await event.getBlock()
            const amount = event.args?.[1] || 0
            transactions.push({
              id: `stake-${event.transactionHash}`,
              date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(),
              type: "stake",
              amount: `${(Number(amount) / 1e18).toFixed(0)} BDAG`,
              status: "completed",
              description: "BDAG tokens staked for DAO membership",
              txHash: event.transactionHash,
              blockNumber: event.blockNumber,
            })
          }
        } catch (error) {
          console.error("Error fetching stake events:", error)
        }

        try {
          // Fetch unstaking events
          const unstakeEvents = await tokenContract.queryFilter(
            tokenContract.filters.Unstake(account),
            fromBlock,
            currentBlock
          )

          for (const event of unstakeEvents) {
            const block = await event.getBlock()
            const amount = event.args?.[1] || 0
            transactions.push({
              id: `unstake-${event.transactionHash}`,
              date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(),
              type: "unstake",
              amount: `${(Number(amount) / 1e18).toFixed(0)} BDAG`,
              status: "completed",
              description: "BDAG tokens unstaked",
              txHash: event.transactionHash,
              blockNumber: event.blockNumber,
            })
          }
        } catch (error) {
          console.error("Error fetching unstake events:", error)
        }

        try {
          // Fetch vote events
          const voteEvents = await daoContract.queryFilter(
            daoContract.filters.VoteCast(null, account),
            fromBlock,
            currentBlock
          )

          for (const event of voteEvents) {
            const block = await event.getBlock()
            const proposalId = event.args?.[0] || 0
            transactions.push({
              id: `vote-${event.transactionHash}`,
              date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(),
              type: "vote",
              amount: "0 CLT",
              status: "completed",
              description: `Voted on DAO Proposal #${proposalId}`,
              txHash: event.transactionHash,
              blockNumber: event.blockNumber,
            })
          }
        } catch (error) {
          console.error("Error fetching vote events:", error)
        }

        try {
          // Fetch climate report events (using correct event name)
          const reportEvents = await climateContract.queryFilter(
            climateContract.filters.ReportCreated(null, account),
            fromBlock,
            currentBlock
          )

          for (const event of reportEvents) {
            const block = await event.getBlock()
            const reportId = event.args?.[0] || 0
            transactions.push({
              id: `report-${event.transactionHash}`,
              date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(),
              type: "report",
              amount: "+20 CLT",
              status: "completed",
              description: `Climate report #${reportId} submitted`,
              txHash: event.transactionHash,
              blockNumber: event.blockNumber,
            })
          }
        } catch (error) {
          console.error("Error fetching report events:", error)
        }

        try {
          // Fetch validation events
          const validationEvents = await climateContract.queryFilter(
            climateContract.filters.ReportVoteCast(null, account),
            fromBlock,
            currentBlock
          )

          for (const event of validationEvents) {
            const block = await event.getBlock()
            const reportId = event.args?.[0] || 0
            transactions.push({
              id: `validation-${event.transactionHash}`,
              date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(),
              type: "validation",
              amount: "+5 CLT",
              status: "completed",
              description: `Validated climate report #${reportId}`,
              txHash: event.transactionHash,
              blockNumber: event.blockNumber,
            })
          }
        } catch (error) {
          console.error("Error fetching validation events:", error)
        }

        // Sort transactions by block number (most recent first)
        transactions.sort((a, b) => b.blockNumber - a.blockNumber)
        setTransactions(transactions)
      } catch (error) {
        console.error("Error fetching transaction history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactionHistory()
  }, [account, isConnected, getContract, provider])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "mint":
        return <TrendingUp className="h-4 w-4 text-climate-green" />
      case "report":
        return <FileText className="h-4 w-4 text-sky-blue" />
      case "vote":
        return <Vote className="h-4 w-4 text-purple-500" />
      case "stake":
        return <Lock className="h-4 w-4 text-sky-blue" />
      case "unstake":
        return <Lock className="h-4 w-4 text-amber-500" />
      case "validation":
        return <TrendingUp className="h-4 w-4 text-climate-green" />
      default:
        return <Coins className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-climate-green text-white"
      case "pending":
        return "bg-amber-500 text-white"
      case "failed":
        return "bg-destructive text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false
    if (searchQuery && !tx.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const openBlockExplorer = (txHash: string) => {
    // Update to use BlockDAG explorer
    window.open(`https://bdagscan.com/tx/${txHash}`, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mint">Rewards</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="validation">Validation</SelectItem>
                <SelectItem value="vote">Votes</SelectItem>
                <SelectItem value="stake">Staking</SelectItem>
                <SelectItem value="unstake">Unstaking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-muted-foreground">Loading transaction history...</p>
              </div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      <button
                        onClick={() => openBlockExplorer(transaction.txHash)}
                        className="text-sm text-blue-500 hover:text-blue-600 underline flex items-center gap-1"
                      >
                        View on BlockDAG Scan
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-medium ${
                      transaction.amount.startsWith("+") 
                        ? "text-climate-green" 
                        : transaction.amount.startsWith("-") 
                        ? "text-destructive" 
                        : "text-muted-foreground"
                    }`}
                  >
                    {transaction.amount}
                  </span>
                  <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery || filter !== "all" 
                  ? "No transactions found matching your criteria." 
                  : "No transactions found. Start by submitting a climate report or joining the DAO!"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}