"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { Pencil, Send, FileText, DollarSign, Calendar, Download, Clock, History, Sparkles, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { ProposalStatusStepper } from "@/components/proposal-status-stepper";
import { toast } from "sonner";
import { useAction } from "convex/react";

interface ProposalDetailViewProps {
  proposalId: Id<"proposals">;
}

export function ProposalDetailView({ proposalId }: ProposalDetailViewProps) {
  const proposal = useQuery(api.proposals.get, { proposalId });
  const lineItems = useQuery(api.proposalLineItems.listByProposal, { proposalId });
  const sendProposal = useMutation(api.proposals.send);
  const updateProposal = useMutation(api.proposals.update);
  const generateAi = useAction(api.ai.generate);
  const router = useRouter();
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  if (!proposal) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Draft: "outline",
    Sent: "default",
    Viewed: "secondary",
    Accepted: "default",
    Declined: "destructive",
    Expired: "destructive",
    Revised: "outline",
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await sendProposal({ proposalId });
      toast.success("Proposal sent");
      setSendConfirmOpen(false);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const text = await generateAi({
        fieldName: "proposalSummary",
        context: {
          title: proposal.title,
          content: proposal.content,
          totalAmount: proposal.totalAmount,
          lineItems: lineItems ?? [],
        },
      });
      await updateProposal({ proposalId, summary: text });
      toast.success("Summary generated");
    } catch {
      toast.error("Failed to generate summary");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          {proposal.summary && <p className="text-muted-foreground mt-1">{proposal.summary}</p>}
        </div>
        <div className="flex items-center gap-3">
          {(proposal.status === "Draft" || proposal.status === "Revised") && (
            <Button variant="outline" size="sm" onClick={handleGenerateSummary} disabled={generatingSummary}>
              {generatingSummary ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Generate Summary</>
              )}
            </Button>
          )}
          <Badge variant={statusColors[proposal.status] ?? "secondary"}>{proposal.status}</Badge>
          <Button variant="outline" onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          {(proposal.status === "Draft" || proposal.status === "Revised") && (
            <>
              <Button variant="outline" onClick={() => router.push(`/proposals/${proposalId}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button onClick={() => setSendConfirmOpen(true)}>
                <Send className="mr-2 h-4 w-4" /> Send Proposal
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Stepper */}
      <ProposalStatusStepper status={proposal.status} />

      {/* Print-only header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{proposal.title}</h1>
        {proposal.summary && <p className="text-muted-foreground mt-1">{proposal.summary}</p>}
        <p className="text-sm text-muted-foreground mt-2">Status: {proposal.status}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold">{formatCurrency(proposal.totalAmount ?? 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Valid Until</p>
              <p className="text-xl font-bold">
                {proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString() : "Not set"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="text-xl font-bold">v{proposal.version ?? 1}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {proposal.content && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proposal Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {proposal.content}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Line Items</CardTitle>
          {(proposal.status === "Draft" || proposal.status === "Revised") && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/proposals/${proposalId}/edit`)} className="print:hidden">
              Edit Items
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!lineItems || lineItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No line items yet</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-3 text-right">Total</div>
              </div>
              {lineItems.map((item) => (
                <div key={item._id} className="grid grid-cols-12 gap-2 text-sm py-2 border-b border-border/50">
                  <div className="col-span-5">{item.description}</div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</div>
                  <div className="col-span-3 text-right font-medium">{formatCurrency(item.total)}</div>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="grid grid-cols-12 gap-2 text-sm font-bold">
                <div className="col-span-9 text-right">Total</div>
                <div className="col-span-3 text-right">{formatCurrency(proposal.totalAmount ?? 0)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version History (item 7) */}
      {(proposal.version ?? 1) > 1 && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                  v{proposal.version}
                </div>
                <div>
                  <p className="font-medium">Current Version</p>
                  <p className="text-muted-foreground text-xs">
                    Last updated {new Date(proposal.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {Array.from({ length: (proposal.version ?? 1) - 1 }, (_, i) => {
                const ver = (proposal.version ?? 1) - 1 - i;
                return (
                  <div key={ver} className="flex items-center gap-3 text-sm opacity-60">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-xs">
                      v{ver}
                    </div>
                    <div>
                      <p className="font-medium">Version {ver}</p>
                      <p className="text-muted-foreground text-xs">Previous revision</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground print:hidden">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Created {new Date(proposal.createdAt).toLocaleString()}
        </span>
        {proposal.sentAt && (
          <span className="flex items-center gap-1">
            <Send className="h-3 w-3" />
            Sent {new Date(proposal.sentAt).toLocaleString()}
          </span>
        )}
        {proposal.viewedAt && (
          <span>Viewed {new Date(proposal.viewedAt).toLocaleString()}</span>
        )}
      </div>

      {/* Send confirmation dialog (item 3) */}
      <AlertDialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send this proposal? The status will be changed to &quot;Sent&quot; and the proposal can no longer be edited.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={sending}>
              {sending ? "Sending..." : "Confirm Send"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
