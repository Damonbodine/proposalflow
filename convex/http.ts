import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const eventType = body.type;
    if (eventType === "user.created" || eventType === "user.updated") {
      const userData = body.data;
      const email =
        userData.email_addresses?.find(
          (e: any) => e.id === userData.primary_email_address_id
        )?.email_address ?? "";
      const name =
        [userData.first_name, userData.last_name].filter(Boolean).join(" ") ||
        email;
      await ctx.runMutation(api.users.createFromClerk, {
        clerkId: userData.id,
        name,
        email,
        avatarUrl: userData.image_url,
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
