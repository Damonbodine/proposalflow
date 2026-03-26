"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, List, CalendarDays } from "lucide-react";
import { MeetingsDataTable } from "@/components/meetings-data-table";
import { MeetingsCalendar } from "@/components/meetings-calendar";
import { FilterBar } from "@/components/filter-bar";

export default function MeetingsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">Schedule and track your meetings</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </button>
          </div>
          <Button onClick={() => router.push("/meetings/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Meeting
          </Button>
        </div>
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
      {viewMode === "list" ? (
        <MeetingsDataTable statusFilter={statusFilter} typeFilter={typeFilter} />
      ) : (
        <MeetingsCalendar statusFilter={statusFilter} typeFilter={typeFilter} />
      )}
    </div>
  );
}
