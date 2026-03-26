"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TemplateForm } from "@/components/template-form";
import { Id } from "@convex/_generated/dataModel";

export default function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const templateId = id as unknown as Id<"proposalTemplates">;

  return (
    <div className="space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/templates" className="hover:text-foreground">Templates</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Edit Template</span>
      </nav>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
        <p className="text-muted-foreground">Update template details and default line items</p>
      </div>
      <TemplateForm templateId={templateId} />
    </div>
  );
}