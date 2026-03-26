"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stageColors: Record<string, string> = {
  New: "bg-chart-1",
  Contacted: "bg-chart-5",
  Qualified: "bg-chart-3",
  ProposalSent: "bg-chart-4",
  Won: "bg-chart-2",
  Lost: "bg-destructive",
};

export function PipelineChart() {
  const pipeline = useQuery(api.dashboard.getPipelineBreakdown);

  if (!pipeline) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Pipeline</CardTitle></CardHeader>
        <CardContent><div className="h-48 animate-pulse bg-muted rounded" /></CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...pipeline.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pipeline.map((stage) => (
            <div key={stage.stage} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.stage}</span>
                <span className="text-muted-foreground">
                  {stage.count} ({stage.totalValue ? `$${stage.totalValue.toLocaleString()}` : "$0"})
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${stageColors[stage.stage] ?? "bg-primary"}`}
                  style={{ width: `${(stage.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}