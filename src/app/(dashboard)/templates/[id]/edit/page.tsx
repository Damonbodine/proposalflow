"use client";
export const dynamic = 'force-dynamic';

import { use } from "react";
import { TemplateForm } from "@/components/template-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
      <Breadcrumbs
        items={[
          { label: "Templates", href: "/templates" },
          { label: "Edit Template" },
        ]}
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
        <p className="text-muted-foreground">Update template details and default line items</p>
      </div>
      <TemplateForm templateId={templateId} />
    </div>
  );
}
