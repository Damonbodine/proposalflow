"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle, Clock, Users, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ExtractedData {
  discussionPoints: string[];
  decisions: string[];
  actionItems: { task: string; assignee: string; deadline: string }[];
  followUpTopics: string[];
}

interface MeetingNotesExtractorProps {
  meetingId: Id<"meetings">;
  meetingTitle: string;
}

export function MeetingNotesExtractor({ meetingId, meetingTitle }: MeetingNotesExtractorProps) {
  const extractActionItems = useAction(api.ai.extractMeetingActionItems);
  const updateMeeting = useMutation(api.meetings.update);

  const [loading, setLoading] = useState(false);
  const [rawNotes, setRawNotes] = useState("");
  const [attendees, setAttendees] = useState("");
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);

  const handleExtract = async () => {
    if (!rawNotes.trim()) return;
    setLoading(true);
    try {
      const result = await extractActionItems({
        rawNotes: rawNotes.trim(),
        meetingTitle,
        attendees: attendees || undefined,
      });

      const parsed = JSON.parse(result) as ExtractedData;
      setExtracted(parsed);
    } catch (error) {
      console.error("AI extraction failed:", error);
      toast.error("Failed to extract action items");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsOutcome = async () => {
    if (!extracted) return;
    const outcomeText = [
      "## Discussion Points",
      ...extracted.discussionPoints.map((p) => `- ${p}`),
      "",
      "## Decisions",
      ...extracted.decisions.map((d) => `- ${d}`),
      "",
      "## Action Items",
      ...extracted.actionItems.map(
        (a) => `- ${a.task} (Assignee: ${a.assignee}, Deadline: ${a.deadline})`
      ),
      "",
      "## Follow-Up Topics",
      ...extracted.followUpTopics.map((t) => `- ${t}`),
    ].join("\n");

    try {
      await updateMeeting({
        meetingId,
        outcome: outcomeText,
        status: "Completed",
      });
      toast.success("Meeting outcome saved");
    } catch {
      toast.error("Failed to save meeting outcome");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Meeting Notes Extractor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!extracted ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="attendees">Attendees (optional)</Label>
              <Input
                id="attendees"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="John, Sarah, Mike..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rawNotes">Paste Meeting Notes *</Label>
              <Textarea
                id="rawNotes"
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="Paste your raw meeting notes here... The AI will extract discussion points, decisions, action items, and follow-up topics."
                rows={8}
              />
            </div>
            <Button
              type="button"
              onClick={handleExtract}
              disabled={loading || !rawNotes.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting Action Items...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Extract Action Items
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {extracted.discussionPoints.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  Discussion Points
                </h4>
                <ul className="space-y-1">
                  {extracted.discussionPoints.map((point, i) => (
                    <li key={i} className="text-sm text-muted-foreground pl-6">• {point}</li>
                  ))}
                </ul>
              </div>
            )}

            {extracted.decisions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Decisions Made
                </h4>
                <ul className="space-y-1">
                  {extracted.decisions.map((decision, i) => (
                    <li key={i} className="text-sm text-muted-foreground pl-6">• {decision}</li>
                  ))}
                </ul>
              </div>
            )}

            {extracted.actionItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Action Items
                </h4>
                <div className="space-y-2">
                  {extracted.actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 pl-6 text-sm">
                      <span className="text-muted-foreground flex-1">• {item.task}</span>
                      <Badge variant="outline" className="shrink-0">{item.assignee}</Badge>
                      <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.deadline}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extracted.followUpTopics.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Follow-Up Topics</h4>
                <ul className="space-y-1">
                  {extracted.followUpTopics.map((topic, i) => (
                    <li key={i} className="text-sm text-muted-foreground pl-6">• {topic}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" onClick={handleSaveAsOutcome}>
                Save as Meeting Outcome
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setExtracted(null)}
              >
                Extract Again
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
