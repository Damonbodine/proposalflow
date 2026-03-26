"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users, FileText, DollarSign, Calendar, TrendingUp,
  Plus, ArrowRight, Clock, CheckCircle2, Send,
  Eye, UserPlus, Zap, BarChart3
} from "lucide-react";

const pipelineColors: Record<string, { bg: string; text: string; bar: string }> = {
  New: { bg: "bg-sky-500/10", text: "text-sky-600", bar: "bg-sky-500" },
  Contacted: { bg: "bg-amber-500/10", text: "text-amber-600", bar: "bg-amber-500" },
  Qualified: { bg: "bg-violet-500/10", text: "text-violet-600", bar: "bg-violet-500" },
  ProposalSent: { bg: "bg-blue-500/10", text: "text-blue-600", bar: "bg-blue-500" },
  Won: { bg: "bg-emerald-500/10", text: "text-emerald-600", bar: "bg-emerald-500" },
  Lost: { bg: "bg-red-500/10", text: "text-red-500", bar: "bg-red-400" },
};

const proposalStatusIcons: Record<string, typeof FileText> = {
  Draft: FileText,
  Sent: Send,
  Viewed: Eye,
  Accepted: CheckCircle2,
};

export default function DashboardPage() {
  const stats = useQuery(api.dashboard.getStats, {});
  const pipeline = useQuery(api.dashboard.getPipelineBreakdown, {});
  const activity = useQuery(api.dashboard.getRecentActivity, { limit: 8 });

  const statCards = [
    {
      label: "Total Contacts",
      value: stats?.totalContacts ?? 0,
      icon: Users,
      color: "from-sky-500 to-blue-600",
      bgColor: "bg-sky-500/10",
      iconColor: "text-sky-600",
    },
    {
      label: "Pipeline Value",
      value: `$${((stats?.pipelineValue ?? 0) / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      label: "Active Proposals",
      value: stats?.activeProposals ?? 0,
      icon: FileText,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
    {
      label: "This Week",
      value: stats?.upcomingMeetings ?? 0,
      sublabel: "meetings",
      icon: Calendar,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
  ];

  const maxPipeline = Math.max(...(pipeline ?? []).map((p: any) => p.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-[var(--font-display)] font-extrabold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Your sales pipeline at a glance</p>
        </div>
        <div className="flex gap-2">
          <Link href="/contacts/new">
            <Button variant="outline" size="sm" className="gap-1.5">
              <UserPlus className="h-4 w-4" /> New Contact
            </Button>
          </Link>
          <Link href="/proposals/new">
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-500/20">
              <Zap className="h-4 w-4" /> New Proposal
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card
            key={card.label}
            className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 group"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />
            <CardContent className="pt-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-bold tracking-tight">{card.value}</span>
                    {card.sublabel && (
                      <span className="text-sm text-muted-foreground">{card.sublabel}</span>
                    )}
                  </div>
                </div>
                <div className={`${card.bgColor} p-2.5 rounded-xl`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline + Activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Pipeline Funnel */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Pipeline
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">
                {(pipeline ?? []).reduce((sum: number, p: any) => sum + p.count, 0)} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(pipeline ?? []).map((stage: any, i: number) => {
              const colors = pipelineColors[stage.stage] ?? pipelineColors.New;
              const width = Math.max((stage.count / maxPipeline) * 100, 8);
              return (
                <div key={stage.stage} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${colors.bar}`} />
                      <span className="text-sm font-medium">{stage.stage.replace(/([A-Z])/g, " $1").trim()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {stage.value > 0 && (
                        <span className="text-xs text-muted-foreground font-mono">
                          ${(stage.value / 1000).toFixed(0)}k
                        </span>
                      )}
                      <span className={`text-sm font-bold ${colors.text}`}>{stage.count}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
                      style={{ width: `${width}%`, transitionDelay: `${i * 100}ms` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!pipeline || pipeline.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Add contacts to see your pipeline</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {(activity ?? []).slice(0, 8).map((item: any, i: number) => (
                <div
                  key={item._id ?? i}
                  className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0 group"
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                    item.type === "ProposalCreated" ? "bg-violet-500/10 text-violet-600" :
                    item.type === "ProposalSent" ? "bg-blue-500/10 text-blue-600" :
                    item.type === "Meeting" ? "bg-amber-500/10 text-amber-600" :
                    item.type === "StatusChange" ? "bg-emerald-500/10 text-emerald-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {item.type === "ProposalCreated" ? <FileText className="h-3.5 w-3.5" /> :
                     item.type === "ProposalSent" ? <Send className="h-3.5 w-3.5" /> :
                     item.type === "Meeting" ? <Calendar className="h-3.5 w-3.5" /> :
                     <TrendingUp className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
              {(!activity || activity.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/contacts/new" className="group">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-600 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />
            <CardContent className="pt-6 pb-5 relative">
              <div className="flex items-center gap-4">
                <div className="bg-sky-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <UserPlus className="h-6 w-6 text-sky-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Add Contact</p>
                  <p className="text-sm text-muted-foreground">Capture a new lead</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/proposals/new" className="group">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />
            <CardContent className="pt-6 pb-5 relative">
              <div className="flex items-center gap-4">
                <div className="bg-violet-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-violet-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Create Proposal</p>
                  <p className="text-sm text-muted-foreground">Generate from template</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/meetings/new" className="group">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />
            <CardContent className="pt-6 pb-5 relative">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Schedule Meeting</p>
                  <p className="text-sm text-muted-foreground">Book a call or visit</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
