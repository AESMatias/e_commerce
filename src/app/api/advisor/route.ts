import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { interpolate } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { buildAdvisorSystemPrompt } from "@/lib/advisor/prompt";
import { saveRecommendation } from "@/lib/advisor/recommendations";
import { getCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { checkAdvisorRateLimit, getClientIp } from "@/lib/rate-limit";
import type { PackageRecommendation } from "@/types/advisor";

export const maxDuration = 30;

// Override with GOOGLE_ADVISOR_MODEL when Google retires or renames a model.
const MODEL = process.env.GOOGLE_ADVISOR_MODEL?.trim() || "gemini-3.6-flash";
const MAX_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 500;
const MAX_INPUT_CHARS = 3000;

const requestSchema = z.object({
  messages: z
    .array(
      z.looseObject({
        role: z.enum(["user", "assistant", "system"]),
        parts: z.array(z.looseObject({ type: z.string() })),
      }),
    )
    .min(1)
    .max(MAX_MESSAGES),
});

function messageTextLength(message: UIMessage): number {
  return message.parts.reduce((sum, part) => (part.type === "text" ? sum + part.text.length : sum), 0);
}

function textLength(messages: UIMessage[]): number {
  return messages.reduce((total, message) => total + messageTextLength(message), 0);
}

function plainTextResponse(body: string, status: number, headers?: HeadersInit): Response {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", ...headers } });
}

export async function POST(request: Request) {
  // The chat runs on the same site, so the language cookie comes along.
  const { locale, t } = await getDictionary();
  const errors = t.advisor.errors;

  const rateLimit = await checkAdvisorRateLimit(getClientIp(request));
  if (!rateLimit.ok) {
    const message = rateLimit.scope === "ip" ? errors.tooManyFromIp : errors.tooManyGlobal;
    return plainTextResponse(message, 429, { "retry-after": String(rateLimit.retryAfterSeconds) });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return plainTextResponse(errors.notConfigured, 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return plainTextResponse(errors.invalidBody, 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return plainTextResponse(errors.invalidBody, 400);
  }

  const messages = parsed.data.messages as unknown as UIMessage[];
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user" && messageTextLength(lastMessage) > MAX_MESSAGE_CHARS) {
    return plainTextResponse(interpolate(errors.messageTooLong, { max: MAX_MESSAGE_CHARS }), 413);
  }

  if (textLength(messages) > MAX_INPUT_CHARS) {
    return plainTextResponse(errors.conversationTooLong, 413);
  }

  const catalog = await getCatalog(locale);
  const packageSlugs = catalog.flatMap((service) => service.packages.map((pkg) => pkg.slug));
  if (packageSlugs.length === 0) {
    return plainTextResponse(errors.catalogUnavailable, 503);
  }

  const recommendPackage = tool({
    description:
      "Recommend exactly one package from the catalog once you understand the visitor's problem. The interface renders the package details as a card.",
    inputSchema: z.object({
      packageSlug: z.enum(packageSlugs as [string, ...string[]]).describe("Slug of the recommended package"),
      problemSummary: z.string().max(500).describe("One sentence describing the visitor's business problem"),
      reasoning: z.string().max(600).describe("Why this package fits, addressed to the visitor"),
    }),
    execute: async ({ packageSlug, problemSummary, reasoning }): Promise<PackageRecommendation> => {
      const service = catalog.find((item) => item.packages.some((pkg) => pkg.slug === packageSlug));
      const servicePackage = service?.packages.find((pkg) => pkg.slug === packageSlug);

      if (!service || !servicePackage) {
        throw new Error(`Unknown package: ${packageSlug}`);
      }

      const recommendationId = await saveRecommendation({
        packageSlug,
        problemSummary,
        reasoning,
        model: MODEL,
      });

      return {
        recommendationId,
        packageSlug,
        serviceName: service.name,
        packageName: servicePackage.name,
        summary: servicePackage.summary,
        price: formatPrice(servicePackage.priceCents, servicePackage.currency, locale),
        deposit: formatPrice(servicePackage.depositCents, servicePackage.currency, locale),
        timeline: servicePackage.timeline,
        deliverables: servicePackage.deliverables,
        reasoning,
        bookingHref: `/book/${servicePackage.slug}`,
      };
    },
  });

  const result = streamText({
    model: google(MODEL),
    system: buildAdvisorSystemPrompt(catalog, locale),
    messages: convertToModelMessages(messages),
    tools: { recommendPackage },
    stopWhen: stepCountIs(3),
    temperature: 0.4,
    maxOutputTokens: 800,
    maxRetries: 1,
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error("[advisor] model call failed", { model: MODEL, error });
      return errors.modelFailed;
    },
  });
}
