"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContactsDataTable } from "@/components/contacts-data-table";
import { FilterBar } from "@/components/filter-bar";

export default function ContactsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [sourceFilter, setSourceFilter] = useState<string | undefined>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your sales contacts and leads</p>
        </div>
        <Button onClick={() => router.push("/contacts/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Contact
        </Button>
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
      <ContactsDataTable
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sourceFilter={sourceFilter}
      />
    </div>
  );
}