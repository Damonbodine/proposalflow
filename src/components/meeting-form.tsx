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
import { toast } from "sonner";

const meetingTypes = ["Discovery", "Presentation", "FollowUp", "Negotiation", "Closing", "Other"] as const;

interface MeetingFormProps {
  preselectedContactId?: Id<"contacts">;
}

export function MeetingForm({ preselectedContactId }: MeetingFormProps) {
  const contacts = useQuery(api.contacts.list, {});
  const createMeeting = useMutation(api.meetings.create);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactId, setContactId] = useState<string>(preselectedContactId ?? "");
  const [meetingType, setMeetingType] = useState<string>("Discovery");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createMeeting({
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || undefined,
        contactId: contactId as Id<"contacts">,
        startTime: new Date(fd.get("startTime") as string).getTime(),
        endTime: new Date(fd.get("endTime") as string).getTime(),
        location: (fd.get("location") as string) || undefined,
        meetingType: meetingType as "Discovery" | "Presentation" | "FollowUp" | "Negotiation" | "Closing" | "Other",
      });
      toast.success("Meeting scheduled");
      router.push("/meetings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Schedule Meeting</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label>Contact *</Label>
            <Select value={contactId} onValueChange={(v) => setContactId(v ?? "")} required>
              <SelectTrigger><SelectValue placeholder="Select contact..." /></SelectTrigger>
              <SelectContent>
                {contacts?.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.firstName} {c.lastName} {c.company ? `(${c.company})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Meeting Type *</Label>
            <Select value={meetingType} onValueChange={(v) => setMeetingType(v ?? "")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {meetingTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input id="startTime" name="startTime" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input id="endTime" name="endTime" type="datetime-local" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
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