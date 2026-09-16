import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type SaveRecommendationInput = {
  packageSlug: string;
  problemSummary: string;
  reasoning: string;
  model: string;
};

/**
 * Stores the recommendation so a later booking can be linked to it.
 * Never throws: a logging failure must not break the conversation.
 */
export async function saveRecommendation(input: SaveRecommendationInput): Promise<string | null> {
  try {
    const supabase = createAdminClient();

    const { data: servicePackage, error: packageError } = await supabase
      .from("service_packages")
      .select("id")
      .eq("slug", input.packageSlug)
      .single();

    if (packageError || !servicePackage) return null;

    const { data, error } = await supabase
      .from("advisor_recommendations")
      .insert({
        package_id: servicePackage.id,
        problem_summary: input.problemSummary,
        model: input.model,
        response: {
          package_slug: input.packageSlug,
          problem_summary: input.problemSummary,
          reasoning: input.reasoning,
        },
      })
      .select("id")
      .single();

    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
}
