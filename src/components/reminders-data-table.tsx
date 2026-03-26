"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Check, X, AlarmClock, Bell } from "lucide-react";
import { timeAgo } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { TableSkeleton } from "@/components/table-skeleton";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "default",
  Snoozed: "secondary",
  Completed: "outline",
  Dismissed: "destructive",
};

export function RemindersDataTable() {
  const reminders = useQuery(api.reminders.listMine, {});
  const snooze = useMutation(api.reminders.snooze);
  const dismiss = useMutation(api.reminders.dismiss);
  const complete = useMutation(api.reminders.complete);

  if (reminders === undefined) return <TableSkeleton rows={3} cols={4} />;
  if (reminders.length === 0)
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No reminders yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Reminders will appear here when you create them</p>
        </CardContent>
      </Card>
    );

  const isOverdue = (dueAt: number) => dueAt < Date.now();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reminders.map((reminder) => (
          <TableRow key={reminder._id} className={isOverdue(reminder.dueAt) && reminder.status === "Pending" ? "bg-destructive/5" : ""}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {reminder.title}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <span title={new Date(reminder.dueAt).toLocaleString()}>{timeAgo(reminder.dueAt)}</span>
              {isOverdue(reminder.dueAt) && reminder.status === "Pending" && (
                <span className="text-destructive ml-2 text-xs font-medium">Overdue</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[reminder.status] ?? "secondary"}>{reminder.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {(reminder.status === "Pending" || reminder.status === "Snoozed") && (
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Snooze 1 hour" onClick={() => snooze({ reminderId: reminder._id, snoozeMinutes: 60 })}>
                    <AlarmClock className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" title="Complete" onClick={() => complete({ reminderId: reminder._id })}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Dismiss" onClick={() => dismiss({ reminderId: reminder._id })}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}