"use client";

import { use } from "react";
import { ContactForm } from "@/components/contact-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
      <Breadcrumbs
        items={[
          { label: "Contacts", href: "/contacts" },
          { label: "Details", href: `/contacts/${id}` },
          { label: "Edit" },
        ]}
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Contact</h1>
        <p className="text-muted-foreground">Update contact information</p>
      </div>
      <ContactForm contactId={contactId} />
    </div>
  );
}
