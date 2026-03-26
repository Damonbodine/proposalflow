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
    category: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    let templates;
    if (args.category !== undefined) {
      templates = await ctx.db
        .query("proposalTemplates")
        .withIndex("by_category", (q: any) => q.eq("category", args.category as any))
        .collect();
    } else {
      templates = await ctx.db.query("proposalTemplates").collect();
    }
    if (!args.includeInactive) {
      templates = templates.filter((t) => t.isActive);
    }
    return templates;
  },
});

export const get = query({
  args: { templateId: v.id("proposalTemplates") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    const template = await ctx.db.get(args.templateId);
    return template;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("Service"),
      v.literal("Product"),
      v.literal("Consulting"),
      v.literal("Subscription"),
      v.literal("Custom")
    ),
    defaultContent: v.string(),
    defaultLineItems: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "Admin" && user.role !== "BusinessOwner") {
      throw new Error("You do not have permission to perform this action.");
    }
    const now = Date.now();
    return await ctx.db.insert("proposalTemplates", {
      name: args.name,
      description: args.description,
      category: args.category,
      defaultContent: args.defaultContent,
      defaultLineItems: args.defaultLineItems,
      isActive: true,
      createdById: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    templateId: v.id("proposalTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("Service"),
        v.literal("Product"),
        v.literal("Consulting"),
        v.literal("Subscription"),
        v.literal("Custom")
      )
    ),
    defaultContent: v.optional(v.string()),
    defaultLineItems: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "Admin" && user.role !== "BusinessOwner") {
      throw new Error("You do not have permission to perform this action.");
    }
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("The requested proposal template was not found.");
    const { templateId, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, val]) => val !== undefined)
    );
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.templateId, { ...updates, updatedAt: Date.now() });
    }
  },
});

export const deactivate = mutation({
  args: { templateId: v.id("proposalTemplates") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "Admin" && user.role !== "BusinessOwner") {
      throw new Error("You do not have permission to perform this action.");
    }
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("The requested proposal template was not found.");
    await ctx.db.patch(args.templateId, { isActive: false, updatedAt: Date.now() });
  },
});
