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
    source: v.optional(v.string()),
    ownerId: v.optional(v.id("users")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    let contacts;
    if (user.role === "SalesRep") {
      if (args.status !== undefined) {
        contacts = await ctx.db
          .query("contacts")
          .withIndex("by_owner_status", (q: any) =>
            q.eq("ownerId", user._id).eq("status", args.status as any)
          )
          .collect();
      } else {
        contacts = await ctx.db
          .query("contacts")
          .withIndex("by_ownerId", (q: any) => q.eq("ownerId", user._id))
          .collect();
      }
    } else {
      if (args.status !== undefined) {
        contacts = await ctx.db
          .query("contacts")
          .withIndex("by_status", (q: any) => q.eq("status", args.status as any))
          .collect();
      } else if (args.ownerId !== undefined) {
        contacts = await ctx.db
          .query("contacts")
          .withIndex("by_ownerId", (q: any) => q.eq("ownerId", args.ownerId))
          .collect();
      } else {
        contacts = await ctx.db.query("contacts").order("desc").collect();
      }
    }
    if (args.source !== undefined) {
      contacts = contacts.filter((c) => c.source === args.source);
    }
    if (args.search !== undefined && args.search.length > 0) {
      const searchLower = args.search.toLowerCase();
      contacts = contacts.filter(
        (c) =>
          c.firstName.toLowerCase().includes(searchLower) ||
          c.lastName.toLowerCase().includes(searchLower) ||
          (c.company && c.company.toLowerCase().includes(searchLower)) ||
          (c.email && c.email.toLowerCase().includes(searchLower))
      );
    }
    return contacts;
  },
});

export const get = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const contact = await ctx.db.get(args.contactId);
    if (!contact) throw new Error("The requested contact was not found.");
    if (user.role === "SalesRep" && contact.ownerId !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    return contact;
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    industry: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.union(
      v.literal("Manual"),
      v.literal("Import"),
      v.literal("Referral"),
      v.literal("Website"),
      v.literal("Meeting")
    ),
    status: v.optional(
      v.union(
        v.literal("New"),
        v.literal("Contacted"),
        v.literal("Qualified"),
        v.literal("ProposalSent"),
        v.literal("Won"),
        v.literal("Lost")
      )
    ),
    estimatedValue: v.optional(v.number()),
    tags: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("contacts", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      company: args.company,
      jobTitle: args.jobTitle,
      industry: args.industry,
      address: args.address,
      website: args.website,
      notes: args.notes,
      source: args.source,
      status: args.status ?? "New",
      estimatedValue: args.estimatedValue,
      tags: args.tags,
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    contactId: v.id("contacts"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    industry: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.optional(
      v.union(
        v.literal("Manual"),
        v.literal("Import"),
        v.literal("Referral"),
        v.literal("Website"),
        v.literal("Meeting")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("New"),
        v.literal("Contacted"),
        v.literal("Qualified"),
        v.literal("ProposalSent"),
        v.literal("Won"),
        v.literal("Lost")
      )
    ),
    estimatedValue: v.optional(v.number()),
    tags: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const contact = await ctx.db.get(args.contactId);
    if (!contact) throw new Error("The requested contact was not found.");
    if (user.role === "SalesRep" && contact.ownerId !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    const { contactId, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, val]) => val !== undefined)
    );
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.contactId, { ...updates, updatedAt: Date.now() });
    }
  },
});

export const remove = mutation({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role === "SalesRep") {
      throw new Error("You do not have permission to perform this action.");
    }
    const contact = await ctx.db.get(args.contactId);
    if (!contact) throw new Error("The requested contact was not found.");
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_contactId", (q: any) => q.eq("contactId", args.contactId))
      .collect();
    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }
    const meetings = await ctx.db
      .query("meetings")
      .withIndex("by_contactId", (q: any) => q.eq("contactId", args.contactId))
      .collect();
    for (const meeting of meetings) {
      await ctx.db.delete(meeting._id);
    }
    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_contactId", (q: any) => q.eq("contactId", args.contactId))
      .collect();
    for (const proposal of proposals) {
      const lineItems = await ctx.db
        .query("proposalLineItems")
        .withIndex("by_proposalId", (q: any) => q.eq("proposalId", proposal._id))
        .collect();
      for (const li of lineItems) {
        await ctx.db.delete(li._id);
      }
      await ctx.db.delete(proposal._id);
    }
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_contactId", (q: any) => q.eq("contactId", args.contactId))
      .collect();
    for (const reminder of reminders) {
      await ctx.db.delete(reminder._id);
    }
    await ctx.db.delete(args.contactId);
  },
});

export const quickAdd = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("contacts", {
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      email: args.email,
      company: args.company,
      source: "Manual",
      status: "New",
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});
