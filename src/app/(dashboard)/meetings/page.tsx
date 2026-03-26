"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MeetingsDataTable } from "@/components/meetings-data-table";
import { FilterBar } from "@/components/filter-bar";

export default function MeetingsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">Schedule and track your meetings</p>
        </div>
        <Button onClick={() => router.push("/meetings/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Meeting
        </Button>
      </div>
      <FilterBar
        searchPlaceholder="Search meetings..."
        onSearchChange={() => {}}
        filters={[
          {
            name: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "Scheduled", value: "scheduled" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
              { label: "No Show", value: "no_show" },
            ],
          },
          {
            name: "type",
            label: "Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: "Discovery", value: "discovery" },
              { label: "Demo", value: "demo" },
              { label: "Follow-up", value: "follow_up" },
              { label: "Negotiation", value: "negotiation" },
              { label: "Other", value: "other" },
            ],
          },
        ]}
        onReset={() => {
          setStatusFilter(undefined);
          setTypeFilter(undefined);
        }}
      />
      <MeetingsDataTable statusFilter={statusFilter} typeFilter={typeFilter} />
    </div>
  );
}