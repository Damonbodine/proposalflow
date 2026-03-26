"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, GripVertical } from "lucide-react";

interface LineItemsEditorProps {
  proposalId: Id<"proposals">;
}

interface NewLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function LineItemsEditor({ proposalId }: LineItemsEditorProps) {
  const lineItems = useQuery(api.proposalLineItems.listByProposal, { proposalId });
  const createLineItem = useMutation(api.proposalLineItems.create);
  const updateLineItem = useMutation(api.proposalLineItems.update);
  const deleteLineItem = useMutation(api.proposalLineItems.remove);
  const [newItem, setNewItem] = useState<NewLineItem>({ description: "", quantity: 1, unitPrice: 0 });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newItem.description || newItem.unitPrice <= 0) return;
    setIsAdding(true);
    try {
      await createLineItem({
        proposalId,
        description: newItem.description,
        quantity: newItem.quantity,
        unitPrice: newItem.unitPrice,
        sortOrder: (lineItems?.length ?? 0) + 1,
      });
      setNewItem({ description: "", quantity: 1, unitPrice: 0 });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdate = async (itemId: Id<"proposalLineItems">, field: string, value: string) => {
    const numVal = parseFloat(value);
    if (field === "description") {
      await updateLineItem({ lineItemId: itemId, description: value });
    } else if (field === "quantity" && !isNaN(numVal)) {
      await updateLineItem({ lineItemId: itemId, quantity: numVal });
    } else if (field === "unitPrice" && !isNaN(numVal)) {
      await updateLineItem({ lineItemId: itemId, unitPrice: numVal });
    }
  };

  const total = lineItems?.reduce((sum, item) => sum + item.total, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Line Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
            <div className="col-span-1" />
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1" />
          </div>

          {lineItems?.map((item) => (
            <div key={item._id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="col-span-4">
                <Input
                  defaultValue={item.description}
                  onBlur={(e) => handleUpdate(item._id, "description", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  defaultValue={item.quantity}
                  min={1}
                  onBlur={(e) => handleUpdate(item._id, "quantity", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  defaultValue={item.unitPrice}
                  step="0.01"
                  min={0}
                  onBlur={(e) => handleUpdate(item._id, "unitPrice", e.target.value)}
                />
              </div>
              <div className="col-span-2 text-right font-medium text-sm">
                ${item.total.toLocaleString()}
              </div>
              <div className="col-span-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteLineItem({ lineItemId: item._id })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-12 gap-2 items-center border-t pt-2">
            <div className="col-span-1" />
            <div className="col-span-4">
              <Input
                placeholder="New item description..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                value={newItem.quantity}
                min={1}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                step="0.01"
                value={newItem.unitPrice}
                min={0}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="col-span-2 text-right font-medium text-sm">
              ${(newItem.quantity * newItem.unitPrice).toLocaleString()}
            </div>
            <div className="col-span-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAdd} disabled={isAdding}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <div className="text-lg font-bold">Total: ${total.toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}