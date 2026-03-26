"use client";

import { SettingsForm } from "@/components/settings-form";

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account and default preferences</p>
      </div>
      <SettingsForm />
    </div>
  );
}