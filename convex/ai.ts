import { action } from "./_generated/server";
import { v } from "convex/values";

const PROMPTS: Record<string, string> = {
  proposalContent:
    "You are a professional sales consultant writing a business proposal. Create compelling, professional proposal content tailored to the client's needs. Include an introduction, scope of work, approach, timeline, and value proposition. Be persuasive but honest. Output only the proposal text.",
  proposalSummary:
    "You are summarizing a business proposal. Write a concise executive summary (3-5 sentences) highlighting the key value proposition, scope, and investment. Output only the summary text.",
  contactNotes:
    "You are a sales professional documenting a client relationship. Summarize the contact's role, interests, communication preferences, and relationship stage. Be concise and actionable. Output only the notes text.",
  meetingDescription:
    "You are preparing for a business meeting. Write a professional meeting description including objectives, key talking points, and preparation notes. Output only the description text.",
  meetingOutcome:
    "You are documenting meeting results. Summarize key decisions, action items with owners, and recommended next steps. Use bullet points for action items. Output only the outcome text.",
};

async function callOpenRouter(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("No content returned from OpenRouter");
  }

  return text as string;
}

export const generate = action({
  args: {
    fieldName: v.string(),
    context: v.any(),
  },
  handler: async (_ctx, args) => {
    const systemPrompt = PROMPTS[args.fieldName];
    if (!systemPrompt) {
      throw new Error(`Unknown field name: ${args.fieldName}`);
    }

    const userMessage =
      typeof args.context === "string"
        ? args.context
        : JSON.stringify(args.context, null, 2);

    return await callOpenRouter(systemPrompt, userMessage);
  },
});

export const generateProposalDraft = action({
  args: {
    contactName: v.string(),
    contactCompany: v.optional(v.string()),
    contactIndustry: v.optional(v.string()),
    contactNotes: v.optional(v.string()),
    meetingNotes: v.optional(v.string()),
    services: v.optional(v.string()),
    pricing: v.optional(v.string()),
    proposalTitle: v.string(),
  },
  handler: async (_ctx, args) => {
    const systemPrompt = `You are a professional sales consultant creating a comprehensive business proposal. Generate a complete, well-structured proposal with the following sections, each clearly labeled with a heading:

1. **Executive Summary** — A concise overview of the proposal and key value proposition.
2. **Understanding of Needs** — Demonstrate understanding of the client's challenges and goals based on their profile and meeting notes.
3. **Proposed Solution** — Detail the services/solutions being proposed and how they address the client's needs.
4. **Timeline** — Provide a realistic implementation timeline with key milestones.
5. **Investment** — Break down the pricing and costs clearly.
6. **Terms** — Standard terms and conditions, payment terms, and validity period.

Be professional, persuasive, and specific. Tailor everything to the client's context. Output only the proposal text with clearly labeled sections.`;

    const contextParts = [
      `Proposal Title: ${args.proposalTitle}`,
      `Client: ${args.contactName}`,
    ];
    if (args.contactCompany) contextParts.push(`Company: ${args.contactCompany}`);
    if (args.contactIndustry) contextParts.push(`Industry: ${args.contactIndustry}`);
    if (args.contactNotes) contextParts.push(`Client Notes: ${args.contactNotes}`);
    if (args.meetingNotes) contextParts.push(`Meeting Notes: ${args.meetingNotes}`);
    if (args.services) contextParts.push(`Selected Services: ${args.services}`);
    if (args.pricing) contextParts.push(`Pricing Information: ${args.pricing}`);

    return await callOpenRouter(systemPrompt, contextParts.join("\n\n"));
  },
});

export const extractMeetingActionItems = action({
  args: {
    rawNotes: v.string(),
    meetingTitle: v.optional(v.string()),
    attendees: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const systemPrompt = `You are a professional meeting analyst. Given raw meeting notes, extract and organize the information into a structured JSON format. Your output must be valid JSON with this exact structure:

{
  "discussionPoints": ["point 1", "point 2"],
  "decisions": ["decision 1", "decision 2"],
  "actionItems": [
    {"task": "description", "assignee": "person name or TBD", "deadline": "date or TBD"}
  ],
  "followUpTopics": ["topic 1", "topic 2"]
}

Be thorough — capture all discussion points, decisions, and action items mentioned. If assignees or deadlines are not explicitly mentioned, use "TBD". Output only the JSON object, no additional text.`;

    const contextParts = [];
    if (args.meetingTitle) contextParts.push(`Meeting: ${args.meetingTitle}`);
    if (args.attendees) contextParts.push(`Attendees: ${args.attendees}`);
    contextParts.push(`Raw Notes:\n${args.rawNotes}`);

    return await callOpenRouter(systemPrompt, contextParts.join("\n\n"));
  },
});

