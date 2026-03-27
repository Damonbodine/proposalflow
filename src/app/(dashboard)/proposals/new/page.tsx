"use client";
export const dynamic = 'force-dynamic';

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProposalForm } from "@/components/proposal-form";

export default function NewProposalPage() {
  return (
    <div className="space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/proposals" className="hover:text-foreground">Proposals</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">New Proposal</span>
      </nav>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Proposal</h1>
        <p className="text-muted-foreground">Create a new sales proposal</p>
      </div>
      <ProposalForm />
    </div>
  );
}