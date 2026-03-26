"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone, Mail, FileText, Calendar, MessageSquare, Eye, Check, X, ArrowRightLeft,
} from "lucide-react";
import { timeAgo } from "@/lib/format";

const activityIcons: Record<string, React.ElementType> = {
  Note: MessageSquare,
  Call: Phone,
  Email: Mail,
  Meeting: Calendar,
  ProposalCreated: FileText,
  ProposalSent: FileText,
  ProposalViewed: Eye,
  ProposalAccepted: Check,
  ProposalDeclined: X,
  StatusChange: ArrowRightLeft,
};

export function ActivityFeed() {
  const activities = useQuery(api.dashboard.getRecentActivity, {});

  if (!activities) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent><div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No recent activity</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Activities will show up as you work with contacts and proposals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type] ?? MessageSquare;
              return (
                <div key={activity._id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{activity.title}</span>
                      <Badge variant="outline" className="text-xs shrink-0">{activity.type}</Badge>
                    </div>
                    {activity.details && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{activity.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1" title={new Date(activity.createdAt).toLocaleString()}>
                      {timeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}