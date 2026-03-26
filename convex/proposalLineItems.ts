import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required. Please sign in to continue.");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("The requested user was not found.");
  return user;
}

export const listByProposal = query({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("The requested proposal was not found.");
    if (user.role === "SalesRep" && proposal.createdById !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    const items = await ctx.db
      .query("proposalLineItems")
      .withIndex("by_proposalId", (q: any) => q.eq("proposalId", args.proposalId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    proposalId: v.id("proposals"),
    description: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("The requested proposal was not found.");
    if (user.role === "SalesRep" && proposal.createdById !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    if (proposal.status !== "Draft" && proposal.status !== "Revised") {
      throw new Error("Cannot add line items to a non-draft proposal.");
    }
    const existingItems = await ctx.db
      .query("proposalLineItems")
      .withIndex("by_proposalId", (q: any) => q.eq("proposalId", args.proposalId))
      .collect();
    const sortOrder = args.sortOrder ?? existingItems.length;
    const total = args.quantity * args.unitPrice;
    const lineItemId = await ctx.db.insert("proposalLineItems", {
      proposalId: args.proposalId,
      description: args.description,
      quantity: args.quantity,
      unitPrice: args.unitPrice,
      total,
      sortOrder,
      createdAt: Date.now(),
    });
    const newTotal = existingItems.reduce((sum, item) => sum + item.total, 0) + total;
    await ctx.db.patch(args.proposalId, { totalAmount: newTotal, updatedAt: Date.now() });
    return lineItemId;
  },
});

export const update = mutation({
  args: {
    lineItemId: v.id("proposalLineItems"),
    description: v.optional(v.string()),
    quantity: v.optional(v.number()),
    unitPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const lineItem = await ctx.db.get(args.lineItemId);
    if (!lineItem) throw new Error("The requested proposal line item was not found.");
    const proposal = await ctx.db.get(lineItem.proposalId);
    if (!proposal) throw new Error("The requested proposal was not found.");
    if (user.role === "SalesRep" && proposal.createdById !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    if (proposal.status !== "Draft" && proposal.status !== "Revised") {
      throw new Error("Cannot edit line items on a non-draft proposal.");
    }
    const newQuantity = args.quantity ?? lineItem.quantity;
    const newUnitPrice = args.unitPrice ?? lineItem.unitPrice;
    const newTotal = newQuantity * newUnitPrice;
    const { lineItemId, ...fields } = args;
    const updates: Record<string, any> = {};
    if (args.description !== undefined) updates.description = args.description;
    if (args.quantity !== undefined) updates.quantity = args.quantity;
    if (args.unitPrice !== undefined) updates.unitPrice = args.unitPrice;
    updates.total = newTotal;
    await ctx.db.patch(args.lineItemId, updates);
    const allItems = await ctx.db
      .query("proposalLineItems")
      .withIndex("by_proposalId", (q: any) => q.eq("proposalId", lineItem.proposalId))
      .collect();
    const proposalTotal = allItems.reduce(
      (sum, item) => sum + (item._id === args.lineItemId ? newTotal : item.total),
      0
    );
    await ctx.db.patch(lineItem.proposalId, { totalAmount: proposalTotal, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { lineItemId: v.id("proposalLineItems") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const lineItem = await ctx.db.get(args.lineItemId);
    if (!lineItem) throw new Error("The requested proposal line item was not found.");
    const proposal = await ctx.db.get(lineItem.proposalId);
    if (!proposal) throw new Error("The requested proposal was not found.");
    if (user.role === "SalesRep" && proposal.createdById !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    if (proposal.status !== "Draft" && proposal.status !== "Revised") {
      throw new Error("Cannot remove line items from a non-draft proposal.");
    }
    await ctx.db.delete(args.lineItemId);
    const remainingItems = await ctx.db
      .query("proposalLineItems")
      .withIndex("by_proposalId", (q: any) => q.eq("proposalId", lineItem.proposalId))
      .collect();
    const proposalTotal = remainingItems.reduce((sum, item) => sum + item.total, 0);
    await ctx.db.patch(lineItem.proposalId, { totalAmount: proposalTotal, updatedAt: Date.now() });
  },
});

export const reorder = mutation({
  args: {
    proposalId: v.id("proposals"),
    orderedIds: v.array(v.id("proposalLineItems")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("The requested proposal was not found.");
    if (user.role === "SalesRep" && proposal.createdById !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { sortOrder: i });
    }
  },
});
