"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function SettingsForm() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const settings = useQuery(api.userSettings.getMine);
  const updateProfile = useMutation(api.users.updateProfile);
  const updateSettings = useMutation(api.userSettings.update);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [proposalNotifications, setProposalNotifications] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [timezone, setTimezone] = useState("America/Chicago");

  useEffect(() => {
    if (settings) {
      setEmailNotifications(settings.emailNotifications ?? true);
      setProposalNotifications(settings.proposalNotifications ?? true);
      setMeetingReminders(settings.meetingReminders ?? true);
      setReminderMinutes(settings.reminderMinutesBefore ?? 15);
      setTimezone(settings.timezone ?? "America/Chicago");
    }
  }, [settings]);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateProfile({
        name: (fd.get("name") as string) || undefined,
        phone: (fd.get("phone") as string) || undefined,
        companyName: (fd.get("companyName") as string) || undefined,
        title: (fd.get("title") as string) || undefined,
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleSettingsSubmit = async () => {
    setIsSubmittingSettings(true);
    try {
      await updateSettings({
        emailNotifications,
        proposalNotifications,
        meetingReminders,
        reminderMinutesBefore: reminderMinutes,
        timezone,
      });
    } finally {
      setIsSubmittingSettings(false);
    }
  };

  if (!currentUser) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={currentUser.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={currentUser.email} disabled className="bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={currentUser.phone ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" name="title" defaultValue={currentUser.title ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input id="companyName" name="companyName" defaultValue={currentUser.companyName ?? ""} />
            </div>
            <Button type="submit" disabled={isSubmittingProfile}>
              {isSubmittingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email for important updates</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Proposal Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when proposals are viewed or responded to</p>
            </div>
            <Switch checked={proposalNotifications} onCheckedChange={setProposalNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Meeting Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded before scheduled meetings</p>
            </div>
            <Switch checked={meetingReminders} onCheckedChange={setMeetingReminders} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="reminderMinutes">Reminder Lead Time (minutes)</Label>
            <Input id="reminderMinutes" type="number" value={reminderMinutes} onChange={(e) => setReminderMinutes(parseInt(e.target.value) || 15)} className="w-32" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          </div>
          <Button onClick={handleSettingsSubmit} disabled={isSubmittingSettings}>
            {isSubmittingSettings ? "Saving..." : "Save Notification Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}