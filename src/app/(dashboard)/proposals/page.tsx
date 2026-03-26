"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProposalsDataTable } from "@/components/proposals-data-table";
import { FilterBar } from "@/components/filter-bar";

export default function ProposalsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">Create and manage sales proposals</p>
        </div>
        <Button onClick={() => router.push("/proposals/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Proposal
        </Button>
      </div>
      <FilterBar
        searchPlaceholder="Search proposals..."
        onSearchChange={() => {}}
        filters={[
          {
            name: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "Draft", value: "draft" },
              { label: "Sent", value: "sent" },
              { label: "Viewed", value: "viewed" },
              { label: "Accepted", value: "accepted" },
              { label: "Rejected", value: "rejected" },
              { label: "Expired", value: "expired" },
            ],
          },
        ]}
        onReset={() => setStatusFilter(undefined)}
      />
      <ProposalsDataTable statusFilter={statusFilter} />
    </div>
  );
}