"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ContactQuickAddFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ContactQuickAddForm({ onSuccess, onCancel }: ContactQuickAddFormProps) {
  const { toast } = useToast();
  const quickAdd = useMutation(api.contacts.quickAdd);

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      toast({ title: "Validation Error", description: "First name, last name, and phone are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await quickAdd({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        ...(email && { email: email.trim() }),
      });
      toast({ title: "Contact added", description: `${firstName} ${lastName} has been quick-added.` });
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add contact.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="qa-firstName">First Name *</Label>
          <Input id="qa-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qa-lastName">Last Name *</Label>
          <Input id="qa-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="qa-phone">Phone *</Label>
        <Input id="qa-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="qa-email">Email</Label>
        <Input id="qa-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
      </div>
      <div className="flex justify-end gap-3">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Quick Add
        </Button>
      </div>
    </form>
  );
}