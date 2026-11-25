const siteverifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const discordWebhookPathPattern = /^\/api\/webhooks\/\d+\/[^/]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const expectedHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME;
  const webhookValue = process.env.DISCORD_CONTACT_WEBHOOK_URL;

  if (!secret || !expectedHostname || !webhookValue) {
    console.error("Contact form is missing server configuration.");
    return jsonResponse({ error: "Contact delivery is not configured." }, 503);
  }

  let webhookUrl: URL;
  try {
    webhookUrl = new URL(webhookValue);
  } catch {
    console.error("Discord contact webhook configuration is invalid.");
    return jsonResponse({ error: "Contact delivery is not configured." }, 503);
  }

  if (
    webhookUrl.protocol !== "https:" ||
    webhookUrl.hostname !== "discord.com" ||
    webhookUrl.port ||
    webhookUrl.search ||
    webhookUrl.hash ||
    !discordWebhookPathPattern.test(webhookUrl.pathname)
  ) {
    console.error("Discord contact webhook configuration is invalid.");
    return jsonResponse({ error: "Contact delivery is not configured." }, 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "The request body must be valid JSON." }, 400);
  }

  if (
    !isRecord(body) ||
    typeof body.token !== "string" ||
    !body.token.trim() ||
    body.token.length > 2048
  ) {
    return jsonResponse({ error: "A valid Turnstile token is required." }, 400);
  }

  if (
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.message !== "string"
  ) {
    return jsonResponse({ error: "Name, email, and message are required." }, 400);
  }

  const name = body.name.trim();
  const email = body.email.trim();
  const message = body.message.trim();

  if (
    !name ||
    name.length > 80 ||
    !emailPattern.test(email) ||
    email.length > 254 ||
    !message ||
    message.length > 4000
  ) {
    return jsonResponse({ error: "Please check the contact form fields." }, 400);
  }

  const verificationBody = new URLSearchParams({
    secret,
    response: body.token.trim(),
  });

  let verificationResponse: Response;
  try {
    verificationResponse = await fetch(siteverifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verificationBody,
      cache: "no-store",
    });
  } catch (error) {
    console.error("Cloudflare Turnstile verification request failed.", error);
    return jsonResponse({ error: "Turnstile is temporarily unavailable." }, 502);
  }

  if (!verificationResponse.ok) {
    console.error(
      `Cloudflare Turnstile returned HTTP ${verificationResponse.status}.`,
    );
    return jsonResponse({ error: "Turnstile is temporarily unavailable." }, 502);
  }

  let verification: unknown;
  try {
    verification = await verificationResponse.json();
  } catch (error) {
    console.error("Cloudflare Turnstile returned invalid JSON.", error);
    return jsonResponse({ error: "Turnstile returned an invalid response." }, 502);
  }

  if (!isRecord(verification) || verification.success !== true) {
    return jsonResponse({ error: "Turnstile verification failed. Please try again." }, 400);
  }

  const hostname =
    typeof verification.hostname === "string"
      ? verification.hostname.toLowerCase()
      : "";
  const expected = expectedHostname.toLowerCase();
  const isLocalDevelopmentHost =
    process.env.NODE_ENV !== "production" &&
    (hostname === "localhost" || hostname === "127.0.0.1");

  if (hostname !== expected && !isLocalDevelopmentHost) {
    console.error("Turnstile token hostname did not match the configured host.");
    return jsonResponse({ error: "Turnstile hostname verification failed." }, 403);
  }

  let discordResponse: Response;
  try {
    discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title: "New portfolio contact",
            color: 0x5865f2,
            fields: [
              { name: "Name", value: name, inline: true },
              { name: "Email", value: email, inline: true },
            ],
            description: message,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
      cache: "no-store",
      redirect: "error",
    });
  } catch {
    console.error("Could not deliver the contact message to Discord.");
    return jsonResponse({ error: "Could not send your message. Please try again." }, 502);
  }

  if (!discordResponse.ok) {
    console.error(
      `Discord contact webhook returned HTTP ${discordResponse.status}.`,
    );
    return jsonResponse({ error: "Could not send your message. Please try again." }, 502);
  }

  return jsonResponse({ success: true }, 200);
}
