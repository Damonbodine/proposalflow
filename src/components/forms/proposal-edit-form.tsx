"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface LineItem {
  _id?: Id<"proposalLineItems">;
  description: string;
  quantity: string;
  unitPrice: string;
  isNew?: boolean;
}

interface ProposalEditFormProps {
  proposal: {
    _id: Id<"proposals">;
    title: string;
    content: string;
    summary?: string;
    validUntil?: number;
  };
}

export function ProposalEditForm({ proposal }: ProposalEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const updateProposal = useMutation(api.proposals.update);
  const createLineItem = useMutation(api.proposalLineItems.create);
  const updateLineItem = useMutation(api.proposalLineItems.update);
  const deleteLineItem = useMutation(api.proposalLineItems.remove);
  const existingLineItems = useQuery(api.proposalLineItems.listByProposal, { proposalId: proposal._id });

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(proposal.title);
  const [content, setContent] = useState(proposal.content);
  const [summary, setSummary] = useState(proposal.summary ?? "");
  const [validUntil, setValidUntil] = useState(
    proposal.validUntil ? new Date(proposal.validUntil).toISOString().slice(0, 10) : ""
  );
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [deletedLineItemIds, setDeletedLineItemIds] = useState<Id<"proposalLineItems">[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (existingLineItems && !initialized) {
    setLineItems(existingLineItems.map((li) => ({
      _id: li._id,
      description: li.description,
      quantity: li.quantity.toString(),
      unitPrice: li.unitPrice.toString(),
    })));
    setInitialized(true);
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: "1", unitPrice: "0", isNew: true }]);
  };

  const removeLineItem = (index: number) => {
    const item = lineItems[index];
    if (item._id) {
      setDeletedLineItemIds([...deletedLineItemIds, item._id]);
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItemField = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    setLineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: "Validation Error", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const validUntilMs = validUntil ? new Date(validUntil).getTime() : undefined;
      await updateProposal({
        proposalId: proposal._id,
        title: title.trim(),
        content: content.trim(),
        ...(summary && { summary: summary.trim() }),
        ...(validUntilMs && { validUntil: validUntilMs }),
      });

      for (const id of deletedLineItemIds) {
        await deleteLineItem({ lineItemId: id });
      }

      for (const item of lineItems) {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unitPrice) || 0;
        if (item.isNew && item.description.trim()) {
          await createLineItem({
            proposalId: proposal._id,
            description: item.description.trim(),
            quantity: qty,
            unitPrice: price,
          });
        } else if (item._id && item.description.trim()) {
          await updateLineItem({
            lineItemId: item._id,
            description: item.description.trim(),
            quantity: qty,
            unitPrice: price,
          });
        }
      }

      toast({ title: "Proposal updated", description: `"${title}" has been saved.` });
      router.push(`/proposals/${proposal._id}`);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update proposal.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = lineItems.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
  }, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Proposal Title *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Input id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief proposal summary" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid Until</Label>
          <Input id="validUntil" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Proposal Content *</Label>
        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={10} required />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        </div>
        {lineItems.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6 space-y-1">
              <Label className="text-xs">Description</Label>
              <Input value={item.description} onChange={(e) => updateLineItemField(index, "description", e.target.value)} placeholder="Service or product" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Qty</Label>
              <Input type="number" step="0.01" value={item.quantity} onChange={(e) => updateLineItemField(index, "quantity", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Unit Price</Label>
              <Input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateLineItemField(index, "unitPrice", e.target.value)} />
            </div>
            <div className="col-span-1 text-right text-sm font-medium pt-6">
              ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}
            </div>
            <div className="col-span-1 pt-5">
              <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {lineItems.length > 0 && (
          <div className="text-right text-lg font-bold border-t pt-2">Total: ${totalAmount.toFixed(2)}</div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push(`/proposals/${proposal._id}`)} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Proposal
        </Button>
      </div>
    </form>
  );
}