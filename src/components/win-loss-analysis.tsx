"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface WinLossAnalysisProps {
  proposalId: Id<"proposals">;
  proposalTitle: string;
  proposalContent: string;
  proposalAmount?: number;
  proposalStatus: string;
  contactId: Id<"contacts">;
}

export function WinLossAnalysis({
  proposalId,
  proposalTitle,
  proposalContent,
  proposalAmount,
  proposalStatus,
  contactId,
}: WinLossAnalysisProps) {
  const analyzeWinLoss = useAction(api.ai.analyzeWinLoss);
  const contact = useQuery(api.contacts.get, { contactId });

  const [loading, setLoading] = useState(false);
  const [competitionContext, setCompetitionContext] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);

  const isWon = proposalStatus === "Accepted";
  const outcome = isWon ? "Won" : "Lost";

  const handleAnalyze = async () => {
    if (!contact) return;
    setLoading(true);
    try {
      const result = await analyzeWinLoss({
        proposalTitle,
        proposalContent,
        proposalAmount,
        outcome,
        contactName: `${contact.firstName} ${contact.lastName}`,
        contactCompany: contact.company,
        contactIndustry: contact.industry,
        contactNotes: contact.notes,
        competitionContext: competitionContext || undefined,
      });
      setAnalysis(result);
    } catch (error) {
      console.error("Win/loss analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (proposalStatus !== "Accepted" && proposalStatus !== "Declined") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {isWon ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          AI {outcome === "Won" ? "Win" : "Loss"} Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="competitionContext">Competition Context (optional)</Label>
              <Textarea
                id="competitionContext"
                value={competitionContext}
                onChange={(e) => setCompetitionContext(e.target.value)}
                placeholder="Any known competitors, alternative solutions the client considered, or market context..."
                rows={3}
              />
            </div>
            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !contact}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {outcome === "Won" ? "Win" : "Loss"} Analysis
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {analysis}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAnalysis(null)}
            >
              Analyze Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
