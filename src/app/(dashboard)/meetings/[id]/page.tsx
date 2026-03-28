"use client";
export const dynamic = 'force-dynamic';

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { format } from "date-fns";
import { User, FileText, DollarSign, Building2 } from "lucide-react";
import { MeetingNotesExtractor } from "@/components/meeting-notes-extractor";

export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const meetingId = id as unknown as Id<"meetings">;
  const meeting = useQuery(api.meetings.get, { meetingId });
  const router = useRouter();

  if (!meeting) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Meetings", href: "/meetings" },
          { label: meeting.title },
        ]}
      />
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

        <div className="space-y-6">
          {/* Linked Contact Card */}
          {meeting.contactId && (
            <LinkedContactCard contactId={meeting.contactId} onClick={() => router.push(`/contacts/${meeting.contactId}`)} />
          )}

          {/* Linked Proposal Card */}
          {meeting.proposalId && (
            <LinkedProposalCard proposalId={meeting.proposalId} onClick={() => router.push(`/proposals/${meeting.proposalId}`)} />
          )}
        </div>
      </div>

      {meeting.outcome && (
        <Card>
          <CardHeader>
            <CardTitle>Outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{meeting.outcome}</div>
          </CardContent>
        </Card>
      )}

      {(meeting.status === "Scheduled" || meeting.status === "Completed") && (
        <MeetingNotesExtractor meetingId={meetingId} meetingTitle={meeting.title} />
      )}
    </div>
  );
}

function LinkedContactCard({ contactId, onClick }: { contactId: Id<"contacts">; onClick: () => void }) {
  const contact = useQuery(api.contacts.get, { contactId });

  if (!contact) return null;

  const initials = `${contact.firstName?.[0] ?? ""}${contact.lastName?.[0] ?? ""}`.toUpperCase();
  const statusStyles: Record<string, string> = {
    New: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Contacted: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    Qualified: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    ProposalSent: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    Won: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    Lost: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <User className="h-4 w-4" />
          Linked Contact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{contact.firstName} {contact.lastName}</p>
            {contact.company && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {contact.company}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[contact.status] ?? "bg-secondary text-secondary-foreground"}`}>
            {contact.status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function LinkedProposalCard({ proposalId, onClick }: { proposalId: Id<"proposals">; onClick: () => void }) {
  const proposal = useQuery(api.proposals.get, { proposalId });

  if (!proposal) return null;

  const statusStyles: Record<string, string> = {
    Draft: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    Sent: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Viewed: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    Accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    Declined: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Linked Proposal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-semibold truncate">{proposal.title}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${(proposal.totalAmount ?? 0).toLocaleString()}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${statusStyles[proposal.status] ?? "bg-secondary text-secondary-foreground"}`}>
            {proposal.status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
