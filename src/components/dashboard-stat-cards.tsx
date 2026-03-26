"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, DollarSign, Calendar, UserPlus, FilePlus, CalendarPlus, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

const cardConfig = [
  {
    key: "contacts" as const,
    label: "Total Contacts",
    icon: Users,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderAccent: "border-t-blue-500",
  },
  {
    key: "proposals" as const,
    label: "Active Proposals",
    icon: FileText,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderAccent: "border-t-amber-500",
  },
  {
    key: "revenue" as const,
    label: "Pipeline Value",
    icon: DollarSign,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderAccent: "border-t-emerald-500",
  },
  {
    key: "meetings" as const,
    label: "Upcoming Meetings",
    icon: Calendar,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderAccent: "border-t-purple-500",
  },
];

const quickActions = [
  {
    label: "New Contact",
    href: "/contacts/new",
    icon: UserPlus,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    hoverColor: "hover:bg-blue-500/15",
  },
  {
    label: "New Proposal",
    href: "/proposals/new",
    icon: FilePlus,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    hoverColor: "hover:bg-amber-500/15",
  },
  {
    label: "Schedule Meeting",
    href: "/meetings/new",
    icon: CalendarPlus,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    hoverColor: "hover:bg-purple-500/15",
  },
];

export function DashboardStatCards() {
  const stats = useQuery(api.dashboard.getStats);

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse border-t-2 border-t-muted">
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded w-24 mb-3" />
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const values: Record<string, string | number> = {
    contacts: stats.totalContacts ?? 0,
    proposals: stats.activeProposals ?? 0,
    revenue: formatCurrency(stats.pipelineValue ?? 0),
    meetings: stats.upcomingMeetings ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardConfig.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} className={`border-t-2 ${card.borderAccent} transition-shadow hover:shadow-md`}>
              <CardContent className="pt-6 pb-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <p className="text-3xl font-bold tracking-tight">{values[card.key]}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Card className={`group cursor-pointer transition-all hover:shadow-md ${action.hoverColor} border-dashed`}>
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold">{action.label}</span>
                    <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
