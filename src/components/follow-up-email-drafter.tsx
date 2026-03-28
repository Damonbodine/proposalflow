"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Mail, Copy } from "lucide-react";
import { toast } from "sonner";

interface FollowUpEmailDrafterProps {
  proposalId: Id<"proposals">;
  proposalTitle: string;
  proposalStatus: string;
  contactId: Id<"contacts">;
  sentAt?: number;
}

export function FollowUpEmailDrafter({
  proposalId,
  proposalTitle,
  proposalStatus,
  contactId,
  sentAt,
}: FollowUpEmailDrafterProps) {
  const draftEmail = useAction(api.ai.draftFollowUpEmail);
  const contact = useQuery(api.contacts.get, { contactId });

  const [loading, setLoading] = useState(false);
  const [additionalContext, setAdditionalContext] = useState("");
  const [emailDraft, setEmailDraft] = useState<string | null>(null);

  const handleDraft = async () => {
    if (!contact) return;
    setLoading(true);
    try {
      const result = await draftEmail({
        proposalTitle,
        proposalStatus,
        contactName: `${contact.firstName} ${contact.lastName}`,
        contactEmail: contact.email,
        contactCompany: contact.company,
        lastContactDate: sentAt ? new Date(sentAt).toLocaleDateString() : undefined,
        relationshipStage: contact.status,
        additionalContext: additionalContext || undefined,
      });
      setEmailDraft(result);
    } catch (error) {
      console.error("Email draft generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!emailDraft) return;
    await navigator.clipboard.writeText(emailDraft);
    toast.success("Email copied to clipboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          AI Follow-Up Email Drafter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!emailDraft ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="additionalContext">Additional Context (optional)</Label>
              <Textarea
                id="additionalContext"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Any specific points to mention, upcoming deadlines, or special offers..."
                rows={3}
              />
            </div>
            <Button
              type="button"
              onClick={handleDraft}
              disabled={loading || !contact}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Drafting Email...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Draft Follow-Up Email
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono">
              {emailDraft}
            </div>
            <div className="flex gap-3">
              <Button type="button" size="sm" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEmailDraft(null)}
              >
                Draft Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