export const analyzeWinLoss = action({
  args: {
    proposalTitle: v.string(),
    proposalContent: v.string(),
    proposalAmount: v.optional(v.number()),
    outcome: v.string(),
    contactName: v.string(),
    contactCompany: v.optional(v.string()),
    contactIndustry: v.optional(v.string()),
    contactNotes: v.optional(v.string()),
    competitionContext: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const systemPrompt = `You are a sales strategy analyst performing a win/loss analysis. Based on the proposal details, client profile, and outcome, provide a thorough analysis. Structure your response as follows:

1. **Outcome Summary** — Brief statement of the result.
2. **Key Factors** — What factors likely contributed to the ${args.outcome === "Won" ? "win" : "loss"}.
3. **Strengths** — What aspects of the proposal were strong.
4. **Weaknesses** — What aspects could have been improved.
5. **Competitive Insights** — Analysis of competitive positioning (if context available).
6. **Recommendations** — Specific, actionable recommendations for future proposals.

Be analytical, specific, and constructive. Output only the analysis text.`;

    const contextParts = [
      `Outcome: ${args.outcome}`,
      `Proposal: ${args.proposalTitle}`,
      `Content: ${args.proposalContent}`,
      `Client: ${args.contactName}`,
    ];
    if (args.proposalAmount) contextParts.push(`Amount: $${args.proposalAmount.toLocaleString()}`);
    if (args.contactCompany) contextParts.push(`Company: ${args.contactCompany}`);
    if (args.contactIndustry) contextParts.push(`Industry: ${args.contactIndustry}`);
    if (args.contactNotes) contextParts.push(`Client Notes: ${args.contactNotes}`);
    if (args.competitionContext) contextParts.push(`Competition Context: ${args.competitionContext}`);

    return await callOpenRouter(systemPrompt, contextParts.join("\n\n"));
  },
});

export const draftFollowUpEmail = action({
  args: {
    proposalTitle: v.string(),
    proposalStatus: v.string(),
    contactName: v.string(),
    contactEmail: v.optional(v.string()),
    contactCompany: v.optional(v.string()),
    lastContactDate: v.optional(v.string()),
    relationshipStage: v.optional(v.string()),
    additionalContext: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const systemPrompt = `You are a professional sales representative drafting a follow-up email. Based on the proposal status, relationship context, and timing, write an appropriate follow-up email. The tone should be:

- If proposal is Draft/Revised: encouraging and offering to discuss further
- If proposal is Sent: checking in professionally, not pushy
- If proposal is Viewed: acknowledging interest, offering to answer questions
- If proposal is Accepted: expressing gratitude, outlining next steps
- If proposal is Declined: gracious, leaving door open for future opportunities
- If proposal is Expired: gentle re-engagement, offering updated terms

Include a subject line (prefixed with "Subject: ") and the email body. Use a professional but warm tone. Address the recipient by first name. Sign off with [Your Name]. Output only the email text.`;

    const contextParts = [
      `Proposal: ${args.proposalTitle}`,
      `Status: ${args.proposalStatus}`,
      `Recipient: ${args.contactName}`,
    ];
    if (args.contactEmail) contextParts.push(`Email: ${args.contactEmail}`);
    if (args.contactCompany) contextParts.push(`Company: ${args.contactCompany}`);
    if (args.lastContactDate) contextParts.push(`Last Contact: ${args.lastContactDate}`);
    if (args.relationshipStage) contextParts.push(`Relationship Stage: ${args.relationshipStage}`);
    if (args.additionalContext) contextParts.push(`Additional Context: ${args.additionalContext}`);

    return await callOpenRouter(systemPrompt, contextParts.join("\n\n"));
  },
});
