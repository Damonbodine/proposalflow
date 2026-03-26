import { internalMutation } from './_generated/server';

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const DAY = 86400000;
    const HOUR = 3600000;

    // ── Users ──────────────────────────────────────────────
    const adminId = await ctx.db.insert('users', {
      clerkId: 'clerk_admin_001',
      name: 'Sarah Chen',
      email: 'sarah.chen@proposalflow.io',
      phone: '+15125551001',
      role: 'Admin' as const,
      companyName: 'ProposalFlow Inc.',
      isActive: true,
      createdAt: now - 90 * DAY,
      updatedAt: now - 2 * DAY,
    });

    const ownerId = await ctx.db.insert('users', {
      clerkId: 'clerk_owner_001',
      name: 'Marcus Rivera',
      email: 'marcus@riverapartners.com',
      phone: '+15125552010',
      role: 'BusinessOwner' as const,
      companyName: 'Rivera Partners LLC',
      isActive: true,
      createdAt: now - 90 * DAY,
      updatedAt: now - 5 * DAY,
    });

    const sales1Id = await ctx.db.insert('users', {
      clerkId: 'clerk_sales_001',
      name: 'Jessica Park',
      email: 'jessica.park@riverapartners.com',
      phone: '+15125553020',
      role: 'SalesRep' as const,
      companyName: 'Rivera Partners LLC',
      isActive: true,
      createdAt: now - 60 * DAY,
      updatedAt: now - 1 * DAY,
    });

    const sales2Id = await ctx.db.insert('users', {
      clerkId: 'clerk_sales_002',
      name: 'David Okonkwo',
      email: 'david.okonkwo@riverapartners.com',
      phone: '+15125554030',
      role: 'SalesRep' as const,
      companyName: 'Rivera Partners LLC',
      isActive: true,
      createdAt: now - 45 * DAY,
      updatedAt: now - 3 * DAY,
    });

    const inactiveId = await ctx.db.insert('users', {
      clerkId: 'clerk_sales_003',
      name: 'Amy Larson',
      email: 'amy.larson@riverapartners.com',
      phone: '+15125555040',
      role: 'SalesRep' as const,
      companyName: 'Rivera Partners LLC',
      isActive: false,
      createdAt: now - 120 * DAY,
      updatedAt: now - 30 * DAY,
    });

    // ── Contacts ───────────────────────────────────────────
    const contact1 = await ctx.db.insert('contacts', {
      firstName: 'Elena',
      lastName: 'Vasquez',
      email: 'elena.vasquez@brightedge.co',
      phone: '+14155551100',
      company: 'BrightEdge Solutions',
      source: 'Referral' as const,
      status: 'Qualified' as const,
      estimatedValue: 45000,
      ownerId: sales1Id,
      createdAt: now - 30 * DAY,
      updatedAt: now - 5 * DAY,
    });

    const contact2 = await ctx.db.insert('contacts', {
      firstName: 'Tom',
      lastName: 'Whitfield',
      email: 'twhitfield@nexagen.com',
      phone: '+12125552200',
      company: 'NexaGen Industries',
      source: 'Website' as const,
      status: 'ProposalSent' as const,
      estimatedValue: 120000,
      ownerId: sales1Id,
      createdAt: now - 25 * DAY,
      updatedAt: now - 2 * DAY,
    });

    const contact3 = await ctx.db.insert('contacts', {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@cloudpeak.io',
      phone: '+16505553300',
      company: 'CloudPeak Technologies',
      source: 'Meeting' as const,
      status: 'New' as const,
      estimatedValue: 28000,
      ownerId: sales2Id,
      createdAt: now - 10 * DAY,
      updatedAt: now - 10 * DAY,
    });

    const contact4 = await ctx.db.insert('contacts', {
      firstName: 'Robert',
      lastName: 'Tanaka',
      email: 'r.tanaka@meridiangroup.com',
      phone: '+13125554400',
      company: 'Meridian Group',
      source: 'Import' as const,
      status: 'Won' as const,
      estimatedValue: 87500,
      ownerId: sales2Id,
      createdAt: now - 40 * DAY,
      updatedAt: now - 3 * DAY,
    });

    const contact5 = await ctx.db.insert('contacts', {
      firstName: 'Lauren',
      lastName: 'Mitchell',
      email: 'lmitchell@sunrisehealthcare.org',
      phone: '+17135555500',
      company: 'Sunrise Healthcare',
      source: 'Manual' as const,
      status: 'Contacted' as const,
      estimatedValue: 62000,
      ownerId: sales1Id,
      createdAt: now - 15 * DAY,
      updatedAt: now - 7 * DAY,
    });

    // ── Proposal Templates ─────────────────────────────────
    const template1 = await ctx.db.insert('proposalTemplates', {
      name: 'Standard Consulting Engagement',
      category: 'Consulting' as const,
      defaultContent: '## Scope of Work\n\nWe propose to deliver the following consulting services:\n\n### Phase 1: Assessment\n- Current state analysis\n- Gap identification\n- Recommendations report\n\n### Phase 2: Implementation\n- Solution design\n- Deployment support\n- Knowledge transfer\n\n## Terms\n- Net 30 payment terms\n- 12-month engagement period',
      isActive: true,
      createdById: ownerId,
      createdAt: now - 60 * DAY,
      updatedAt: now - 30 * DAY,
    });

    const template2 = await ctx.db.insert('proposalTemplates', {
      name: 'SaaS Subscription Agreement',
      category: 'Subscription' as const,
      defaultContent: '## Software Subscription\n\nThis proposal covers the following subscription services:\n\n### Included Features\n- Platform access for specified users\n- Standard support (M-F 9-5)\n- Quarterly business reviews\n- Data migration assistance\n\n### Subscription Terms\n- Annual billing cycle\n- Auto-renewal with 30-day notice\n- 99.9% uptime SLA',
      isActive: true,
      createdById: ownerId,
      createdAt: now - 55 * DAY,
      updatedAt: now - 20 * DAY,
    });

    const template3 = await ctx.db.insert('proposalTemplates', {
      name: 'Professional Services Quote',
      category: 'Service' as const,
      defaultContent: '## Professional Services\n\nWe are pleased to offer the following professional services:\n\n### Deliverables\n- Project planning and kickoff\n- Technical implementation\n- Testing and validation\n- Training sessions\n\n### Timeline\n- Estimated duration: TBD\n- Payment milestones tied to deliverables',
      isActive: true,
      createdById: adminId,
      createdAt: now - 50 * DAY,
      updatedAt: now - 15 * DAY,
    });

    await ctx.db.insert('proposalTemplates', {
      name: 'Product Bundle Proposal',
      category: 'Product' as const,
      defaultContent: '## Product Offering\n\n### Products Included\n- List products here\n\n### Pricing\n- Volume discounts available\n- Shipping and handling included\n\n### Warranty\n- Standard 12-month warranty\n- Extended warranty options available',
      isActive: false,
      createdById: adminId,
      createdAt: now - 80 * DAY,
      updatedAt: now - 40 * DAY,
    });

    // ── Proposals ──────────────────────────────────────────
    const proposal1 = await ctx.db.insert('proposals', {
      title: 'BrightEdge Solutions - Digital Transformation Consulting',
      contactId: contact1,
      createdById: sales1Id,
      templateId: template1,
      content: '## Digital Transformation Consulting Engagement\n\n### Executive Summary\nRivera Partners will deliver a comprehensive digital transformation assessment and implementation roadmap for BrightEdge Solutions.\n\n### Scope\n- Current technology stack assessment\n- Process optimization analysis\n- Digital roadmap with 12-month milestones\n- Change management support\n\n### Timeline\n8 weeks from kickoff to final deliverable.\n\n### Investment\nSee line items below.',
      totalAmount: 45000,
      validUntil: now + 14 * DAY,
      status: 'Draft' as const,
      version: 1,
      createdAt: now - 7 * DAY,
      updatedAt: now - 2 * DAY,
    });

    const proposal2 = await ctx.db.insert('proposals', {
      title: 'NexaGen Industries - Enterprise Platform Subscription',
      contactId: contact2,
      createdById: sales1Id,
      templateId: template2,
      content: '## Enterprise Platform Subscription\n\n### Overview\nNexaGen Industries will receive full enterprise access to our integrated business management platform.\n\n### Package Details\n- 50 user licenses\n- Advanced analytics module\n- API integration suite\n- Dedicated account manager\n- Premium support (24/7)\n\n### Contract Duration\n24-month agreement with annual billing.\n\n### Investment\nSee line items below.',
      totalAmount: 120000,
      validUntil: now + 7 * DAY,
      status: 'Sent' as const,
      sentAt: now - 3 * DAY,
      version: 2,
      createdAt: now - 14 * DAY,
      updatedAt: now - 3 * DAY,
    });

    const proposal3 = await ctx.db.insert('proposals', {
      title: 'Meridian Group - Staff Augmentation Services',
      contactId: contact4,
      createdById: sales2Id,
      templateId: template3,
      content: '## Staff Augmentation Proposal\n\n### Overview\nRivera Partners will provide skilled technical professionals to augment Meridian Group\'s development team.\n\n### Resources\n- 2 Senior Developers\n- 1 Project Manager\n- 1 QA Engineer\n\n### Engagement Model\n- Time and materials\n- Monthly billing\n- 2-week notice for resource changes\n\n### Investment\nSee line items below.',
      totalAmount: 87500,
      validUntil: now + 30 * DAY,
      status: 'Accepted' as const,
      sentAt: now - 10 * DAY,
      viewedAt: now - 8 * DAY,
      respondedAt: now - 5 * DAY,
      version: 1,
      createdAt: now - 14 * DAY,
      updatedAt: now - 5 * DAY,
    });

    const proposal4 = await ctx.db.insert('proposals', {
      title: 'Sunrise Healthcare - Compliance Audit System',
      contactId: contact5,
      createdById: sales1Id,
      content: '## Healthcare Compliance Audit Platform\n\n### Overview\nA tailored compliance tracking and audit management solution for Sunrise Healthcare.\n\n### Features\n- Automated audit scheduling\n- Regulatory change tracking\n- Documentation management\n- Compliance dashboard and reporting\n\n### Implementation\n- Phase 1: Setup and configuration (4 weeks)\n- Phase 2: Data migration (2 weeks)\n- Phase 3: Training and go-live (2 weeks)\n\n### Investment\nSee line items below.',
      totalAmount: 62000,
      validUntil: now + 21 * DAY,
      status: 'Draft' as const,
      version: 1,
      createdAt: now - 5 * DAY,
      updatedAt: now - 1 * DAY,
    });

    // ── Proposal Line Items ────────────────────────────────
    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal1,
      description: 'Technology Assessment & Gap Analysis',
      quantity: 1,
      unitPrice: 15000,
      total: 15000,
      sortOrder: 1,
      createdAt: now - 7 * DAY,
    });
    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal1,
      description: 'Digital Transformation Roadmap',
      quantity: 1,
      unitPrice: 20000,
      total: 20000,
      sortOrder: 2,
      createdAt: now - 7 * DAY,
    });
    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal1,
      description: 'Change Management Workshop (half-day)',
      quantity: 2,
      unitPrice: 5000,
      total: 10000,
      sortOrder: 3,
      createdAt: now - 7 * DAY,
    });

    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal2,
      description: 'Enterprise Platform License (50 users, annual)',
      quantity: 2,
      unitPrice: 45000,
      total: 90000,
      sortOrder: 1,
      createdAt: now - 14 * DAY,
    });
    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal2,
      description: 'Advanced Analytics Module',
      quantity: 2,
      unitPrice: 7500,
      total: 15000,
      sortOrder: 2,
      createdAt: now - 14 * DAY,
    });
    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal2,
      description: 'Implementation & Onboarding',
      quantity: 1,
      unitPrice: 15000,
      total: 15000,
      sortOrder: 3,
      createdAt: now - 14 * DAY,
    });

    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal3,
      description: 'Senior Developer (monthly rate)',
      quantity: 5,
      unitPrice: 12500,
      total: 62500,
      sortOrder: 1,
      createdAt: now - 14 * DAY,
    });
    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal3,
      description: 'Project Manager (monthly rate)',
      quantity: 5,
      unitPrice: 3000,
      total: 15000,
      sortOrder: 2,
      createdAt: now - 14 * DAY,
    });
    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal3,
      description: 'QA Engineer (monthly rate)',
      quantity: 5,
      unitPrice: 2000,
      total: 10000,
      sortOrder: 3,
      createdAt: now - 14 * DAY,
    });

    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal4,
      description: 'Platform License (annual)',
      quantity: 1,
      unitPrice: 36000,
      total: 36000,
      sortOrder: 1,
      createdAt: now - 5 * DAY,
    });
    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal4,
      description: 'Implementation Services',
      quantity: 1,
      unitPrice: 18000,
      total: 18000,
      sortOrder: 2,
      createdAt: now - 5 * DAY,
    });
    await ctx.db.insert('proposalLineItems', {
      proposalId: proposal4,
      description: 'Staff Training (per session)',
      quantity: 4,
      unitPrice: 2000,
      total: 8000,
      sortOrder: 3,
      createdAt: now - 5 * DAY,
    });

    // ── Meetings ───────────────────────────────────────────
    await ctx.db.insert('meetings', {
      title: 'BrightEdge Discovery Call',
      contactId: contact1,
      organizerId: sales1Id,
      startTime: now - 20 * DAY,
      endTime: now - 20 * DAY + HOUR,
      meetingType: 'Discovery' as const,
      status: 'Completed' as const,
      outcome: 'Identified key pain points in current workflow. Client interested in full assessment.',
      createdAt: now - 25 * DAY,
      updatedAt: now - 20 * DAY,
    });

    await ctx.db.insert('meetings', {
      title: 'NexaGen Proposal Presentation',
      contactId: contact2,
      organizerId: sales1Id,
      startTime: now - 10 * DAY,
      endTime: now - 10 * DAY + 2 * HOUR,
      meetingType: 'Presentation' as const,
      status: 'Completed' as const,
      outcome: 'Presented v2 of the proposal. Client requested minor pricing adjustments.',
      createdAt: now - 14 * DAY,
      updatedAt: now - 10 * DAY,
    });

    await ctx.db.insert('meetings', {
      title: 'CloudPeak Initial Meeting',
      contactId: contact3,
      organizerId: sales2Id,
      startTime: now + 3 * DAY,
      endTime: now + 3 * DAY + HOUR,
      meetingType: 'Discovery' as const,
      status: 'Scheduled' as const,
      createdAt: now - 5 * DAY,
      updatedAt: now - 5 * DAY,
    });

    await ctx.db.insert('meetings', {
      title: 'NexaGen Contract Negotiation',
      contactId: contact2,
      organizerId: sales1Id,
      startTime: now + 1 * DAY,
      endTime: now + 1 * DAY + 2 * HOUR,
      meetingType: 'Negotiation' as const,
      status: 'Scheduled' as const,
      createdAt: now - 3 * DAY,
      updatedAt: now - 3 * DAY,
    });

    await ctx.db.insert('meetings', {
      title: 'Sunrise Healthcare Follow-Up',
      contactId: contact5,
      organizerId: sales1Id,
      startTime: now - 5 * DAY,
      endTime: now - 5 * DAY + HOUR,
      meetingType: 'FollowUp' as const,
      status: 'Cancelled' as const,
      createdAt: now - 8 * DAY,
      updatedAt: now - 6 * DAY,
    });

    // ── Activities ─────────────────────────────────────────
    await ctx.db.insert('activities', {
      contactId: contact1,
      userId: sales1Id,
      type: 'Call' as const,
      title: 'Initial outreach call - discussed digital transformation needs',
      createdAt: now - 28 * DAY,
    });
    await ctx.db.insert('activities', {
      contactId: contact1,
      userId: sales1Id,
      type: 'Meeting' as const,
      title: 'Discovery meeting completed - identified key pain points',
      createdAt: now - 20 * DAY,
    });
    await ctx.db.insert('activities', {
      contactId: contact2,
      userId: sales1Id,
      type: 'ProposalSent' as const,
      title: 'Enterprise platform proposal v2 sent to Tom Whitfield',
      createdAt: now - 3 * DAY,
    });
    await ctx.db.insert('activities', {
      contactId: contact4,
      userId: sales2Id,
      type: 'ProposalCreated' as const,
      title: 'Created staff augmentation proposal for Meridian Group',
      createdAt: now - 14 * DAY,
    });
    await ctx.db.insert('activities', {
      contactId: contact5,
      userId: sales1Id,
      type: 'Email' as const,
      title: 'Sent follow-up email with compliance platform overview',
      createdAt: now - 12 * DAY,
    });
    await ctx.db.insert('activities', {
      contactId: contact3,
      userId: sales2Id,
      type: 'Note' as const,
      title: 'Priya mentioned budget approval expected by end of Q2',
      createdAt: now - 8 * DAY,
    });

    // ── Reminders ──────────────────────────────────────────
    await ctx.db.insert('reminders', {
      userId: sales1Id,
      contactId: contact2,
      title: 'Follow up on NexaGen proposal - check if viewed',
      dueAt: now + 2 * DAY,
      status: 'Pending' as const,
      createdAt: now - 3 * DAY,
    });
    await ctx.db.insert('reminders', {
      userId: sales1Id,
      contactId: contact5,
      title: 'Send revised compliance audit pricing to Lauren',
      dueAt: now - 1 * DAY,
      status: 'Snoozed' as const,
      createdAt: now - 5 * DAY,
    });
    await ctx.db.insert('reminders', {
      userId: sales2Id,
      contactId: contact3,
      title: 'Check in with Priya about Q2 budget decision',
      dueAt: now + 7 * DAY,
      status: 'Pending' as const,
      createdAt: now - 4 * DAY,
    });
    await ctx.db.insert('reminders', {
      userId: sales2Id,
      contactId: contact4,
      title: 'Confirm Meridian onboarding start date',
      dueAt: now - 10 * DAY,
      status: 'Completed' as const,
      createdAt: now - 15 * DAY,
    });

    // ── Notifications ──────────────────────────────────────
    await ctx.db.insert('notifications', {
      userId: sales1Id,
      type: 'ProposalViewed' as const,
      title: 'Proposal Viewed',
      message: "Tom Whitfield viewed your proposal 'Enterprise Platform Subscription'",
      isRead: false,
      createdAt: now - 1 * DAY,
    });
    await ctx.db.insert('notifications', {
      userId: sales1Id,
      type: 'MeetingReminder' as const,
      title: 'Upcoming Meeting',
      message: 'NexaGen Contract Negotiation starts in 30 minutes',
      isRead: false,
      createdAt: now,
    });
    await ctx.db.insert('notifications', {
      userId: sales2Id,
      type: 'ProposalAccepted' as const,
      title: 'Proposal Accepted',
      message: "Robert Tanaka accepted your proposal 'Staff Augmentation Services'",
      isRead: true,
      createdAt: now - 5 * DAY,
    });
    await ctx.db.insert('notifications', {
      userId: ownerId,
      type: 'ProposalViewed' as const,
      title: 'Weekly Summary',
      message: '3 proposals sent this week, 1 accepted. Total pipeline value: $255,000',
      isRead: false,
      createdAt: now - 1 * DAY,
    });

    // ── Audit Logs ─────────────────────────────────────────
    await ctx.db.insert('auditLogs', {
      userId: adminId,
      action: 'Login' as const,
      entityType: 'user',
      entityId: adminId,
      createdAt: now - 1 * DAY,
    });
    await ctx.db.insert('auditLogs', {
      userId: sales1Id,
      action: 'Create' as const,
      entityType: 'proposal',
      entityId: proposal1,
      details: 'Created proposal: BrightEdge Solutions - Digital Transformation Consulting',
      createdAt: now - 7 * DAY,
    });
    await ctx.db.insert('auditLogs', {
      userId: sales1Id,
      action: 'Send' as const,
      entityType: 'proposal',
      entityId: proposal2,
      details: 'Sent proposal v2 to NexaGen Industries',
      createdAt: now - 3 * DAY,
    });
    await ctx.db.insert('auditLogs', {
      userId: sales2Id,
      action: 'StatusChange' as const,
      entityType: 'proposal',
      entityId: proposal3,
      details: 'Status changed from Sent to Accepted',
      createdAt: now - 5 * DAY,
    });
    await ctx.db.insert('auditLogs', {
      userId: sales1Id,
      action: 'Update' as const,
      entityType: 'contact',
      entityId: contact2,
      details: 'Updated contact status to ProposalSent',
      createdAt: now - 3 * DAY,
    });

    // ── User Settings ──────────────────────────────────────
    await ctx.db.insert('userSettings', {
      userId: adminId,
      emailNotifications: true,
      proposalNotifications: true,
      meetingReminders: true,
      reminderMinutesBefore: 30,
      updatedAt: now - 60 * DAY,
    });
    await ctx.db.insert('userSettings', {
      userId: ownerId,
      emailNotifications: true,
      proposalNotifications: true,
      meetingReminders: true,
      reminderMinutesBefore: 15,
      updatedAt: now - 50 * DAY,
    });
    await ctx.db.insert('userSettings', {
      userId: sales1Id,
      emailNotifications: true,
      proposalNotifications: true,
      meetingReminders: true,
      reminderMinutesBefore: 30,
      updatedAt: now - 40 * DAY,
    });
    await ctx.db.insert('userSettings', {
      userId: sales2Id,
      emailNotifications: false,
      proposalNotifications: true,
      meetingReminders: true,
      reminderMinutesBefore: 60,
      updatedAt: now - 30 * DAY,
    });
    await ctx.db.insert('userSettings', {
      userId: inactiveId,
      emailNotifications: false,
      proposalNotifications: false,
      meetingReminders: false,
      reminderMinutesBefore: 30,
      updatedAt: now - 90 * DAY,
    });

    console.log('Seed complete: 5 users, 5 contacts, 4 templates, 4 proposals, 12 line items, 5 meetings, 6 activities, 4 reminders, 4 notifications, 5 audit logs, 5 user settings');
  },
});