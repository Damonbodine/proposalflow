"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";

interface ProposalDraftGeneratorProps {
  contactId: string;
  proposalTitle: string;
  onGenerated: (content: string) => void;
}

export function ProposalDraftGenerator({
  contactId,
  proposalTitle,
  onGenerated,
}: ProposalDraftGeneratorProps) {
  const generateDraft = useAction(api.ai.generateProposalDraft);
  const contact = useQuery(
    api.contacts.get,
    contactId ? { contactId: contactId as Id<"contacts"> } : "skip"
  );
  const meetings = useQuery(
    api.meetings.list,
    contactId ? { contactId: contactId as Id<"contacts"> } : "skip"
  );

  const [loading, setLoading] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState("");
  const [services, setServices] = useState("");
  const [pricing, setPricing] = useState("");

  const handleGenerate = async () => {
    if (!contact) return;
    setLoading(true);
    try {
      const recentMeetingNotes = meetings
        ?.filter((m) => m.outcome)
        .map((m) => `${m.title}: ${m.outcome}`)
        .join("\n");

      const result = await generateDraft({
        contactName: `${contact.firstName} ${contact.lastName}`,
        contactCompany: contact.company,
        contactIndustry: contact.industry,
        contactNotes: contact.notes,
        meetingNotes: meetingNotes || recentMeetingNotes || undefined,
        services: services || undefined,
        pricing: pricing || undefined,
        proposalTitle,
      });
      onGenerated(result);
    } catch (error) {
      console.error("AI proposal draft generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Proposal Draft Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="meetingNotes">Meeting Notes (optional)</Label>
          <Textarea
            id="meetingNotes"
            value={meetingNotes}
            onChange={(e) => setMeetingNotes(e.target.value)}
            placeholder="Paste relevant meeting notes or leave empty to use recorded meeting outcomes..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="services">Services / Solutions</Label>
            <Textarea
              id="services"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="List the services or solutions being proposed..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricing">Pricing Information</Label>
            <Textarea
              id="pricing"
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              placeholder="Pricing details, packages, or rates..."
              rows={3}
            />
          </div>
        </div>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !contact || !proposalTitle.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Proposal Draft...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Complete Proposal
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
