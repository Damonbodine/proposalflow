"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function SettingsForm() {
  const { toast } = useToast();
  const settings = useQuery(api.userSettings.getMine);
  const updateSettings = useMutation(api.userSettings.update);
  const templates = useQuery(api.proposalTemplates.list, {});

  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [proposalNotifications, setProposalNotifications] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState("15");
  const [defaultTemplateId, setDefaultTemplateId] = useState<string>("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      setEmailNotifications(settings.emailNotifications ?? true);
      setProposalNotifications(settings.proposalNotifications ?? true);
      setMeetingReminders(settings.meetingReminders ?? true);
      setReminderMinutesBefore((settings.reminderMinutesBefore ?? 15).toString());
      setDefaultTemplateId("defaultTemplateId" in settings ? (settings.defaultTemplateId ?? "") : "");
      setTimezone(settings.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({
        emailNotifications,
        proposalNotifications,
        meetingReminders,
        reminderMinutesBefore: parseFloat(reminderMinutesBefore) || 15,
        ...(defaultTemplateId && defaultTemplateId !== "__none" && { defaultTemplateId: defaultTemplateId as Id<"proposalTemplates"> }),
        timezone,
      });
      toast({ title: "Settings saved", description: "Your preferences have been updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="emailNotifications">Email Notifications</Label>
          <Switch id="emailNotifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="proposalNotifications">Proposal Notifications</Label>
          <Switch id="proposalNotifications" checked={proposalNotifications} onCheckedChange={setProposalNotifications} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="meetingReminders">Meeting Reminders</Label>
          <Switch id="meetingReminders" checked={meetingReminders} onCheckedChange={setMeetingReminders} />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reminderMinutesBefore">Reminder Lead Time (minutes)</Label>
            <Input id="reminderMinutesBefore" type="number" value={reminderMinutesBefore} onChange={(e) => setReminderMinutesBefore(e.target.value)} min="1" max="1440" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={(v) => setTimezone(v ?? "")}>
              <SelectTrigger id="timezone"><SelectValue placeholder="Select timezone" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="America/Anchorage">Alaska Time</SelectItem>
                <SelectItem value="Pacific/Honolulu">Hawaii Time</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultTemplateId">Default Proposal Template</Label>
            <Select value={defaultTemplateId} onValueChange={(v) => setDefaultTemplateId(v ?? "")}>
              <SelectTrigger id="defaultTemplateId"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                {templates?.map((t) => (
                  <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </form>
  );
}