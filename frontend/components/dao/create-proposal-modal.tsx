"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "@/lib/web3"
import { TransactionModal } from "@/components/blockchain/transaction-modal"

export function CreateProposalModal() {
  const { getContract } = useWeb3()
  
  const [open, setOpen] = useState(false)
  const [showTxModal, setShowTxModal] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "7",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      return
    }

    // Close form modal and show transaction modal
    setOpen(false)
    setShowTxModal(true)
  }

  const handleCreateProposal = async (): Promise<string> => {
    const daoContract = getContract("DAO")
    
    // Convert duration from days to seconds
    const durationInSeconds = parseInt(formData.duration) * 24 * 60 * 60
    
    const tx = await daoContract.createProposal(
      formData.title,
      formData.description,
      durationInSeconds
    )
    
    return tx.hash
  }

  const handleTxModalClose = () => {
    setShowTxModal(false)
    setFormData({ title: "", description: "", category: "", duration: "7" })
  }

  const isFormValid = () => {
    return formData.title.trim().length > 0 && 
           formData.title.trim().length <= 200 &&
           formData.description.trim().length > 0 && 
           formData.description.trim().length <= 1000 &&
           formData.category.length > 0
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-climate-green hover:bg-climate-green/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Proposal</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                DAO members can create proposals to improve the platform. Proposals require majority vote (51% quorum) to pass and have a 1-hour voting delay.
              </AlertDescription>
            </Alert>

            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Requirements:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Must be an active DAO member</li>
                  <li>• Title: 1-200 characters</li>
                  <li>• Description: 1-1000 characters</li>
                  <li>• Duration: 1-30 days</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Proposal Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a clear, descriptive title (max 200 characters)"
                maxLength={200}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select proposal category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="protocol">Protocol Upgrade</SelectItem>
                  <SelectItem value="rewards">Reward Structure</SelectItem>
                  <SelectItem value="governance">Governance Change</SelectItem>
                  <SelectItem value="validation">Validation Parameters</SelectItem>
                  <SelectItem value="staking">Staking Requirements</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="treasury">Treasury Management</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of your proposal, including:
- Problem statement or opportunity
- Proposed solution
- Expected benefits and outcomes
- Implementation considerations
- Risk assessment (if applicable)"
                rows={8}
                maxLength={1000}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Voting Duration *</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day (Fast track)</SelectItem>
                  <SelectItem value="3">3 days (Standard)</SelectItem>
                  <SelectItem value="7">7 days (Extended)</SelectItem>
                  <SelectItem value="14">14 days (Major changes)</SelectItem>
                  <SelectItem value="30">30 days (Protocol upgrades)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Voting starts 1 hour after proposal creation. Choose duration based on proposal complexity.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Voting Process:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>1. Proposal created with 1-hour delay before voting starts</li>
                <li>2. DAO members vote For/Against/Abstain during voting period</li>
                <li>3. Requires 51% of active members to participate (quorum)</li>
                <li>4. Majority For votes needed to pass</li>
                <li>5. Passed proposals can be executed by any member</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-climate-green hover:bg-climate-green/90"
                disabled={!isFormValid()}
              >
                Create Proposal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTxModal}
        onClose={handleTxModalClose}
        title="Create Proposal"
        description={`Create proposal "${formData.title}" with ${formData.duration} day voting period. Voting will begin 1 hour after creation.`}
        onConfirm={handleCreateProposal}
      />
    </>
  )
}