"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, Send, FileText, DollarSign, Calendar } from "lucide-react";

interface ProposalDetailViewProps {
  proposalId: Id<"proposals">;
}

export function ProposalDetailView({ proposalId }: ProposalDetailViewProps) {
  const proposal = useQuery(api.proposals.get, { proposalId });
  const lineItems = useQuery(api.proposalLineItems.listByProposal, { proposalId });
  const sendProposal = useMutation(api.proposals.send);
  const router = useRouter();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          {proposal.summary && <p className="text-muted-foreground mt-1">{proposal.summary}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusColors[proposal.status] ?? "secondary"}>{proposal.status}</Badge>
          {proposal.status === "Draft" && (
            <>
              <Button variant="outline" onClick={() => router.push(`/proposals/${proposalId}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button onClick={() => sendProposal({ proposalId })}>
                <Send className="mr-2 h-4 w-4" /> Send Proposal
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold">${proposal.totalAmount?.toLocaleString() ?? "0"}</p>
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
          {proposal.status === "Draft" && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/proposals/${proposalId}/edit`)}>
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
                  <div className="col-span-2 text-right">${item.unitPrice.toLocaleString()}</div>
                  <div className="col-span-3 text-right font-medium">${item.total.toLocaleString()}</div>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="grid grid-cols-12 gap-2 text-sm font-bold">
                <div className="col-span-9 text-right">Total</div>
                <div className="col-span-3 text-right">${proposal.totalAmount?.toLocaleString() ?? "0"}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}