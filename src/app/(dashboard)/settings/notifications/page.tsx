"use client";
export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground">Configure how you receive notifications</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose which email notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="proposal-viewed">Proposal viewed</Label>
            <Switch id="proposal-viewed" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="proposal-accepted">Proposal accepted/rejected</Label>
            <Switch id="proposal-accepted" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="meeting-reminder">Meeting reminders</Label>
            <Switch id="meeting-reminder" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="follow-up-due">Follow-up reminders</Label>
            <Switch id="follow-up-due" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}