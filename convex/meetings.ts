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
    meetingType: v.optional(v.string()),
    contactId: v.optional(v.id("contacts")),
    startAfter: v.optional(v.number()),
    startBefore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    let meetings;
    if (user.role === "SalesRep") {
      if (args.status !== undefined) {
        meetings = await ctx.db
          .query("meetings")
          .withIndex("by_organizer_status", (q: any) =>
            q.eq("organizerId", user._id).eq("status", args.status as any)
          )
          .collect();
      } else {
        meetings = await ctx.db
          .query("meetings")
          .withIndex("by_organizerId", (q: any) => q.eq("organizerId", user._id))
          .collect();
      }
    } else {
      if (args.status !== undefined) {
        meetings = await ctx.db
          .query("meetings")
          .withIndex("by_status", (q: any) => q.eq("status", args.status as any))
          .collect();
      } else if (args.contactId !== undefined) {
        meetings = await ctx.db
          .query("meetings")
          .withIndex("by_contactId", (q: any) => q.eq("contactId", args.contactId))
          .collect();
      } else {
        meetings = await ctx.db.query("meetings").order("desc").collect();
      }
    }
    if (args.meetingType !== undefined) {
      meetings = meetings.filter((m) => m.meetingType === args.meetingType);
    }
    if (args.startAfter !== undefined) {
      meetings = meetings.filter((m) => m.startTime >= args.startAfter!);
    }
    if (args.startBefore !== undefined) {
      meetings = meetings.filter((m) => m.startTime <= args.startBefore!);
    }
    return meetings;
  },
});

export const get = query({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) return null;
    if (user.role === "SalesRep" && meeting.organizerId !== user._id) {
      return null;
    }
    return meeting;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    contactId: v.id("contacts"),
    proposalId: v.optional(v.id("proposals")),
    startTime: v.number(),
    endTime: v.number(),
    location: v.optional(v.string()),
    meetingType: v.union(
      v.literal("Discovery"),
      v.literal("Presentation"),
      v.literal("FollowUp"),
      v.literal("Negotiation"),
      v.literal("Closing"),
      v.literal("Other")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (args.startTime >= args.endTime) {
      throw new Error("Meeting end time must be after start time.");
    }
    const now = Date.now();
    return await ctx.db.insert("meetings", {
      title: args.title,
      description: args.description,
      contactId: args.contactId,
      proposalId: args.proposalId,
      organizerId: user._id,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      meetingType: args.meetingType,
      status: "Scheduled",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    meetingId: v.id("meetings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    contactId: v.optional(v.id("contacts")),
    proposalId: v.optional(v.id("proposals")),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    location: v.optional(v.string()),
    meetingType: v.optional(
      v.union(
        v.literal("Discovery"),
        v.literal("Presentation"),
        v.literal("FollowUp"),
        v.literal("Negotiation"),
        v.literal("Closing"),
        v.literal("Other")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("Scheduled"),
        v.literal("Completed"),
        v.literal("Cancelled"),
        v.literal("NoShow")
      )
    ),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("The requested meeting was not found.");
    if (user.role === "SalesRep" && meeting.organizerId !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    const { meetingId, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, val]) => val !== undefined)
    );
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.meetingId, { ...updates, updatedAt: Date.now() });
    }
  },
});

export const remove = mutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("The requested meeting was not found.");
    if (user.role === "SalesRep" && meeting.organizerId !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_meetingId", (q: any) => q.eq("meetingId", args.meetingId))
      .collect();
    for (const reminder of reminders) {
      await ctx.db.delete(reminder._id);
    }
    await ctx.db.delete(args.meetingId);
  },
});

export const complete = mutation({
  args: {
    meetingId: v.id("meetings"),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("The requested meeting was not found.");
    if (user.role === "SalesRep" && meeting.organizerId !== user._id) {
      throw new Error("You do not have permission to perform this action.");
    }
    if (meeting.status !== "Scheduled") {
      throw new Error("Only scheduled meetings can be completed.");
    }
    await ctx.db.patch(args.meetingId, {
      status: "Completed",
      outcome: args.outcome,
      updatedAt: Date.now(),
    });
  },
});
