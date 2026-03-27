"use client";
export const dynamic = 'force-dynamic';

import { use } from "react";
import { ContactDetailView } from "@/components/contact-detail-view";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
      <Breadcrumbs
        items={[
          { label: "Contacts", href: "/contacts" },
          { label: "Details" },
        ]}
      />
      <ContactDetailView contactId={contactId} />
    </div>
  );
}
