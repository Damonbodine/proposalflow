"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function ProfileForm() {
  const { toast } = useToast();
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (currentUser && !initialized) {
    setName(currentUser.name ?? "");
    setPhone(currentUser.phone ?? "");
    setCompanyName(currentUser.companyName ?? "");
    setTitle(currentUser.title ?? "");
    setAvatarUrl(currentUser.avatarUrl ?? "");
    setInitialized(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        ...(phone && { phone: phone.trim() }),
        ...(companyName && { companyName: companyName.trim() }),
        ...(title && { title: title.trim() }),
        ...(avatarUrl && { avatarUrl: avatarUrl.trim() }),
      });
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={currentUser.email} disabled className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sales Manager" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <Input id="avatarUrl" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/photo.jpg" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </div>
    </form>
  );
}