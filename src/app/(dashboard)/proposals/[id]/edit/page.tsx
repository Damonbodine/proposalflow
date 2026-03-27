"use client";
export const dynamic = 'force-dynamic';

import { use } from "react";
import { ProposalForm } from "@/components/proposal-form";
import { LineItemsEditor } from "@/components/line-items-editor";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
      <Breadcrumbs
        items={[
          { label: "Proposals", href: "/proposals" },
          { label: "Details", href: `/proposals/${id}` },
          { label: "Edit" },
        ]}
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Proposal</h1>
        <p className="text-muted-foreground">Update proposal details and line items</p>
      </div>
      <ProposalForm proposalId={proposalId} />
      <LineItemsEditor proposalId={proposalId} />
    </div>
  );
}
