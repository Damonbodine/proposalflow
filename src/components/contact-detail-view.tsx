"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Pencil, Mail, Phone, Building2, Globe, MapPin,
  Calendar, FileText, StickyNote,
  MessageSquare, ArrowRightLeft, Eye, Check, X,
} from "lucide-react";
import { formatCurrency, getAvatarColor, timeAgo } from "@/lib/format";

const statusStyles: Record<string, string> = {
  New: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Contacted: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Qualified: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  ProposalSent: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  Won: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Lost: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const activityIcons: Record<string, React.ElementType> = {
  Note: StickyNote,
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

const activityColors: Record<string, string> = {
  Note: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  Call: "bg-green-500/10 text-green-600 dark:text-green-400",
  Email: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Meeting: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  ProposalCreated: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ProposalSent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  ProposalViewed: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  ProposalAccepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ProposalDeclined: "bg-red-500/10 text-red-600 dark:text-red-400",
  StatusChange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

interface ContactDetailViewProps {
  contactId: Id<"contacts">;
}

export function ContactDetailView({ contactId }: ContactDetailViewProps) {
  const contact = useQuery(api.contacts.get, { contactId });
  const activities = useQuery(api.activities.listByContact, { contactId });
  const router = useRouter();

  if (!contact) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const initials = `${contact.firstName?.[0] ?? ""}${contact.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            <Avatar className="h-16 w-16 ring-4 ring-background shadow-lg">
              <AvatarFallback className={`${getAvatarColor(`${contact.firstName} ${contact.lastName}`)} text-white text-xl font-bold`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{contact.firstName} {contact.lastName}</h1>
                  <p className="text-muted-foreground mt-0.5">
                    {contact.jobTitle && <span>{contact.jobTitle}</span>}
                    {contact.jobTitle && contact.company && <span> at </span>}
                    {contact.company && <span className="font-medium text-foreground">{contact.company}</span>}
                    {!contact.jobTitle && !contact.company && "No company"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[contact.status] ?? "bg-secondary text-secondary-foreground"}`}>
                    {contact.status}
                  </span>
                  <Button variant="outline" onClick={() => router.push(`/contacts/${contactId}/edit`)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => router.push(`/meetings/new?contactId=${contactId}`)}>
                  <Calendar className="mr-2 h-4 w-4" /> Schedule Meeting
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push(`/proposals/new?contactId=${contactId}`)}>
                  <FileText className="mr-2 h-4 w-4" /> Create Proposal
                </Button>
                <Button variant="outline" size="sm" onClick={() => { /* scroll to activity */ }}>
                  <StickyNote className="mr-2 h-4 w-4" /> Add Note
                </Button>
                {contact.email && (
                  <Button variant="outline" size="sm" render={<a href={`mailto:${contact.email}`} />}>
                    <Mail className="mr-2 h-4 w-4" /> Send Email
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Contact info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.email && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span>{contact.phone}</span>
              </div>
              {contact.company && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                    <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>{contact.company}</span>
                </div>
              )}
              {contact.website && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                    <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <a href={contact.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{contact.website}</a>
                </div>
              )}
              {contact.address && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span>{contact.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Source</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{contact.source}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Industry</span>
                <span>{contact.industry ?? "\u2014"}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Estimated Value</span>
                <span className={`font-semibold ${contact.estimatedValue && contact.estimatedValue >= 10000 ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                  {contact.estimatedValue ? formatCurrency(contact.estimatedValue) : "\u2014"}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Tags</span>
                <span>{contact.tags ?? "\u2014"}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {contact.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{contact.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Activity timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Activity Timeline
                <span className="ml-2 text-sm font-normal text-muted-foreground">({activities?.length ?? 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!activities || activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No activity yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Activities will appear here as you interact with this contact</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                  <div className="space-y-6">
                    {activities.map((activity) => {
                      const Icon = activityIcons[activity.type] ?? MessageSquare;
                      const colorClass = activityColors[activity.type] ?? "bg-gray-500/10 text-gray-600";
                      return (
                        <div key={activity._id} className="relative flex items-start gap-4 pl-0">
                          <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold">{activity.title}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{activity.type}</Badge>
                            </div>
                            {activity.details && (
                              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{activity.details}</p>
                            )}
                            <p className="text-xs text-muted-foreground/70 mt-1.5" title={new Date(activity.createdAt).toLocaleString()}>
                              {timeAgo(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
