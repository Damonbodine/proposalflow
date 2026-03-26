"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export default function NewContactPage() {
  return (
    <div className="space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contacts" className="hover:text-foreground">Contacts</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">New Contact</span>
      </nav>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Contact</h1>
        <p className="text-muted-foreground">Add a new contact to your pipeline</p>
      </div>
      <ContactForm />
    </div>
  );
}