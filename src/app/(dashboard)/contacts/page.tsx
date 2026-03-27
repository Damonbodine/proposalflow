"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import { ContactsDataTable } from "@/components/contacts-data-table";
import { PipelineBoard } from "@/components/pipeline-board";
import { FilterBar } from "@/components/filter-bar";

export default function ContactsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [sourceFilter, setSourceFilter] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"table" | "board">("table");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your sales contacts and leads</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "board"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Board
            </button>
          </div>
          <Button onClick={() => router.push("/contacts/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Contact
          </Button>
        </div>
      </div>
      <FilterBar
        searchPlaceholder="Search contacts..."
        onSearchChange={setSearchQuery}
        filters={[
          {
            name: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "New", value: "new" },
              { label: "Contacted", value: "contacted" },
              { label: "Qualified", value: "qualified" },
              { label: "Proposal Sent", value: "proposal_sent" },
              { label: "Won", value: "won" },
              { label: "Lost", value: "lost" },
            ],
          },
          {
            name: "source",
            label: "Source",
            value: sourceFilter,
            onChange: setSourceFilter,
            options: [
              { label: "Referral", value: "referral" },
              { label: "Website", value: "website" },
              { label: "Cold Call", value: "cold_call" },
              { label: "Trade Show", value: "trade_show" },
              { label: "Other", value: "other" },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery(undefined);
          setStatusFilter(undefined);
          setSourceFilter(undefined);
        }}
      />
      {viewMode === "table" ? (
        <ContactsDataTable
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          sourceFilter={sourceFilter}
        />
      ) : (
        <PipelineBoard
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          sourceFilter={sourceFilter}
        />
      )}
    </div>
  );
}
