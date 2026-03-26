import { cronJobs } from "convex/server";
import { internalMutation } from "./_generated/server";

export const checkExpiringProposals = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const threeDaysFromNow = now + 3 * 24 * 60 * 60 * 1000;
    const proposals = await ctx.db.query("proposals").collect();
    for (const proposal of proposals) {
      if (
        proposal.status === "Sent" &&
        proposal.validUntil &&
        proposal.validUntil <= threeDaysFromNow &&
        proposal.validUntil > now
      ) {
        await ctx.db.insert("notifications", {
          userId: proposal.createdById,
          type: "ProposalExpiring",
          title: "Proposal Expiring",
          message: `Proposal "${proposal.title}" expires soon`,
          link: `/proposals/${proposal._id}`,
          isRead: false,
          createdAt: now,
        });
      }
    }
  },
});

export const sendMeetingReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const meetings = await ctx.db.query("meetings").collect();
    for (const meeting of meetings) {
      if (meeting.status === "Scheduled" && meeting.startTime > now) {
        const settings = await ctx.db
          .query("userSettings")
          .withIndex("by_userId", (q) => q.eq("userId", meeting.organizerId))
          .first();
        const reminderMinutes = settings?.reminderMinutesBefore ?? 30;
        const reminderTime = meeting.startTime - reminderMinutes * 60 * 1000;
        if (now >= reminderTime && now < meeting.startTime) {
          const existing = await ctx.db
            .query("notifications")
            .withIndex("by_userId", (q) => q.eq("userId", meeting.organizerId))
            .filter((q) =>
              q.eq(q.field("type"), "MeetingReminder")
            )
            .first();
          if (!existing) {
            await ctx.db.insert("notifications", {
              userId: meeting.organizerId,
              type: "MeetingReminder",
              title: "Meeting Reminder",
              message: `Meeting "${meeting.title}" starts soon`,
              link: `/meetings/${meeting._id}`,
              isRead: false,
              createdAt: now,
            });
          }
        }
      }
    }
  },
});

export const flagOverdueReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const reminders = await ctx.db.query("reminders").collect();
    for (const reminder of reminders) {
      if (reminder.status === "Pending" && reminder.dueAt <= now) {
        await ctx.db.patch(reminder._id, { status: "Dismissed" });
        await ctx.db.insert("notifications", {
          userId: reminder.userId,
          type: "FollowUpDue",
          title: "Reminder Overdue",
          message: `Reminder "${reminder.title}" is overdue`,
          link: `/reminders`,
          isRead: false,
          createdAt: now,
        });
      }
    }
  },
});

const crons = cronJobs();

crons.daily(
  "checkExpiringProposals",
  { hourUTC: 8, minuteUTC: 0 },
  "crons:checkExpiringProposals" as any
);

crons.hourly(
  "sendMeetingReminders",
  { minuteUTC: 0 },
  "crons:sendMeetingReminders" as any
);

crons.hourly(
  "flagOverdueReminders",
  { minuteUTC: 15 },
  "crons:flagOverdueReminders" as any
);

export default crons;
