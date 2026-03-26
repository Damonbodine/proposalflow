"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus, Eye, Pencil, Trash2, Send, FileText, CalendarClock, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/table-skeleton";

const statusStyles: Record<string, string> = {
  Draft: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  Sent: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Viewed: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Declined: "bg-red-500/10 text-red-700 dark:text-red-400",
  Expired: "bg-gray-400/10 text-gray-500 dark:text-gray-500",
  Revised: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
};

const statusOrder = ["Draft", "Sent", "Viewed", "Accepted"];

function StatusProgress({ status }: { status: string }) {
  const currentIndex = statusOrder.indexOf(status);
  if (currentIndex === -1) return null;

  return (
    <div className="flex items-center gap-0.5">
      {statusOrder.map((step, i) => (
        <div key={step} className="flex items-center">
          <div
            className={`h-1.5 w-5 rounded-full transition-colors ${
              i <= currentIndex
                ? status === "Accepted"
                  ? "bg-emerald-500"
                  : "bg-blue-500"
                : "bg-muted"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

function getUrgency(validUntil?: number): { label: string; className: string } | null {
  if (!validUntil) return null;
  const now = new Date();
  const expiry = new Date(validUntil);
  const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return { label: "Expired", className: "text-red-600 dark:text-red-400 font-semibold" };
  if (daysUntil <= 3) return { label: `${daysUntil}d left`, className: "text-red-600 dark:text-red-400 font-semibold" };
  if (daysUntil <= 7) return { label: `${daysUntil}d left`, className: "text-amber-600 dark:text-amber-400 font-medium" };
  return null;
}

interface ProposalsDataTableProps {
  statusFilter?: string;
}

export function ProposalsDataTable({ statusFilter }: ProposalsDataTableProps) {
  const proposals = useQuery(api.proposals.list, { status: statusFilter });
  const deleteProposal = useMutation(api.proposals.remove);
  const sendProposal = useMutation(api.proposals.send);
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<Id<"proposals"> | null>(null);

  if (proposals === undefined) return <TableSkeleton rows={5} cols={7} />;
  if (proposals.length === 0)
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No proposals found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Create your first proposal to start closing deals</p>
          <Button className="mt-4" onClick={() => router.push("/proposals/new")}>
            <Plus className="mr-2 h-4 w-4" /> Create Proposal
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              All Proposals
              <span className="ml-2 text-sm font-normal text-muted-foreground">({proposals.length})</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => {
                const urgency = getUrgency(proposal.validUntil);
                const amount = proposal.totalAmount ?? 0;
                const isHighValue = amount >= 10000;
                return (
                  <TableRow
                    key={proposal._id}
                    className="cursor-pointer group"
                    onClick={() => router.push(`/proposals/${proposal._id}`)}
                  >
                    <TableCell className="font-medium group-hover:text-primary transition-colors">
                      {proposal.title}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`tabular-nums ${isHighValue ? "text-lg font-bold" : "font-semibold"}`}>
                        {formatCurrency(amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[proposal.status] ?? "bg-secondary text-secondary-foreground"}`}>
                        {proposal.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusProgress status={proposal.status} />
                    </TableCell>
                    <TableCell>
                      {proposal.validUntil ? (
                        <div className="flex items-center gap-1.5">
                          {urgency && (urgency.label === "Expired" || urgency.label.includes("d left")) && (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          )}
                          <span className={urgency?.className ?? "text-muted-foreground"}>
                            {urgency?.label ?? new Date(proposal.validUntil).toLocaleDateString()}
                          </span>
                          {!urgency && (
                            <span className="text-muted-foreground text-xs">
                              ({new Date(proposal.validUntil).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">{"\u2014"}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        v{proposal.version ?? 1}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()} />}>
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); sendProposal({ proposalId: proposal._id }).then(() => toast.success("Proposal sent")); }}>
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
