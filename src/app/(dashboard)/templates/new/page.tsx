"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TemplateForm } from "@/components/template-form";

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/templates" className="hover:text-foreground">Templates</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">New Template</span>
      </nav>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Template</h1>
        <p className="text-muted-foreground">Create a reusable proposal template</p>
      </div>
      <TemplateForm />
    </div>
  );
}