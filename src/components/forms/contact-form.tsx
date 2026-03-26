"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
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

interface ContactFormProps {
  mode: "create" | "edit";
  initialData?: {
    _id: Id<"contacts">;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    company?: string;
    jobTitle?: string;
    industry?: string;
    address?: string;
    website?: string;
    notes?: string;
    source: string;
    status: string;
    estimatedValue?: number;
    tags?: string;
  };
}

export function ContactForm({ mode, initialData }: ContactFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const createContact = useMutation(api.contacts.create);
  const updateContact = useMutation(api.contacts.update);

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.lastName ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [company, setCompany] = useState(initialData?.company ?? "");
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle ?? "");
  const [industry, setIndustry] = useState(initialData?.industry ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [website, setWebsite] = useState(initialData?.website ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [source, setSource] = useState(initialData?.source ?? "Manual");
  const [status, setStatus] = useState(initialData?.status ?? "New");
  const [estimatedValue, setEstimatedValue] = useState(initialData?.estimatedValue?.toString() ?? "");
  const [tags, setTags] = useState(initialData?.tags ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      toast({ title: "Validation Error", description: "First name, last name, and phone are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        source: source as "Manual" | "Import" | "Referral" | "Website" | "Meeting",
        ...(email && { email: email.trim() }),
        ...(company && { company: company.trim() }),
        ...(jobTitle && { jobTitle: jobTitle.trim() }),
        ...(industry && { industry: industry.trim() }),
        ...(address && { address: address.trim() }),
        ...(website && { website: website.trim() }),
        ...(notes && { notes: notes.trim() }),
        ...(estimatedValue && { estimatedValue: parseFloat(estimatedValue) }),
        ...(tags && { tags: tags.trim() }),
      };
      if (mode === "create") {
        await createContact({ ...data, status: status as "New" | "Contacted" | "Qualified" | "ProposalSent" | "Won" | "Lost" });
        toast({ title: "Contact created", description: `${firstName} ${lastName} has been added.` });
      } else if (initialData) {
        await updateContact({ contactId: initialData._id, ...data, status: status as "New" | "Contacted" | "Qualified" | "ProposalSent" | "Won" | "Lost" });
        toast({ title: "Contact updated", description: `${firstName} ${lastName} has been updated.` });
      }
      router.push("/contacts");
    } catch (error) {
      toast({ title: "Error", description: mode === "create" ? "Failed to create contact." : "Failed to update contact.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Director of Operations" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Technology" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
          <Input id="estimatedValue" type="number" step="0.01" value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} placeholder="10000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source *</Label>
          <Select value={source} onValueChange={(v) => setSource(v ?? "")}>
            <SelectTrigger id="source"><SelectValue placeholder="Select source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Import">Import</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Website">Website</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
            <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="ProposalSent">Proposal Sent</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, ST 12345" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="vip, enterprise, follow-up" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this contact..." rows={4} />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/contacts")} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Contact" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}