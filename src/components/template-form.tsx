"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categories = ["Service", "Product", "Consulting", "Subscription", "Custom"] as const;

interface TemplateFormProps {
  templateId?: Id<"proposalTemplates">;
}

export function TemplateForm({ templateId }: TemplateFormProps) {
  const existingTemplate = useQuery(api.proposalTemplates.get, templateId ? { templateId } : "skip");
  const createTemplate = useMutation(api.proposalTemplates.create);
  const updateTemplate = useMutation(api.proposalTemplates.update);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<string>("Service");

  const isEdit = !!templateId;

  useEffect(() => {
    if (existingTemplate) {
      setCategory(existingTemplate.category);
    }
  }, [existingTemplate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = {
        name: fd.get("name") as string,
        description: (fd.get("description") as string) || undefined,
        category: category as "Service" | "Product" | "Consulting" | "Subscription" | "Custom",
        defaultContent: (fd.get("defaultContent") as string) || "",
        defaultLineItems: (fd.get("defaultLineItems") as string) || undefined,
      };

      if (isEdit && templateId) {
        await updateTemplate({ templateId, ...data });
      } else {
        await createTemplate(data);
      }
      router.push("/templates");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && !existingTemplate) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Template" : "New Template"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required defaultValue={existingTemplate?.name ?? ""} />
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} defaultValue={existingTemplate?.description ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultContent">Default Content</Label>
            <Textarea id="defaultContent" name="defaultContent" rows={8} defaultValue={existingTemplate?.defaultContent ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultLineItems">Default Line Items (JSON)</Label>
            <Textarea id="defaultLineItems" name="defaultLineItems" rows={4} placeholder='[{"description": "Item 1", "quantity": 1, "unitPrice": 100}]' defaultValue={existingTemplate?.defaultLineItems ?? ""} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (isEdit ? "Save Changes" : "Create Template")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}