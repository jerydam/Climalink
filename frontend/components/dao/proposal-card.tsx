"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Users, ThumbsUp, ThumbsDown } from "lucide-react"

interface ProposalCardProps {
  id: string
  title: string
  description: string
  status: "active" | "passed" | "rejected" | "pending"
  votesFor: number
  votesAgainst: number
  totalVotes: number
  timeRemaining: string
  proposer: string
  onVote: (proposalId: string, vote: "for" | "against") => void
}

export function ProposalCard({
  id,
  title,
  description,
  status,
  votesFor,
  votesAgainst,
  totalVotes,
  timeRemaining,
  proposer,
  onVote,
}: ProposalCardProps) {
  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0
  const againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-sky-blue text-white"
      case "passed":
        return "bg-climate-green text-white"
      case "rejected":
        return "bg-destructive text-white"
      case "pending":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge className={getStatusColor(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
          </div>
          {status === "active" && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {timeRemaining}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>For: {votesFor}</span>
            <span>Against: {votesAgainst}</span>
          </div>
          <div className="space-y-1">
            <Progress value={forPercentage} className="h-2" />
            <Progress value={againstPercentage} className="h-2 bg-red-100" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            by {proposer}
          </div>

          {status === "active" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVote(id, "for")}
                className="text-climate-green border-climate-green hover:bg-climate-green hover:text-white"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                For
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVote(id, "against")}
                className="text-destructive border-destructive hover:bg-destructive hover:text-white"
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Against
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
