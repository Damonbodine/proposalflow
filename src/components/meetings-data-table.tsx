"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus, Trash2, CheckCircle } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Scheduled: "default",
  Completed: "secondary",
  Cancelled: "destructive",
  NoShow: "outline",
};

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

  if (!meetings) return <div className="p-8 text-center text-muted-foreground">Loading meetings...</div>;
  if (meetings.length === 0)
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No meetings found</p>
        <Button className="mt-4" onClick={() => router.push("/meetings/new")}>
          <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
        </Button>
      </div>
    );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => (
            <TableRow key={meeting._id}>
              <TableCell className="font-medium">{meeting.title}</TableCell>
              <TableCell>
                <Badge variant="outline">{meeting.meetingType}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(meeting.startTime).toLocaleString()}
              </TableCell>
              <TableCell className="text-muted-foreground">{meeting.location ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[meeting.status] ?? "secondary"}>{meeting.status}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {meeting.status === "Scheduled" && (
                      <DropdownMenuItem onClick={() => completeMeeting({ meetingId: meeting._id })}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Complete
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setDeleteId(meeting._id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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