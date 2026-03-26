"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarColor, formatCurrency } from "@/lib/format";

const STATUSES = ["New", "Contacted", "Qualified", "ProposalSent", "Won", "Lost"] as const;
type ContactStatus = (typeof STATUSES)[number];

const statusColors: Record<string, string> = {
  New: "bg-blue-500",
  Contacted: "bg-amber-500",
  Qualified: "bg-purple-500",
  ProposalSent: "bg-indigo-500",
  Won: "bg-emerald-500",
  Lost: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  New: "New",
  Contacted: "Contacted",
  Qualified: "Qualified",
  ProposalSent: "Proposal Sent",
  Won: "Won",
  Lost: "Lost",
};

interface PipelineBoardProps {
  statusFilter?: string;
  sourceFilter?: string;
  searchQuery?: string;
}

export function PipelineBoard({ statusFilter, sourceFilter, searchQuery }: PipelineBoardProps) {
  const contacts = useQuery(api.contacts.list, {
    status: statusFilter,
    source: sourceFilter,
    search: searchQuery,
  });
  const updateContact = useMutation(api.contacts.update);
  const router = useRouter();
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  if (!contacts) return <div className="p-8 text-center text-muted-foreground">Loading pipeline...</div>;

  const columns: Record<string, typeof contacts> = {};
  for (const status of STATUSES) {
    columns[status] = [];
  }
  for (const contact of contacts) {
    if (columns[contact.status]) {
      columns[contact.status].push(contact);
    }
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>, contactId: string) => {
    e.dataTransfer.setData("text/plain", contactId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const contactId = e.dataTransfer.getData("text/plain") as Id<"contacts">;
    if (!contactId) return;
    const contact = contacts.find((c) => c._id === contactId);
    if (contact && contact.status !== newStatus) {
      await updateContact({
        contactId: contactId,
        status: newStatus as ContactStatus,
      });
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STATUSES.map((status) => {
        const columnContacts = columns[status];
        const isOver = dragOverColumn === status;
        return (
          <div
            key={status}
            className={`flex-shrink-0 w-64 rounded-xl border transition-colors ${
              isOver ? "border-primary bg-primary/5" : "border-border bg-muted/30"
            }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="p-3 flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${statusColors[status]}`} />
              <span className="text-sm font-semibold">{statusLabels[status]}</span>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {columnContacts.length}
              </span>
            </div>
            <div className="p-2 space-y-2 min-h-[100px]">
              {columnContacts.map((contact) => {
                const fullName = `${contact.firstName} ${contact.lastName}`;
                const initials = `${contact.firstName?.[0] ?? ""}${contact.lastName?.[0] ?? ""}`.toUpperCase();
                return (
                  <div
                    key={contact._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, contact._id)}
                    onClick={() => router.push(`/contacts/${contact._id}`)}
                    className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={`${getAvatarColor(fullName)} text-white text-[10px] font-semibold`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">{fullName}</span>
                    </div>
                    {contact.company && (
                      <p className="text-xs text-muted-foreground truncate">{contact.company}</p>
                    )}
                    {contact.estimatedValue && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        {formatCurrency(contact.estimatedValue)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
