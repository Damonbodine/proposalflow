"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus, Eye, Pencil, Trash2, Send } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Draft: "outline",
  Sent: "default",
  Viewed: "secondary",
  Accepted: "default",
  Declined: "destructive",
  Expired: "destructive",
  Revised: "outline",
};

interface ProposalsDataTableProps {
  statusFilter?: string;
}

export function ProposalsDataTable({ statusFilter }: ProposalsDataTableProps) {
  const proposals = useQuery(api.proposals.list, { status: statusFilter });
  const deleteProposal = useMutation(api.proposals.remove);
  const sendProposal = useMutation(api.proposals.send);
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<Id<"proposals"> | null>(null);

  if (!proposals) return <div className="p-8 text-center text-muted-foreground">Loading proposals...</div>;
  if (proposals.length === 0)
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No proposals found</p>
        <Button className="mt-4" onClick={() => router.push("/proposals/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create Proposal
        </Button>
      </div>
    );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow
              key={proposal._id}
              className="cursor-pointer"
              onClick={() => router.push(`/proposals/${proposal._id}`)}
            >
              <TableCell className="font-medium">{proposal.title}</TableCell>
              <TableCell className="font-medium">
                ${proposal.totalAmount?.toLocaleString() ?? "0"}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[proposal.status] ?? "secondary"}>
                  {proposal.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString() : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">v{proposal.version ?? 1}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(proposal.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()} />}>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/proposals/${proposal._id}`); }}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/proposals/${proposal._id}/edit`); }}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    {proposal.status === "Draft" && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); sendProposal({ proposalId: proposal._id }); }}>
                        <Send className="mr-2 h-4 w-4" /> Send
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteId(proposal._id); }} className="text-destructive">
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
            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this proposal and all line items.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (deleteId) { await deleteProposal({ proposalId: deleteId }); setDeleteId(null); } }} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}