"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Id } from "@convex/_generated/dataModel";

export default function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contactId = id as unknown as Id<"contacts">;

  return (
    <div className="space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contacts" className="hover:text-foreground">Contacts</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/contacts/${id}`} className="hover:text-foreground">Details</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Edit</span>
      </nav>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Contact</h1>
        <p className="text-muted-foreground">Update contact information</p>
      </div>
      <ContactForm contactId={contactId} />
    </div>
  );
}