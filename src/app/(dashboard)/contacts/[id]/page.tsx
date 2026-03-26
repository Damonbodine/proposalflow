"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ContactDetailView } from "@/components/contact-detail-view";
import { Id } from "@convex/_generated/dataModel";

export default function ContactDetailPage({
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
        <span className="text-foreground">Details</span>
      </nav>
      <ContactDetailView contactId={contactId} />
    </div>
  );
}