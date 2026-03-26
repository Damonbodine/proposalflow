"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Eye, Pencil, Trash2, Users, ChevronLeft, ChevronRight, AlertTriangle, X } from "lucide-react";
import { TableSkeleton } from "@/components/table-skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency, getAvatarColor } from "@/lib/format";

const statusStyles: Record<string, string> = {
  New: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Contacted: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Qualified: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  ProposalSent: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  Won: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Lost: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const STATUSES = ["New", "Contacted", "Qualified", "ProposalSent", "Won", "Lost"] as const;

interface ContactsDataTableProps {
  statusFilter?: string;
  sourceFilter?: string;
  searchQuery?: string;
}

export function ContactsDataTable({ statusFilter, sourceFilter, searchQuery }: ContactsDataTableProps) {
  const contacts = useQuery(api.contacts.list, {
    status: statusFilter,
    source: sourceFilter,
    search: searchQuery,
  });
  const deleteContact = useMutation(api.contacts.remove);
  const updateContact = useMutation(api.contacts.update);
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<Id<"contacts"> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<Id<"contacts">>>(new Set());
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Dedup detection (item 8)
  const duplicates = useMemo(() => {
    if (!contacts || contacts.length === 0) return [];
    const emailMap = new Map<string, string[]>();
    const phoneMap = new Map<string, string[]>();
    for (const c of contacts) {
      if (c.email) {
        const key = c.email.toLowerCase();
        if (!emailMap.has(key)) emailMap.set(key, []);
        emailMap.get(key)!.push(c._id);
      }
      if (c.phone) {
        const normalized = c.phone.replace(/\D/g, "");
        if (normalized.length >= 7) {
          if (!phoneMap.has(normalized)) phoneMap.set(normalized, []);
          phoneMap.get(normalized)!.push(c._id);
        }
      }
    }
    const dupes = new Set<string>();
    for (const group of emailMap.values()) {
      if (group.length > 1) group.forEach((id) => dupes.add(id));
    }
    for (const group of phoneMap.values()) {
      if (group.length > 1) group.forEach((id) => dupes.add(id));
    }
    return Array.from(dupes);
  }, [contacts]);

  if (contacts === undefined) return <TableSkeleton rows={5} cols={7} />;
  if (contacts.length === 0)
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No contacts found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Get started by adding your first contact</p>
          <Button className="mt-4" onClick={() => router.push("/contacts/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Contact
          </Button>
        </CardContent>
      </Card>
    );

  const handleDelete = async () => {
    if (deleteId) {
      await deleteContact({ contactId: deleteId });
      setDeleteId(null);
    }
  };

  const allSelected = contacts.length > 0 && selectedIds.size === contacts.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < contacts.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map((c) => c._id)));
    }
  };

  const toggleOne = (id: Id<"contacts">) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    const ids = Array.from(selectedIds);
    await Promise.all(
      ids.map((id) =>
        updateContact({
          contactId: id,
          status: newStatus as (typeof STATUSES)[number],
        })
      )
    );
    setSelectedIds(new Set());
    setBulkStatusOpen(false);
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => deleteContact({ contactId: id })));
    setSelectedIds(new Set());
    setBulkDeleting(false);
  };

  return (
    <>
      {/* Dedup warning (item 8) */}
      {duplicates.length > 0 && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span className="text-amber-700 dark:text-amber-400 font-medium">
            {Math.floor(duplicates.length / 2)} potential duplicate{Math.floor(duplicates.length / 2) !== 1 ? "s" : ""} found
          </span>
          <span className="text-amber-600/70 dark:text-amber-400/70">
            — contacts sharing the same email or phone number
          </span>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              All Contacts
              <span className="ml-2 text-sm font-normal text-muted-foreground">({contacts.length})</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px]">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Est. Value</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.slice(page * pageSize, (page + 1) * pageSize).map((contact) => {
                const fullName = `${contact.firstName} ${contact.lastName}`;
                const initials = `${contact.firstName?.[0] ?? ""}${contact.lastName?.[0] ?? ""}`.toUpperCase();
                const estimatedValue = contact.estimatedValue;
                const isHighValue = estimatedValue && estimatedValue >= 10000;
                const isSelected = selectedIds.has(contact._id);
                const isDupe = duplicates.includes(contact._id);
                return (
                  <TableRow
                    key={contact._id}
                    className={`cursor-pointer group ${isSelected ? "bg-primary/5" : ""} ${isDupe ? "ring-1 ring-inset ring-amber-400/30" : ""}`}
                    onClick={() => router.push(`/contacts/${contact._id}`)}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => { e.stopPropagation(); toggleOne(contact._id); }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`${getAvatarColor(fullName)} text-white text-xs font-semibold`}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium group-hover:text-primary transition-colors">{fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{contact.company ?? "\u2014"}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.email ?? "\u2014"}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.phone}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[contact.status] ?? "bg-secondary text-secondary-foreground"}`}>
                        {contact.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{contact.source}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {estimatedValue ? (
                        <span className={`font-semibold tabular-nums ${isHighValue ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                          {formatCurrency(estimatedValue)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">\u2014</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()} />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/contacts/${contact._id}`); }}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/contacts/${contact._id}/edit`); }}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); setDeleteId(contact._id); }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {/* Pagination */}
          {contacts.length > pageSize && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {Math.ceil(contacts.length / pageSize)}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(Math.ceil(contacts.length / pageSize) - 1, p + 1))}
                  disabled={(page + 1) * pageSize >= contacts.length}
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk action bar (item 9) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-border shadow-xl rounded-xl px-5 py-3">
          <span className="text-sm font-semibold">{selectedIds.size} selected</span>
          <div className="h-5 w-px bg-border" />
          <DropdownMenu open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              Change Status
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATUSES.map((status) => (
                <DropdownMenuItem key={status} onClick={() => handleBulkStatusChange(status)}>
                  <span className={`inline-block h-2 w-2 rounded-full mr-2 ${statusStyles[status]?.split(" ")[0] ?? "bg-muted"}`} />
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkDeleting}>
            {bulkDeleting ? "Deleting..." : "Delete"}
          </Button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-muted-foreground hover:text-foreground ml-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
