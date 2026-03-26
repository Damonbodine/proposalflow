"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/format";

const stageColors: Record<string, string> = {
  New: "bg-blue-500",
  Contacted: "bg-amber-500",
  Qualified: "bg-purple-500",
  ProposalSent: "bg-indigo-500",
  Won: "bg-emerald-500",
  Lost: "bg-red-400",
};

const stageDotColors: Record<string, string> = {
  New: "bg-blue-500",
  Contacted: "bg-amber-500",
  Qualified: "bg-purple-500",
  ProposalSent: "bg-indigo-500",
  Won: "bg-emerald-500",
  Lost: "bg-red-400",
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
  const totalValue = pipeline.reduce((sum, s) => sum + (s.totalValue ?? 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Pipeline Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Total: <span className="font-semibold text-foreground">{formatCurrency(totalValue)}</span>
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pipeline.map((stage) => (
            <div key={stage.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${stageDotColors[stage.stage] ?? "bg-primary"}`} />
                  <span className="font-medium">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {stage.count}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(stage.totalValue ?? 0)}
                  </span>
                </div>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stageColors[stage.stage] ?? "bg-primary"}`}
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
