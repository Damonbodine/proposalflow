"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Check, X, AlarmClock } from "lucide-react";

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

  if (!reminders) return <div className="p-8 text-center text-muted-foreground">Loading reminders...</div>;
  if (reminders.length === 0)
    return <div className="p-8 text-center text-muted-foreground">No reminders</div>;

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
              {new Date(reminder.dueAt).toLocaleString()}
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