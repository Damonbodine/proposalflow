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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const sources = ["Manual", "Import", "Referral", "Website", "Meeting"] as const;
const statuses = ["New", "Contacted", "Qualified", "ProposalSent", "Won", "Lost"] as const;

interface ContactFormProps {
  contactId?: Id<"contacts">;
}

export function ContactForm({ contactId }: ContactFormProps) {
  const existingContact = useQuery(
    api.contacts.get,
    contactId ? { contactId } : "skip"
  );
  const createContact = useMutation(api.contacts.create);
  const updateContact = useMutation(api.contacts.update);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [source, setSource] = useState<string>("Manual");
  const [status, setStatus] = useState<string>("New");

  useEffect(() => {
    if (existingContact) {
      setSource(existingContact.source);
      setStatus(existingContact.status);
    }
  }, [existingContact]);

  const isEdit = !!contactId;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = {
        firstName: fd.get("firstName") as string,
        lastName: fd.get("lastName") as string,
        email: (fd.get("email") as string) || undefined,
        phone: fd.get("phone") as string,
        company: (fd.get("company") as string) || undefined,
        jobTitle: (fd.get("jobTitle") as string) || undefined,
        industry: (fd.get("industry") as string) || undefined,
        address: (fd.get("address") as string) || undefined,
        website: (fd.get("website") as string) || undefined,
        notes: (fd.get("notes") as string) || undefined,
        source: source as "Manual" | "Import" | "Referral" | "Website" | "Meeting",
        status: status as "New" | "Contacted" | "Qualified" | "ProposalSent" | "Won" | "Lost",
        estimatedValue: fd.get("estimatedValue") ? parseFloat(fd.get("estimatedValue") as string) : undefined,
        tags: (fd.get("tags") as string) || undefined,
      };

      if (isEdit && contactId) {
        await updateContact({ contactId, ...data });
        toast.success("Contact updated");
        router.push(`/contacts/${contactId}`);
      } else {
        const id = await createContact(data);
        toast.success("Contact created");
        router.push(`/contacts/${id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && !existingContact) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Contact" : "New Contact"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" required defaultValue={existingContact?.firstName ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="lastName" required defaultValue={existingContact?.lastName ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={existingContact?.email ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" required defaultValue={existingContact?.phone ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={existingContact?.company ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" name="jobTitle" defaultValue={existingContact?.jobTitle ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" defaultValue={existingContact?.industry ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
              <Input id="estimatedValue" name="estimatedValue" type="number" step="0.01" defaultValue={existingContact?.estimatedValue ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source *</Label>
              <Select value={source} onValueChange={(v) => setSource(v ?? "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={existingContact?.address ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" defaultValue={existingContact?.website ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" name="tags" defaultValue={existingContact?.tags ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={existingContact?.notes ?? ""} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Contact")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}