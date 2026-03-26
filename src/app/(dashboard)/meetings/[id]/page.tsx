"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const meetingId = id as unknown as Id<"meetings">;
  const meeting = useQuery(api.meetings.get, { meetingId });

  if (!meeting) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/meetings" className="hover:text-foreground">Meetings</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{meeting.title}</span>
      </nav>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{meeting.title}</h1>
          <p className="text-muted-foreground">
            {format(new Date(meeting.startTime), "PPP 'at' p")}
          </p>
        </div>
        <Badge variant={meeting.status === "Completed" ? "default" : meeting.status === "Cancelled" ? "destructive" : "secondary"}>
          {meeting.status}
        </Badge>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Type</span>
              <p className="font-medium">{meeting.meetingType}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Start</span>
              <p className="font-medium">{format(new Date(meeting.startTime), "PPP 'at' p")}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">End</span>
              <p className="font-medium">{format(new Date(meeting.endTime), "PPP 'at' p")}</p>
            </div>
            {meeting.location && (
              <div>
                <span className="text-sm text-muted-foreground">Location</span>
                <p className="font-medium">{meeting.location}</p>
              </div>
            )}
            {meeting.description && (
              <div>
                <span className="text-sm text-muted-foreground">Description</span>
                <p className="font-medium">{meeting.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
        {meeting.outcome && (
          <Card>
            <CardHeader>
              <CardTitle>Outcome</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{meeting.outcome}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
