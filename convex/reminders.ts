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

export const listMine = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    let reminders;
    if (args.status !== undefined) {
      reminders = await ctx.db
        .query("reminders")
        .withIndex("by_user_status", (q: any) =>
          q.eq("userId", user._id).eq("status", args.status as any)
        )
        .collect();
    } else {
      reminders = await ctx.db
        .query("reminders")
        .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
        .collect();
    }
    return reminders.sort((a, b) => a.dueAt - b.dueAt);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    dueAt: v.number(),
    contactId: v.optional(v.id("contacts")),
    proposalId: v.optional(v.id("proposals")),
    meetingId: v.optional(v.id("meetings")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    return await ctx.db.insert("reminders", {
      userId: user._id,
      title: args.title,
      dueAt: args.dueAt,
      contactId: args.contactId,
      proposalId: args.proposalId,
      meetingId: args.meetingId,
      status: "Pending",
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    reminderId: v.id("reminders"),
    title: v.optional(v.string()),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const reminder = await ctx.db.get(args.reminderId);
    if (!reminder) throw new Error("The requested reminder was not found.");
    if (reminder.userId !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    const updates: Record<string, any> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.dueAt !== undefined) updates.dueAt = args.dueAt;
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.reminderId, updates);
    }
  },
});

export const snooze = mutation({
  args: {
    reminderId: v.id("reminders"),
    snoozeMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const reminder = await ctx.db.get(args.reminderId);
    if (!reminder) throw new Error("The requested reminder was not found.");
    if (reminder.userId !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    const newDueAt = Date.now() + args.snoozeMinutes * 60 * 1000;
    await ctx.db.patch(args.reminderId, {
      status: "Snoozed",
      dueAt: newDueAt,
    });
  },
});

export const dismiss = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const reminder = await ctx.db.get(args.reminderId);
    if (!reminder) throw new Error("The requested reminder was not found.");
    if (reminder.userId !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    await ctx.db.patch(args.reminderId, { status: "Dismissed" });
  },
});

export const complete = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const reminder = await ctx.db.get(args.reminderId);
    if (!reminder) throw new Error("The requested reminder was not found.");
    if (reminder.userId !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    await ctx.db.patch(args.reminderId, { status: "Completed" });
  },
});
