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

export const listByContact = query({
  args: {
    contactId: v.id("contacts"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const contact = await ctx.db.get(args.contactId);
    if (!contact) throw new Error("The requested contact was not found.");
    if (user.role === "SalesRep" && contact.ownerId !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    let activities = await ctx.db
      .query("activities")
      .withIndex("by_contactId", (q: any) => q.eq("contactId", args.contactId))
      .order("desc")
      .collect();
    if (args.type !== undefined) {
      activities = activities.filter((a) => a.type === args.type);
    }
    return activities;
  },
});

export const create = mutation({
  args: {
    contactId: v.id("contacts"),
    type: v.union(
      v.literal("Note"),
      v.literal("Call"),
      v.literal("Email"),
      v.literal("Meeting"),
      v.literal("ProposalCreated"),
      v.literal("ProposalSent"),
      v.literal("ProposalViewed"),
      v.literal("ProposalAccepted"),
      v.literal("ProposalDeclined"),
      v.literal("StatusChange")
    ),
    title: v.string(),
    details: v.optional(v.string()),
    relatedMeetingId: v.optional(v.id("meetings")),
    relatedProposalId: v.optional(v.id("proposals")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const contact = await ctx.db.get(args.contactId);
    if (!contact) throw new Error("The requested contact was not found.");
    if (user.role === "SalesRep" && contact.ownerId !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    return await ctx.db.insert("activities", {
      contactId: args.contactId,
      userId: user._id,
      type: args.type,
      title: args.title,
      details: args.details,
      relatedMeetingId: args.relatedMeetingId,
      relatedProposalId: args.relatedProposalId,
      createdAt: Date.now(),
    });
  },
});
