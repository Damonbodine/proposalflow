"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProposalFormProps {
  proposalId?: Id<"proposals">;
  preselectedContactId?: Id<"contacts">;
}

export function ProposalForm({ proposalId, preselectedContactId }: ProposalFormProps) {
  const contacts = useQuery(api.contacts.list, {});
  const templates = useQuery(api.proposalTemplates.list, {});
  const existingProposal = useQuery(api.proposals.get, proposalId ? { proposalId } : "skip");
  const createProposal = useMutation(api.proposals.create);
  const updateProposal = useMutation(api.proposals.update);
  const generateFromTemplate = useMutation(api.proposals.generateFromTemplate);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactId, setContactId] = useState<string>(preselectedContactId ?? existingProposal?.contactId ?? "");
  const [templateId, setTemplateId] = useState<string>("");

  const isEdit = !!proposalId;

  const handleGenerateFromTemplate = async () => {
    if (!templateId || !contactId) return;
    setIsSubmitting(true);
    try {
      const id = await generateFromTemplate({
        templateId: templateId as Id<"proposalTemplates">,
        contactId: contactId as Id<"contacts">,
        title: "Untitled Proposal",
      });
      router.push(`/proposals/${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = {
        title: fd.get("title") as string,
        contactId: contactId as Id<"contacts">,
        content: (fd.get("content") as string) || "",
        summary: (fd.get("summary") as string) || undefined,
        validUntil: fd.get("validUntil") ? new Date(fd.get("validUntil") as string).getTime() : undefined,
      };

      if (isEdit && proposalId) {
        await updateProposal({ proposalId, ...data });
        router.push(`/proposals/${proposalId}`);
      } else {
        const id = await createProposal(data);
        router.push(`/proposals/${id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && !existingProposal) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!isEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Generate from Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={templateId} onValueChange={(v) => setTemplateId(v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="Select template..." /></SelectTrigger>
                  <SelectContent>
                    {templates?.filter((t) => t.isActive).map((t) => (
                      <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contact</Label>
                <Select value={contactId} onValueChange={(v) => setContactId(v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="Select contact..." /></SelectTrigger>
                  <SelectContent>
                    {contacts?.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="button" variant="secondary" onClick={handleGenerateFromTemplate} disabled={!templateId || !contactId || isSubmitting}>
              Generate Proposal
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Proposal" : "Create Proposal"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required defaultValue={existingProposal?.title ?? ""} />
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label>Contact *</Label>
                <Select value={contactId} onValueChange={(v) => setContactId(v ?? "")} required>
                  <SelectTrigger><SelectValue placeholder="Select contact..." /></SelectTrigger>
                  <SelectContent>
                    {contacts?.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" rows={2} defaultValue={existingProposal?.summary ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" rows={8} defaultValue={existingProposal?.content ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="date"
                defaultValue={existingProposal?.validUntil ? new Date(existingProposal.validUntil).toISOString().split("T")[0] : ""}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : (isEdit ? "Save Changes" : "Create Proposal")}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}