import { describe, it, expect } from "vitest";
import { dictionaries } from "@/i18n/dictionaries";
import { findMatchingScenario, buildCachedRecommendation } from "@/lib/advisor/scenarios";
import { isPackageRecommendation } from "@/types/advisor";

describe("Advisor Chatbot cached starter scenarios", () => {
  it("provides exactly 4 starter prompt suggestions in both English and Spanish", () => {
    expect(dictionaries.en.advisor.suggestions).toHaveLength(4);
    expect(dictionaries.es.advisor.suggestions).toHaveLength(4);
  });

  it("matches all 4 English suggestion options without invoking the LLM", () => {
    for (const suggestion of dictionaries.en.advisor.suggestions) {
      const scenario = findMatchingScenario(suggestion);
      expect(scenario).not.toBeNull();
      if (scenario) {
        const recommendation = buildCachedRecommendation(scenario, "en", []);
        expect(isPackageRecommendation(recommendation)).toBe(true);
        expect(recommendation.bookingHref).toBe(`/book/${scenario.packageSlug}`);
      }
    }
  });

  it("matches all 4 Spanish suggestion options without invoking the LLM", () => {
    for (const suggestion of dictionaries.es.advisor.suggestions) {
      const scenario = findMatchingScenario(suggestion);
      expect(scenario).not.toBeNull();
      if (scenario) {
        const recommendation = buildCachedRecommendation(scenario, "es", []);
        expect(isPackageRecommendation(recommendation)).toBe(true);
        expect(recommendation.bookingHref).toBe(`/book/${scenario.packageSlug}`);
      }
    }
  });
});
