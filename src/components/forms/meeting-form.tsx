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

interface MeetingFormProps {
  mode: "create" | "edit";
  initialData?: {
    _id: Id<"meetings">;
    title: string;
    description?: string;
    contactId: Id<"contacts">;
    proposalId?: Id<"proposals">;
    startTime: number;
    endTime: number;
    location?: string;
    meetingType: string;
  };
  preselectedContactId?: Id<"contacts">;
  preselectedProposalId?: Id<"proposals">;
}

export function MeetingForm({ mode, initialData, preselectedContactId, preselectedProposalId }: MeetingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const createMeeting = useMutation(api.meetings.create);
  const updateMeeting = useMutation(api.meetings.update);
  const contacts = useQuery(api.contacts.list, {});
  const proposals = useQuery(api.proposals.list, {});

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [contactId, setContactId] = useState<string>(initialData?.contactId ?? preselectedContactId ?? "");
  const [proposalId, setProposalId] = useState<string>(initialData?.proposalId ?? preselectedProposalId ?? "");
  const [startTime, setStartTime] = useState(
    initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : ""
  );
  const [endTime, setEndTime] = useState(
    initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : ""
  );
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [meetingType, setMeetingType] = useState(initialData?.meetingType ?? "InPerson");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactId || !startTime || !endTime) {
      toast({ title: "Validation Error", description: "Title, contact, start time, and end time are required.", variant: "destructive" });
      return;
    }
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    if (endMs <= startMs) {
      toast({ title: "Validation Error", description: "End time must be after start time.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = {
        title: title.trim(),
        contactId: contactId as Id<"contacts">,
        startTime: startMs,
        endTime: endMs,
        meetingType: meetingType as "Discovery" | "Presentation" | "FollowUp" | "Negotiation" | "Closing" | "Other",
        ...(description && { description: description.trim() }),
        ...(proposalId && { proposalId: proposalId as Id<"proposals"> }),
        ...(location && { location: location.trim() }),
      };
      if (mode === "create") {
        await createMeeting(data);
        toast({ title: "Meeting scheduled", description: `"${title}" has been created.` });
      } else if (initialData) {
        await updateMeeting({ meetingId: initialData._id, ...data });
        toast({ title: "Meeting updated", description: `"${title}" has been updated.` });
      }
      router.push("/meetings");
    } catch (error) {
      toast({ title: "Error", description: mode === "create" ? "Failed to schedule meeting." : "Failed to update meeting.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quarterly review meeting" required />
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
          <Label htmlFor="proposalId">Proposal (optional)</Label>
          <Select value={proposalId} onValueChange={(v) => setProposalId(v ?? "")}>
            <SelectTrigger id="proposalId"><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">None</SelectItem>
              {proposals?.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input id="startTime" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Input id="endTime" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Office / Zoom link" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meetingType">Meeting Type *</Label>
          <Select value={meetingType} onValueChange={(v) => setMeetingType(v ?? "")}>
            <SelectTrigger id="meetingType"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="InPerson">In Person</SelectItem>
              <SelectItem value="Video">Video Call</SelectItem>
              <SelectItem value="Phone">Phone Call</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Meeting agenda and notes..." rows={4} />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/meetings")} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Schedule Meeting" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}