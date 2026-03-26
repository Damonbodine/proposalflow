"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProposalDetailView } from "@/components/proposal-detail-view";
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
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/proposals" className="hover:text-foreground">Proposals</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Details</span>
      </nav>
      <ProposalDetailView proposalId={proposalId} />
    </div>
  );
}