"use client";

import { DashboardStatCards } from "@/components/dashboard-stat-cards";
import { PipelineChart } from "@/components/pipeline-chart";
import { ActivityFeed } from "@/components/activity-feed";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your sales pipeline at a glance</p>
      </div>
      <DashboardStatCards />
      <div className="grid gap-6 md:grid-cols-2">
        <PipelineChart />
        <ActivityFeed />
      </div>
    </div>
  );
}