import { describe, expect, it } from "vitest";
import { parseReportedCost, parseTokenCount, parseUsageCsv } from "./csv";

const validCsv = `Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost
2026-04-01,agent,composer-2,true,"1,000",2000,300,400,3700,Included`;

describe("parseUsageCsv", () => {
  it("normalizes Cursor usage rows", () => {
    const result = parseUsageCsv(validCsv);

    expect(result.missingColumns).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      model: "composer-2",
      maxMode: true,
      inputWithCacheWrite: 1000,
      inputWithoutCacheWrite: 2000,
      cacheRead: 300,
      outputTokens: 400,
      totalTokens: 3700,
      reportedCost: null,
    });
  });

  it("reports missing expected columns", () => {
    const result = parseUsageCsv("Date,Kind\n2026-04-01,agent");

    expect(result.rows).toEqual([]);
    expect(result.missingColumns).toContain("Model");
  });
});

describe("numeric parsing", () => {
  it("parses token counts and reported costs", () => {
    expect(parseTokenCount("1,234")).toBe(1234);
    expect(parseTokenCount("Included")).toBe(0);
    expect(parseReportedCost("$1.25")).toBe(1.25);
    expect(parseReportedCost("Included")).toBeNull();
  });
});
