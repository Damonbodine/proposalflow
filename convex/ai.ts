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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const userMessage =
      typeof args.context === "string"
        ? args.context
        : JSON.stringify(args.context, null, 2);

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
  },
});
