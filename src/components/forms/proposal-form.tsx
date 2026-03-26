"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/rich-text-editor";

interface ProposalFormProps {
  preselectedContactId?: Id<"contacts">;
  preselectedTemplateId?: Id<"proposalTemplates">;
}

export function ProposalForm({ preselectedContactId, preselectedTemplateId }: ProposalFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const createProposal = useMutation(api.proposals.create);
  const generateFromTemplate = useMutation(api.proposals.generateFromTemplate);
  const contacts = useQuery(api.contacts.list, {});
  const templates = useQuery(api.proposalTemplates.list, {});

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [contactId, setContactId] = useState<string>(preselectedContactId ?? "");
  const [templateId, setTemplateId] = useState<string>(preselectedTemplateId ?? "");
  const [content, setContent] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactId) {
      toast({ title: "Validation Error", description: "Title and contact are required.", variant: "destructive" });
      return;
    }
    if (!useTemplate && !content.trim()) {
      toast({ title: "Validation Error", description: "Proposal content is required when not using a template.", variant: "destructive" });
      return;
    }
    if (useTemplate && !templateId) {
      toast({ title: "Validation Error", description: "Please select a template.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const validUntilMs = validUntil ? new Date(validUntil).getTime() : undefined;
      if (useTemplate && templateId) {
        await generateFromTemplate({
          templateId: templateId as Id<"proposalTemplates">,
          contactId: contactId as Id<"contacts">,
          title: title.trim(),
          ...(validUntilMs && { validUntil: validUntilMs }),
        });
      } else {
        await createProposal({
          title: title.trim(),
          contactId: contactId as Id<"contacts">,
          content: content.trim(),
          ...(templateId && { templateId: templateId as Id<"proposalTemplates"> }),
          ...(validUntilMs && { validUntil: validUntilMs }),
        });
      }
      toast({ title: "Proposal created", description: `"${title}" has been created.` });
      router.push("/proposals");
    } catch (error) {
      toast({ title: "Error", description: "Failed to create proposal.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Proposal Title *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Website Redesign Proposal" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactId">Contact *</Label>
          <Select value={contactId} onValueChange={(v) => setContactId(v ?? "")}>
            <SelectTrigger id="contactId"><SelectValue placeholder="Select contact" /></SelectTrigger>
            <SelectContent>
              {contacts?.map((c) => (
                <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid Until</Label>
          <Input id="validUntil" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant={useTemplate ? "default" : "outline"} size="sm" onClick={() => setUseTemplate(true)}>From Template</Button>
        <Button type="button" variant={!useTemplate ? "default" : "outline"} size="sm" onClick={() => setUseTemplate(false)}>Custom Content</Button>
      </div>
      {useTemplate ? (
        <div className="space-y-2">
          <Label htmlFor="templateId">Template *</Label>
          <Select value={templateId} onValueChange={(v) => setTemplateId(v ?? "")}>
            <SelectTrigger id="templateId"><SelectValue placeholder="Select template" /></SelectTrigger>
            <SelectContent>
              {templates?.map((t) => (
                <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="content">Proposal Content *</Label>
          <RichTextEditor
            id="content"
            value={content}
            onChange={setContent}
            placeholder="Enter your proposal details here... Use **bold** and *italic* for formatting."
          />
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/proposals")} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Proposal
        </Button>
      </div>
    </form>
  );
}