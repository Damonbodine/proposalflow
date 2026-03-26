"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus, Trash2, CheckCircle, Calendar as CalendarIcon, Clock, Video, Phone, Handshake, MessageCircle } from "lucide-react";
import { TableSkeleton } from "@/components/table-skeleton";

const statusStyles: Record<string, string> = {
  Scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
  NoShow: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

const typeStyles: Record<string, { bg: string; icon: React.ElementType }> = {
  Discovery: { bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: MessageCircle },
  Demo: { bg: "bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: Video },
  "Follow-up": { bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400", icon: Phone },
  Negotiation: { bg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400", icon: Handshake },
  Other: { bg: "bg-gray-500/10 text-gray-700 dark:text-gray-400", icon: MessageCircle },
};

function getTimeCategory(dateStr: number): "today" | "upcoming" | "past" {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const meetingDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (meetingDay.getTime() === today.getTime()) return "today";
  if (meetingDay > today) return "upcoming";
  return "past";
}

interface MeetingsDataTableProps {
  statusFilter?: string;
  typeFilter?: string;
}

export function MeetingsDataTable({ statusFilter, typeFilter }: MeetingsDataTableProps) {
  const meetings = useQuery(api.meetings.list, {
    status: statusFilter,
    meetingType: typeFilter,
  });
  const deleteMeeting = useMutation(api.meetings.remove);
  const completeMeeting = useMutation(api.meetings.complete);
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<Id<"meetings"> | null>(null);

  if (meetings === undefined) return <TableSkeleton rows={5} cols={5} />;
  if (meetings.length === 0)
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <CalendarIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No meetings found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Schedule your first meeting to get started</p>
          <Button className="mt-4" onClick={() => router.push("/meetings/new")}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              All Meetings
              <span className="ml-2 text-sm font-normal text-muted-foreground">({meetings.length})</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => {
                const timeCategory = getTimeCategory(meeting.startTime);
                const typeConfig = typeStyles[meeting.meetingType] ?? typeStyles.Other;
                const TypeIcon = typeConfig.icon;
                return (
                  <TableRow
                    key={meeting._id}
                    className={`cursor-pointer group hover:bg-muted/50 ${timeCategory === "today" ? "bg-blue-500/5" : timeCategory === "past" ? "opacity-60" : ""}`}
                    onClick={() => router.push(`/meetings/${meeting._id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{meeting.title}</span>
                        {timeCategory === "today" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Today</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeConfig.bg}`}>
                        <TypeIcon className="h-3 w-3" />
                        {meeting.meetingType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{new Date(meeting.startTime).toLocaleDateString()}</span>
                        <Clock className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                        <span className="text-muted-foreground">{new Date(meeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{meeting.location ?? "\u2014"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[meeting.status] ?? "bg-secondary text-secondary-foreground"}`}>
                        {meeting.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()} />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {meeting.status === "Scheduled" && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); completeMeeting({ meetingId: meeting._id }); }}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Mark Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteId(meeting._id); }} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (deleteId) { await deleteMeeting({ meetingId: deleteId }); setDeleteId(null); } }} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
