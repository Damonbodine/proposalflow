"use client";

import { use } from "react";
import { ProposalDetailView } from "@/components/proposal-detail-view";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Id } from "@convex/_generated/dataModel";

export default function ProposalDetailPage({
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
          { label: "Details" },
        ]}
      />
      <ProposalDetailView proposalId={proposalId} />
    </div>
  );
}
