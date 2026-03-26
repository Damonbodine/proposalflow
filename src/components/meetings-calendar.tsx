"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const typeColors: Record<string, string> = {
  Discovery: "bg-blue-500/80 text-white",
  Presentation: "bg-purple-500/80 text-white",
  FollowUp: "bg-amber-500/80 text-white",
  Negotiation: "bg-indigo-500/80 text-white",
  Closing: "bg-emerald-500/80 text-white",
  Other: "bg-gray-500/80 text-white",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MeetingsCalendarProps {
  statusFilter?: string;
  typeFilter?: string;
}

export function MeetingsCalendar({ statusFilter, typeFilter }: MeetingsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  const meetings = useQuery(api.meetings.list, {
    status: statusFilter,
    meetingType: typeFilter,
  });

  if (!meetings) return <div className="p-8 text-center text-muted-foreground">Loading calendar...</div>;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const goToToday = () => setCurrentDate(new Date());

  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate);
    if (view === "month") {
      d.setMonth(d.getMonth() + dir);
    } else {
      d.setDate(d.getDate() + dir * 7);
    }
    setCurrentDate(d);
  };

  // Build month grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOfGrid = new Date(firstDay);
  startOfGrid.setDate(startOfGrid.getDate() - startOfGrid.getDay());
  const endOfGrid = new Date(lastDay);
  endOfGrid.setDate(endOfGrid.getDate() + (6 - endOfGrid.getDay()));

  // Build week grid
  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getMeetingsForDay = (date: Date) => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dayEnd = dayStart + 86400000;
    return meetings.filter((m) => m.startTime >= dayStart && m.startTime < dayEnd);
  };

  const today = new Date();
  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const monthDays: Date[] = [];
  if (view === "month") {
    const cursor = new Date(startOfGrid);
    while (cursor <= endOfGrid) {
      monthDays.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const days = view === "month" ? monthDays : weekDays;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold">
              {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={goToToday}>
                Today
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                view === "week" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                view === "month" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {DAY_NAMES.map((day) => (
            <div key={day} className="bg-muted/50 px-2 py-2 text-center text-xs font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
          {days.map((day, i) => {
            const dayMeetings = getMeetingsForDay(day);
            const isCurrentMonth = day.getMonth() === month;
            return (
              <div
                key={i}
                className={`bg-card ${view === "month" ? "min-h-[100px]" : "min-h-[200px]"} p-1.5 ${
                  !isCurrentMonth && view === "month" ? "opacity-40" : ""
                }`}
              >
                <div
                  className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday(day)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayMeetings.slice(0, view === "month" ? 3 : 10).map((meeting) => (
                    <div
                      key={meeting._id}
                      className={`text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${
                        typeColors[meeting.meetingType] ?? typeColors.Other
                      }`}
                      title={`${meeting.title} - ${new Date(meeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    >
                      {new Date(meeting.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}{" "}
                      {meeting.title}
                    </div>
                  ))}
                  {dayMeetings.length > (view === "month" ? 3 : 10) && (
                    <div className="text-[10px] text-muted-foreground px-1.5">
                      +{dayMeetings.length - (view === "month" ? 3 : 10)} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
