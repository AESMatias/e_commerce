import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { buildAdvisorSystemPrompt } from "@/lib/advisor/prompt";
import { saveRecommendation } from "@/lib/advisor/recommendations";
import { getCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { checkAdvisorRateLimit, getClientIp } from "@/lib/rate-limit";
import type { PackageRecommendation } from "@/types/advisor";

export const maxDuration = 30;

// Override with GOOGLE_ADVISOR_MODEL when Google retires or renames a model.
const MODEL = process.env.GOOGLE_ADVISOR_MODEL?.trim() || "gemini-3.6-flash";
const MAX_MESSAGES = 30;
const MAX_INPUT_CHARS = 8000;

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

function textLength(messages: UIMessage[]): number {
  return messages.reduce((total, message) => {
    const messageText = message.parts.reduce(
      (sum, part) => (part.type === "text" ? sum + part.text.length : sum),
      0,
    );
    return total + messageText;
  }, 0);
}

function plainTextResponse(body: string, status: number, headers?: HeadersInit): Response {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", ...headers } });
}

export async function POST(request: Request) {
  const rateLimit = checkAdvisorRateLimit(getClientIp(request));
  if (!rateLimit.ok) {
    const message =
      rateLimit.scope === "ip"
        ? "You have sent too many messages. Please wait a minute and try again."
        : "The advisor is handling too many conversations right now. Please try again later.";
    return plainTextResponse(message, 429, { "retry-after": String(rateLimit.retryAfterSeconds) });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return plainTextResponse("The AI advisor is not configured yet.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return plainTextResponse("Invalid request body.", 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return plainTextResponse("Invalid request body.", 400);
  }

  const messages = parsed.data.messages as unknown as UIMessage[];
  if (textLength(messages) > MAX_INPUT_CHARS) {
    return plainTextResponse("This conversation is too long. Please start a new one.", 413);
  }

  const catalog = await getCatalog();
  const packageSlugs = catalog.flatMap((service) => service.packages.map((pkg) => pkg.slug));
  if (packageSlugs.length === 0) {
    return plainTextResponse("The service catalog is unavailable right now.", 503);
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
        price: formatPrice(servicePackage.priceCents, servicePackage.currency),
        deposit: formatPrice(servicePackage.depositCents, servicePackage.currency),
        timeline: servicePackage.timeline,
        deliverables: servicePackage.deliverables,
        reasoning,
        bookingHref: `/book/${servicePackage.slug}`,
      };
    },
  });

  const result = streamText({
    model: google(MODEL),
    system: buildAdvisorSystemPrompt(catalog),
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
      return "The advisor could not answer right now. Please try again.";
    },
  });
}
