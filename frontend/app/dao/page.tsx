"use client"

import { useState } from "react"
import { RoleGuard } from "@/components/auth/role-guard"
import { BackButton } from "@/components/ui/back-button"
import { MembershipStatus } from "@/components/dao/membership-status"
import { CreateProposalModal } from "@/components/dao/create-proposal-modal"
import { ProposalFilters } from "@/components/dao/proposal-filters"
import { ProposalCard } from "@/components/dao/proposal-card"

// Mock data for proposals
const mockProposals = [
  {
    id: "1",
    title: "Increase Validation Rewards by 25%",
    description:
      "Proposal to increase the CLT token rewards for weather report validation to encourage more community participation and improve data quality.",
    status: "active" as const,
    votesFor: 1250,
    votesAgainst: 340,
    totalVotes: 1590,
    timeRemaining: "3 days left",
    proposer: "ClimateValidator",
  },
  {
    id: "2",
    title: "Implement Regional Weather Stations",
    description:
      "Establish partnerships with local weather stations to provide reference data for validation processes and improve accuracy of community reports.",
    status: "active" as const,
    votesFor: 890,
    votesAgainst: 120,
    totalVotes: 1010,
    timeRemaining: "5 days left",
    proposer: "WeatherPro",
  },
  {
    id: "3",
    title: "Reduce Minimum Staking Requirement",
    description:
      "Lower the minimum BDAG staking requirement from 500 to 250 tokens to make DAO participation more accessible to smaller holders.",
    status: "passed" as const,
    votesFor: 2100,
    votesAgainst: 450,
    totalVotes: 2550,
    timeRemaining: "",
    proposer: "CommunityFirst",
  },
]

export default function DAOPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const handleVote = (proposalId: string, vote: "for" | "against") => {
    console.log(`Voting ${vote} on proposal ${proposalId}`)
    // Handle voting logic here
  }

  const filteredProposals = mockProposals.filter((proposal) => {
    if (activeFilter !== "all" && proposal.status !== activeFilter) return false
    if (searchQuery && !proposal.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <RoleGuard requiredRole="dao">
      <div className="container mx-auto px-4 py-8">
        <BackButton href="/dashboard">Back to Dashboard</BackButton>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-climate-green mb-2">DAO Governance</h1>
            <p className="text-muted-foreground">
              Participate in ClimaLink's decentralized governance and shape the future of climate reporting
            </p>
          </div>
          <CreateProposalModal />
        </div>

        <MembershipStatus />

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Active Proposals</h2>
            <ProposalFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          <div className="grid gap-6">
            {filteredProposals.length > 0 ? (
              filteredProposals.map((proposal) => <ProposalCard key={proposal.id} {...proposal} onVote={handleVote} />)
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No proposals found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
