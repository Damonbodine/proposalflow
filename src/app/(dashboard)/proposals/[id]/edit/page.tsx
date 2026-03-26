"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProposalForm } from "@/components/proposal-form";
import { LineItemsEditor } from "@/components/line-items-editor";
import { Id } from "@convex/_generated/dataModel";

export default function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const proposalId = id as unknown as Id<"proposals">;

  return (
    <div className="space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/proposals" className="hover:text-foreground">Proposals</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/proposals/${id}`} className="hover:text-foreground">Details</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Edit</span>
      </nav>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Proposal</h1>
        <p className="text-muted-foreground">Update proposal details and line items</p>
      </div>
      <ProposalForm proposalId={proposalId} />
      <LineItemsEditor proposalId={proposalId} />
    </div>
  );
}