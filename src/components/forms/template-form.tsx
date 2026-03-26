"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface TemplateFormProps {
  mode: "create" | "edit";
  initialData?: {
    _id: Id<"proposalTemplates">;
    name: string;
    description?: string;
    category: string;
    defaultContent: string;
    defaultLineItems?: string;
  };
}

export function TemplateForm({ mode, initialData }: TemplateFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const createTemplate = useMutation(api.proposalTemplates.create);
  const updateTemplate = useMutation(api.proposalTemplates.update);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "General");
  const [defaultContent, setDefaultContent] = useState(initialData?.defaultContent ?? "");
  const [defaultLineItems, setDefaultLineItems] = useState(initialData?.defaultLineItems ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !defaultContent.trim()) {
      toast({ title: "Validation Error", description: "Name and default content are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        category: category as "Service" | "Product" | "Consulting" | "Subscription" | "Custom",
        defaultContent: defaultContent.trim(),
        ...(description && { description: description.trim() }),
        ...(defaultLineItems && { defaultLineItems: defaultLineItems.trim() }),
      };
      if (mode === "create") {
        await createTemplate(data);
        toast({ title: "Template created", description: `"${name}" template has been created.` });
      } else if (initialData) {
        await updateTemplate({ templateId: initialData._id, ...data });
        toast({ title: "Template updated", description: `"${name}" template has been updated.` });
      }
      router.push("/templates");
    } catch (error) {
      toast({ title: "Error", description: mode === "create" ? "Failed to create template." : "Failed to update template.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Standard Services Proposal" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
            <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Services">Services</SelectItem>
              <SelectItem value="Products">Products</SelectItem>
              <SelectItem value="Consulting">Consulting</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this template" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="defaultContent">Default Content *</Label>
        <Textarea id="defaultContent" value={defaultContent} onChange={(e) => setDefaultContent(e.target.value)} placeholder="Enter the default proposal content..." rows={10} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="defaultLineItems">Default Line Items (JSON)</Label>
        <Textarea id="defaultLineItems" value={defaultLineItems} onChange={(e) => setDefaultLineItems(e.target.value)} placeholder='[{"description": "Service", "quantity": 1, "unitPrice": 100}]' rows={4} />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/templates")} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Template" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}