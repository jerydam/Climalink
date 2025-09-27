'use client';
import { CreateProposalModal } from "@/components/dao/create-proposal-modal";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function CreatePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <RoleGuard requiredRole={[UserRole.DAO_MEMBER, UserRole.ADMIN]} fallbackPath="/">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Create DAO Proposal</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-muted-foreground">
              Proposals allow DAO members to suggest and vote on initiatives that drive our mission forward.
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
              Create New Proposal
            </Button>
          </CardContent>
        </Card>

        <CreateProposalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </RoleGuard>
  );
}