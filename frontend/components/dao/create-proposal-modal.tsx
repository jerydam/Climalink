"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreateProposalModal() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "7",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle proposal creation
    console.log("Creating proposal:", formData)
    setOpen(false)
    setFormData({ title: "", description: "", category: "", duration: "7" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-climate-green hover:bg-climate-green/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Creating a proposal requires 100 BDAG tokens as a deposit. This will be returned if the proposal receives at
            least 10% participation.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a clear, descriptive title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select proposal category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="protocol">Protocol Upgrade</SelectItem>
                <SelectItem value="rewards">Reward Structure</SelectItem>
                <SelectItem value="governance">Governance Change</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="treasury">Treasury Management</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a detailed description of your proposal, including rationale and expected outcomes..."
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Voting Duration</Label>
            <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-climate-green hover:bg-climate-green/90">
              Create Proposal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
