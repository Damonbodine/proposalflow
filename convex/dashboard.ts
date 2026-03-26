import { query } from "./_generated/server";
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

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    let contacts;
    let proposals;
    let meetings;
    if (user.role === "SalesRep") {
      contacts = await ctx.db
        .query("contacts")
        .withIndex("by_ownerId", (q: any) => q.eq("ownerId", user._id))
        .collect();
      proposals = await ctx.db
        .query("proposals")
        .withIndex("by_createdById", (q: any) => q.eq("createdById", user._id))
        .collect();
      meetings = await ctx.db
        .query("meetings")
        .withIndex("by_organizerId", (q: any) => q.eq("organizerId", user._id))
        .collect();
    } else {
      contacts = await ctx.db.query("contacts").collect();
      proposals = await ctx.db.query("proposals").collect();
      meetings = await ctx.db.query("meetings").collect();
    }
    const now = Date.now();
    const activeProposals = proposals.filter(
      (p) => p.status === "Draft" || p.status === "Sent" || p.status === "Viewed" || p.status === "Revised"
    );
    const upcomingMeetings = meetings.filter(
      (m) => m.status === "Scheduled" && m.startTime > now
    );
    const pipelineValue = contacts
      .filter((c) => c.status !== "Won" && c.status !== "Lost")
      .reduce((sum, c) => sum + (c.estimatedValue ?? 0), 0);
    const wonDeals = contacts.filter((c) => c.status === "Won").length;
    const lostDeals = contacts.filter((c) => c.status === "Lost").length;
    const totalDecided = wonDeals + lostDeals;
    const winRate = totalDecided > 0 ? Math.round((wonDeals / totalDecided) * 100) : 0;
    return {
      totalContacts: contacts.length,
      activeProposals: activeProposals.length,
      upcomingMeetings: upcomingMeetings.length,
      pipelineValue,
      wonDeals,
      lostDeals,
      winRate,
    };
  },
});

export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    const takeLimit = args.limit ?? 20;
    let activities;
    if (user.role === "SalesRep") {
      activities = await ctx.db
        .query("activities")
        .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
        .order("desc")
        .take(takeLimit);
    } else {
      activities = await ctx.db
        .query("activities")
        .order("desc")
        .take(takeLimit);
    }
    return activities;
  },
});

export const getPipelineBreakdown = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    let contacts;
    if (user.role === "SalesRep") {
      contacts = await ctx.db
        .query("contacts")
        .withIndex("by_ownerId", (q: any) => q.eq("ownerId", user._id))
        .collect();
    } else {
      contacts = await ctx.db.query("contacts").collect();
    }
    const stages = ["New", "Contacted", "Qualified", "ProposalSent", "Won", "Lost"];
    return stages.map((stage) => {
      const stageContacts = contacts.filter((c) => c.status === stage);
      return {
        stage,
        count: stageContacts.length,
        totalValue: stageContacts.reduce((sum, c) => sum + (c.estimatedValue ?? 0), 0),
      };
    });
  },
});
