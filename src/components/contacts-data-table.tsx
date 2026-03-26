"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Eye, Pencil, Trash2 } from "lucide-react";
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

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  New: "outline",
  Contacted: "secondary",
  Qualified: "default",
  ProposalSent: "default",
  Won: "default",
  Lost: "destructive",
};

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
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<Id<"contacts"> | null>(null);

  if (!contacts) return <div className="p-8 text-center text-muted-foreground">Loading contacts...</div>;
  if (contacts.length === 0)
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No contacts found</p>
        <Button className="mt-4" onClick={() => router.push("/contacts/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Contact
        </Button>
      </div>
    );

  const handleDelete = async () => {
    if (deleteId) {
      await deleteContact({ contactId: deleteId });
      setDeleteId(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Est. Value</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow
              key={contact._id}
              className="cursor-pointer"
              onClick={() => router.push(`/contacts/${contact._id}`)}
            >
              <TableCell className="font-medium">
                {contact.firstName} {contact.lastName}
              </TableCell>
              <TableCell className="text-muted-foreground">{contact.company ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{contact.email ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{contact.phone}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[contact.status] ?? "secondary"}>
                  {contact.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{contact.source}</TableCell>
              <TableCell className="text-muted-foreground">
                {contact.estimatedValue ? `$${contact.estimatedValue.toLocaleString()}` : "—"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()} />}>
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
          ))}
        </TableBody>
      </Table>

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