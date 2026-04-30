import { describe, expect, it } from "vitest";
import { calculateUsageCosts } from "./costEngine";
import { pricingCatalog } from "./pricingCatalog";
import type { UsageRow } from "./types";

const baseUsageRow: UsageRow = {
  rowNumber: 2,
  date: "2026-04-01",
  kind: "agent",
  model: "composer-2",
  maxMode: false,
  inputWithCacheWrite: 0,
  inputWithoutCacheWrite: 1_000_000,
  cacheRead: 1_000_000,
  outputTokens: 1_000_000,
  totalTokens: 3_000_000,
  reportedCost: null,
};

describe("calculateUsageCosts", () => {
  it("calculates component totals from per-million token prices", () => {
    const summary = calculateUsageCosts([baseUsageRow], pricingCatalog);

    expect(summary.totalsByComponent.input).toBe(0.5);
    expect(summary.totalsByComponent.cacheRead).toBe(0.2);
    expect(summary.totalsByComponent.output).toBe(2.5);
    expect(summary.totalEstimatedCost).toBe(3.2);
  });

  it("marks unmapped models as partial estimates", () => {
    const summary = calculateUsageCosts(
      [{ ...baseUsageRow, model: "unknown-model" }],
      pricingCatalog,
    );

    expect(summary.unmappedModelCount).toBe(1);
    expect(summary.partialEstimateCount).toBe(1);
    expect(summary.totalEstimatedCost).toBe(0);
  });

  it("applies optional Teams Cursor Token Rate when enabled", () => {
    const summary = calculateUsageCosts([baseUsageRow], pricingCatalog, {
      includeTeamsCursorTokenRate: true,
      includeLegacyMaxModeSurcharge: false,
    });

    expect(summary.totalsByComponent.teamsCursorTokenRate).toBe(0.75);
    expect(summary.totalEstimatedCost).toBe(3.95);
  });

  it("applies threshold model rules", () => {
    const summary = calculateUsageCosts(
      [
        {
          ...baseUsageRow,
          model: "claude-4.6-sonnet",
          inputWithoutCacheWrite: 201_000,
          cacheRead: 0,
          outputTokens: 1_000,
          totalTokens: 202_000,
        },
      ],
      pricingCatalog,
    );

    expect(summary.rows[0].appliedRules).toContain("input-over-200k-2x");
    expect(summary.totalEstimatedCost).toBeCloseTo(1.236);
  });
});
