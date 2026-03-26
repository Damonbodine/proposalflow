import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(
      v.literal("Admin"),
      v.literal("BusinessOwner"),
      v.literal("SalesRep")
    ),
    companyName: v.optional(v.string()),
    title: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_isActive", ["isActive"]),

  contacts: defineTable({
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
    status: v.union(
      v.literal("New"),
      v.literal("Contacted"),
      v.literal("Qualified"),
      v.literal("ProposalSent"),
      v.literal("Won"),
      v.literal("Lost")
    ),
    estimatedValue: v.optional(v.number()),
    tags: v.optional(v.string()),
    ownerId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_source", ["source"])
    .index("by_email", ["email"])
    .index("by_owner_status", ["ownerId", "status"]),

  meetings: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    contactId: v.id("contacts"),
    proposalId: v.optional(v.id("proposals")),
    organizerId: v.id("users"),
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
    status: v.union(
      v.literal("Scheduled"),
      v.literal("Completed"),
      v.literal("Cancelled"),
      v.literal("NoShow")
    ),
    outcome: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_contactId", ["contactId"])
    .index("by_proposalId", ["proposalId"])
    .index("by_organizerId", ["organizerId"])
    .index("by_status", ["status"])
    .index("by_startTime", ["startTime"])
    .index("by_organizer_status", ["organizerId", "status"]),

  proposals: defineTable({
    title: v.string(),
    contactId: v.id("contacts"),
    createdById: v.id("users"),
    templateId: v.optional(v.id("proposalTemplates")),
    content: v.string(),
    summary: v.optional(v.string()),
    totalAmount: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    status: v.union(
      v.literal("Draft"),
      v.literal("Sent"),
      v.literal("Viewed"),
      v.literal("Accepted"),
      v.literal("Declined"),
      v.literal("Expired"),
      v.literal("Revised")
    ),
    sentAt: v.optional(v.number()),
    viewedAt: v.optional(v.number()),
    respondedAt: v.optional(v.number()),
    version: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_contactId", ["contactId"])
    .index("by_createdById", ["createdById"])
    .index("by_templateId", ["templateId"])
    .index("by_status", ["status"])
    .index("by_creator_status", ["createdById", "status"])
    .index("by_validUntil", ["validUntil"]),

  proposalLineItems: defineTable({
    proposalId: v.id("proposals"),
    description: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    total: v.number(),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_proposalId", ["proposalId"]),

  proposalTemplates: defineTable({
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
    isActive: v.boolean(),
    createdById: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdById", ["createdById"])
    .index("by_category", ["category"])
    .index("by_isActive", ["isActive"]),

  activities: defineTable({
    contactId: v.id("contacts"),
    userId: v.id("users"),
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
    createdAt: v.number(),
  })
    .index("by_contactId", ["contactId"])
    .index("by_userId", ["userId"])
    .index("by_type", ["type"])
    .index("by_relatedMeetingId", ["relatedMeetingId"])
    .index("by_relatedProposalId", ["relatedProposalId"])
    .index("by_contact_createdAt", ["contactId", "createdAt"]),

  reminders: defineTable({
    userId: v.id("users"),
    contactId: v.optional(v.id("contacts")),
    proposalId: v.optional(v.id("proposals")),
    meetingId: v.optional(v.id("meetings")),
    title: v.string(),
    dueAt: v.number(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Snoozed"),
      v.literal("Completed"),
      v.literal("Dismissed")
    ),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_contactId", ["contactId"])
    .index("by_proposalId", ["proposalId"])
    .index("by_meetingId", ["meetingId"])
    .index("by_status", ["status"])
    .index("by_dueAt", ["dueAt"])
    .index("by_user_status", ["userId", "status"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("ProposalViewed"),
      v.literal("ProposalAccepted"),
      v.literal("ProposalDeclined"),
      v.literal("ProposalExpiring"),
      v.literal("MeetingReminder"),
      v.literal("FollowUpDue"),
      v.literal("NewContact"),
      v.literal("SystemAlert")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_isRead", ["isRead"])
    .index("by_user_isRead", ["userId", "isRead"])
    .index("by_type", ["type"]),

  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.union(
      v.literal("Create"),
      v.literal("Update"),
      v.literal("Delete"),
      v.literal("StatusChange"),
      v.literal("Send"),
      v.literal("Login")
    ),
    entityType: v.string(),
    entityId: v.string(),
    details: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_action", ["action"])
    .index("by_entityType", ["entityType"])
    .index("by_entityType_entityId", ["entityType", "entityId"])
    .index("by_createdAt", ["createdAt"]),

  userSettings: defineTable({
    userId: v.id("users"),
    emailNotifications: v.boolean(),
    proposalNotifications: v.boolean(),
    meetingReminders: v.boolean(),
    reminderMinutesBefore: v.number(),
    defaultTemplateId: v.optional(v.id("proposalTemplates")),
    timezone: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),
});
