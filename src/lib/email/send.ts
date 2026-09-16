import "server-only";
import { siteConfig } from "@/config/site";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Sends a transactional email through Resend. This is not implemented yet!!!
 *
 * Never throws: a booking must stay confirmed even if the email fails, so
 * failures are logged and swallowed.
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.EMAIL_FROM ?? `${siteConfig.name} <onboarding@resend.dev>`;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      console.error(`Email to ${input.to} failed: ${response.status} ${await response.text()}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email request failed", error);
    return false;
  }
}
