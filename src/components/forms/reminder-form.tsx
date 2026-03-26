"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ReminderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedContactId?: Id<"contacts">;
  preselectedProposalId?: Id<"proposals">;
  preselectedMeetingId?: Id<"meetings">;
}

export function ReminderForm({ onSuccess, onCancel, preselectedContactId, preselectedProposalId, preselectedMeetingId }: ReminderFormProps) {
  const { toast } = useToast();
  const createReminder = useMutation(api.reminders.create);
  const contacts = useQuery(api.contacts.list, {});
  const proposals = useQuery(api.proposals.list, {});
  const meetings = useQuery(api.meetings.list, {});

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [contactId, setContactId] = useState<string>(preselectedContactId ?? "");
  const [proposalId, setProposalId] = useState<string>(preselectedProposalId ?? "");
  const [meetingId, setMeetingId] = useState<string>(preselectedMeetingId ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueAt) {
      toast({ title: "Validation Error", description: "Title and due date are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await createReminder({
        title: title.trim(),
        dueAt: new Date(dueAt).getTime(),
        ...(contactId && contactId !== "__none" && { contactId: contactId as Id<"contacts"> }),
        ...(proposalId && proposalId !== "__none" && { proposalId: proposalId as Id<"proposals"> }),
        ...(meetingId && meetingId !== "__none" && { meetingId: meetingId as Id<"meetings"> }),
      });
      toast({ title: "Reminder created", description: `Reminder "${title}" has been set.` });
      setTitle("");
      setDueAt("");
      setContactId("");
      setProposalId("");
      setMeetingId("");
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create reminder.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rem-title">Title *</Label>
        <Input id="rem-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Follow up with client" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rem-dueAt">Due Date & Time *</Label>
        <Input id="rem-dueAt" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rem-contactId">Related Contact</Label>
        <Select value={contactId} onValueChange={(v) => setContactId(v ?? "")}>
          <SelectTrigger id="rem-contactId"><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">None</SelectItem>
            {contacts?.map((c) => (
              <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rem-proposalId">Related Proposal</Label>
        <Select value={proposalId} onValueChange={(v) => setProposalId(v ?? "")}>
          <SelectTrigger id="rem-proposalId"><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">None</SelectItem>
            {proposals?.map((p) => (
              <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rem-meetingId">Related Meeting</Label>
        <Select value={meetingId} onValueChange={(v) => setMeetingId(v ?? "")}>
          <SelectTrigger id="rem-meetingId"><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">None</SelectItem>
            {meetings?.map((m) => (
              <SelectItem key={m._id} value={m._id}>{m.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-3">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Reminder
        </Button>
      </div>
    </form>
  );
}