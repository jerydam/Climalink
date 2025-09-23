"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, TrendingUp, FileText, Vote, Coins, Lock } from "lucide-react"

interface Transaction {
  id: string
  date: string
  type: "reward" | "report" | "vote" | "dao_fee" | "stake"
  amount: string
  status: "completed" | "pending" | "failed"
  description: string
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "Mar 15",
    type: "reward",
    amount: "+20 CLT",
    status: "completed",
    description: "Validation reward for report #1234",
  },
  {
    id: "2",
    date: "Mar 14",
    type: "report",
    amount: "+20 CLT",
    status: "completed",
    description: "Report submission reward",
  },
  {
    id: "3",
    date: "Mar 13",
    type: "vote",
    amount: "0 CLT",
    status: "completed",
    description: "DAO proposal vote",
  },
  {
    id: "4",
    date: "Mar 12",
    type: "dao_fee",
    amount: "-1000 CLT",
    status: "completed",
    description: "DAO membership fee",
  },
  {
    id: "5",
    date: "Feb 15",
    type: "stake",
    amount: "+1000 CLT",
    status: "completed",
    description: "Initial staking bonus",
  },
]

export function TransactionHistory() {
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reward":
        return <TrendingUp className="h-4 w-4 text-climate-green" />
      case "report":
        return <FileText className="h-4 w-4 text-sky-blue" />
      case "vote":
        return <Vote className="h-4 w-4 text-purple-500" />
      case "dao_fee":
        return <Coins className="h-4 w-4 text-amber-500" />
      case "stake":
        return <Lock className="h-4 w-4 text-sky-blue" />
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

  const filteredTransactions = mockTransactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false
    if (searchQuery && !tx.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

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
                <SelectItem value="reward">Rewards</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="vote">Votes</SelectItem>
                <SelectItem value="dao_fee">DAO Fees</SelectItem>
                <SelectItem value="stake">Staking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-medium ${transaction.amount.startsWith("+") ? "text-climate-green" : transaction.amount.startsWith("-") ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {transaction.amount}
                  </span>
                  <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found matching your criteria.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
