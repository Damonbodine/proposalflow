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

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .unique();
    if (!settings) {
      return {
        userId: user._id,
        emailNotifications: true,
        proposalNotifications: true,
        meetingReminders: true,
        reminderMinutesBefore: 15,
        timezone: "America/Chicago",
        updatedAt: Date.now(),
      };
    }
    return settings;
  },
});

export const update = mutation({
  args: {
    emailNotifications: v.optional(v.boolean()),
    proposalNotifications: v.optional(v.boolean()),
    meetingReminders: v.optional(v.boolean()),
    reminderMinutesBefore: v.optional(v.number()),
    defaultTemplateId: v.optional(v.id("proposalTemplates")),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .unique();
    const updates = Object.fromEntries(
      Object.entries(args).filter(([_, val]) => val !== undefined)
    );
    if (existing) {
      await ctx.db.patch(existing._id, { ...updates, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("userSettings", {
        userId: user._id,
        emailNotifications: args.emailNotifications ?? true,
        proposalNotifications: args.proposalNotifications ?? true,
        meetingReminders: args.meetingReminders ?? true,
        reminderMinutesBefore: args.reminderMinutesBefore ?? 15,
        defaultTemplateId: args.defaultTemplateId,
        timezone: args.timezone,
        updatedAt: Date.now(),
      });
    }
  },
});
