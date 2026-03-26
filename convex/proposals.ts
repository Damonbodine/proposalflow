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

export const list = query({
  args: {
    status: v.optional(v.string()),
    contactId: v.optional(v.id("contacts")),
    createdById: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    let proposals;
    if (user.role === "SalesRep") {
      if (args.status !== undefined) {
        proposals = await ctx.db
          .query("proposals")
          .withIndex("by_creator_status", (q: any) =>
            q.eq("createdById", user._id).eq("status", args.status as any)
          )
          .collect();
      } else {
        proposals = await ctx.db
          .query("proposals")
          .withIndex("by_createdById", (q: any) => q.eq("createdById", user._id))
          .collect();
      }
    } else {
      if (args.status !== undefined) {
        proposals = await ctx.db
          .query("proposals")
          .withIndex("by_status", (q: any) => q.eq("status", args.status as any))
          .collect();
      } else if (args.contactId !== undefined) {
        proposals = await ctx.db
          .query("proposals")
          .withIndex("by_contactId", (q: any) => q.eq("contactId", args.contactId))
          .collect();
      } else if (args.createdById !== undefined) {
        proposals = await ctx.db
          .query("proposals")
          .withIndex("by_createdById", (q: any) => q.eq("createdById", args.createdById))
          .collect();
      } else {
        proposals = await ctx.db.query("proposals").order("desc").collect();
      }
    }
    return proposals;
  },
});

export const get = query({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("The requested proposal was not found.");
    if (user.role === "SalesRep" && proposal.createdById !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    return proposal;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    contactId: v.id("contacts"),
    templateId: v.optional(v.id("proposalTemplates")),
    content: v.string(),
    summary: v.optional(v.string()),
    validUntil: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("proposals", {
      title: args.title,
      contactId: args.contactId,
      createdById: user._id,
      templateId: args.templateId,
      content: args.content,
      summary: args.summary,
      totalAmount: 0,
      validUntil: args.validUntil,
      status: "Draft",
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    proposalId: v.id("proposals"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    summary: v.optional(v.string()),
    validUntil: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("The requested proposal was not found.");
    if (user.role === "SalesRep" && proposal.createdById !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    if (proposal.status !== "Draft" && proposal.status !== "Revised") {
      throw new Error("Only draft or revised proposals can be edited.");
    }
    const { proposalId, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, val]) => val !== undefined)
    );
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.proposalId, { ...updates, updatedAt: Date.now() });
    }
  },
});

export const remove = mutation({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("The requested proposal was not found.");
    if (user.role === "SalesRep") {
      throw new Error("You do not have permission to perform this action.");
    }
    const lineItems = await ctx.db
      .query("proposalLineItems")
      .withIndex("by_proposalId", (q: any) => q.eq("proposalId", args.proposalId))
      .collect();
    for (const li of lineItems) {
      await ctx.db.delete(li._id);
    }
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_proposalId", (q: any) => q.eq("proposalId", args.proposalId))
      .collect();
    for (const reminder of reminders) {
      await ctx.db.delete(reminder._id);
    }
    await ctx.db.delete(args.proposalId);
  },
});

export const send = mutation({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("The requested proposal was not found.");
    if (user.role === "SalesRep" && proposal.createdById !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    if (proposal.status !== "Draft" && proposal.status !== "Revised") {
      throw new Error("Only draft or revised proposals can be sent.");
    }
    const lineItems = await ctx.db
      .query("proposalLineItems")
      .withIndex("by_proposalId", (q: any) => q.eq("proposalId", args.proposalId))
      .collect();
    const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);
    const now = Date.now();
    await ctx.db.patch(args.proposalId, {
      status: "Sent",
      sentAt: now,
      totalAmount,
      updatedAt: now,
    });
    const contact = await ctx.db.get(proposal.contactId);
    if (contact && contact.status === "Qualified") {
      await ctx.db.patch(proposal.contactId, {
        status: "ProposalSent",
        updatedAt: now,
      });
    }
    await ctx.db.insert("activities", {
      contactId: proposal.contactId,
      userId: user._id,
      type: "ProposalSent",
      title: `Proposal sent: ${proposal.title}`,
      relatedProposalId: args.proposalId,
      createdAt: now,
    });
  },
});

export const generateFromTemplate = mutation({
  args: {
    templateId: v.id("proposalTemplates"),
    contactId: v.id("contacts"),
    title: v.string(),
    validUntil: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("The requested proposal template was not found.");
    if (!template.isActive) throw new Error("Cannot use an inactive template.");
    const now = Date.now();
    const proposalId = await ctx.db.insert("proposals", {
      title: args.title,
      contactId: args.contactId,
      createdById: user._id,
      templateId: args.templateId,
      content: template.defaultContent,
      totalAmount: 0,
      validUntil: args.validUntil,
      status: "Draft",
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    if (template.defaultLineItems) {
      try {
        const items = JSON.parse(template.defaultLineItems) as Array<{
          description: string;
          quantity: number;
          unitPrice: number;
        }>;
        let sortOrder = 0;
        for (const item of items) {
          await ctx.db.insert("proposalLineItems", {
            proposalId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            sortOrder,
            createdAt: now,
          });
          sortOrder++;
        }
        const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        await ctx.db.patch(proposalId, { totalAmount });
      } catch {
        // If defaultLineItems is not valid JSON, skip
      }
    }
    await ctx.db.insert("activities", {
      contactId: args.contactId,
      userId: user._id,
      type: "ProposalCreated",
      title: `Proposal created: ${args.title}`,
      relatedProposalId: proposalId,
      createdAt: now,
    });
    return proposalId;
  },
});
