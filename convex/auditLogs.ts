import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    userId: v.optional(v.id("users")),
    action: v.optional(v.string()),
    entityType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required. Please sign in to continue.");
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser || currentUser.role !== "Admin") {
      throw new Error("You do not have permission to perform this action.");
    }
    const takeLimit = args.limit ?? 100;
    let logs;
    if (args.userId !== undefined) {
      logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
        .order("desc")
        .take(takeLimit);
    } else if (args.entityType !== undefined) {
      logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_entityType", (q) => q.eq("entityType", args.entityType!))
        .order("desc")
        .take(takeLimit);
    } else if (args.action !== undefined) {
      logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_action", (q) => q.eq("action", args.action as any))
        .order("desc")
        .take(takeLimit);
    } else {
      logs = await ctx.db
        .query("auditLogs")
        .order("desc")
        .take(takeLimit);
    }
    return logs;
  },
});
