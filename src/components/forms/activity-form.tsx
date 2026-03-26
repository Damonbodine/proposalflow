"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ActivityFormProps {
  contactId: Id<"contacts">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ActivityForm({ contactId, onSuccess, onCancel }: ActivityFormProps) {
  const { toast } = useToast();
  const createActivity = useMutation(api.activities.create);

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("Note");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Validation Error", description: "Title is required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await createActivity({
        contactId,
        type: type as "Note" | "Call" | "Email" | "Meeting" | "ProposalCreated" | "ProposalSent" | "ProposalViewed" | "ProposalAccepted" | "ProposalDeclined" | "StatusChange",
        title: title.trim(),
        ...(details && { details: details.trim() }),
      });
      toast({ title: "Activity logged", description: `${type} "${title}" has been recorded.` });
      setType("Note");
      setTitle("");
      setDetails("");
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to log activity.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="act-type">Activity Type *</Label>
          <Select value={type} onValueChange={(v) => setType(v ?? "")}>
            <SelectTrigger id="act-type"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Note">Note</SelectItem>
              <SelectItem value="Call">Call</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
              <SelectItem value="ProposalSent">Proposal Sent</SelectItem>
              <SelectItem value="StatusChange">Status Change</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="act-title">Title *</Label>
          <Input id="act-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Called to discuss proposal" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="act-details">Details</Label>
        <Textarea id="act-details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Additional details about this activity..." rows={3} />
      </div>
      <div className="flex justify-end gap-3">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log Activity
        </Button>
      </div>
    </form>
  );
}