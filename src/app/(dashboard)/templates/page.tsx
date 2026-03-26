"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TemplatesDataTable } from "@/components/templates-data-table";

export default function TemplatesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">Manage proposal templates</p>
        </div>
        <Button onClick={() => router.push("/templates/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Template
        </Button>
      </div>
      <TemplatesDataTable />
    </div>
  );
}