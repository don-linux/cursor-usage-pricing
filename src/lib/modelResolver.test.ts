import { describe, expect, it } from "vitest";
import { resolveModel } from "./modelResolver";
import { pricingCatalog } from "./pricingCatalog";

describe("resolveModel", () => {
  it("matches aliases exactly before falling back to matchers", () => {
    const result = resolveModel("composer-2-fast", pricingCatalog);

    expect(result.modelId).toBe("composer-2");
    expect(result.matchedBy).toBe("alias");
  });

  it("matches normalized model names with punctuation variants", () => {
    const result = resolveModel("grok_4_20_thinking", pricingCatalog);

    expect(result.modelId).toBe("grok-4.20");
  });

  it("returns an unmapped resolution when no model matches", () => {
    const result = resolveModel("not-a-real-model", pricingCatalog);

    expect(result.modelId).toBeNull();
    expect(result.matchedBy).toBe("unmapped");
  });
});
