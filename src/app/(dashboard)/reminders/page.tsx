"use client";
export const dynamic = 'force-dynamic';

import { RemindersDataTable } from "@/components/reminders-data-table";

export default function RemindersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
        <p className="text-muted-foreground">Manage your follow-up reminders</p>
      </div>
      <RemindersDataTable />
    </div>
  );
}