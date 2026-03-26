"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MeetingForm } from "@/components/meeting-form";

export default function NewMeetingPage() {
  return (
    <div className="space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/meetings" className="hover:text-foreground">Meetings</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">New Meeting</span>
      </nav>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Meeting</h1>
        <p className="text-muted-foreground">Schedule a new meeting</p>
      </div>
      <MeetingForm />
    </div>
  );
}