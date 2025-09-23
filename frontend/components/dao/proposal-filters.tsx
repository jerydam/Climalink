"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface ProposalFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

export function ProposalFilters({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: ProposalFiltersProps) {
  const filters = [
    { value: "all", label: "All Proposals" },
    { value: "active", label: "Active" },
    { value: "passed", label: "Passed" },
    { value: "rejected", label: "Rejected" },
    { value: "pending", label: "Pending" },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className={activeFilter === filter.value ? "bg-climate-green hover:bg-climate-green/90" : ""}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most-votes">Most Votes</SelectItem>
            <SelectItem value="ending-soon">Ending Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
