"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, DollarSign, Calendar } from "lucide-react";

const iconMap = {
  contacts: Users,
  proposals: FileText,
  revenue: DollarSign,
  meetings: Calendar,
};

export function DashboardStatCards() {
  const stats = useQuery(api.dashboard.getStats);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total Contacts", value: stats.totalContacts ?? 0, icon: "contacts" as const },
    { label: "Active Proposals", value: stats.activeProposals ?? 0, icon: "proposals" as const },
    { label: "Pipeline Value", value: `$${(stats.pipelineValue ?? 0).toLocaleString()}`, icon: "revenue" as const },
    { label: "Upcoming Meetings", value: stats.upcomingMeetings ?? 0, icon: "meetings" as const },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = iconMap[card.icon];
        return (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <Icon className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}