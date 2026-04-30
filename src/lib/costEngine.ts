import { resolveModel } from "./modelResolver";
import type {
  CalculatedUsageRow,
  CostComponentBreakdown,
  CostOptions,
  CostSummary,
  PricingCatalog,
  PricingModel,
  PricingRule,
  UsageRow,
} from "./types";

const emptyComponents: CostComponentBreakdown = {
  input: 0,
  cacheWrite: 0,
  cacheRead: 0,
  output: 0,
  teamsCursorTokenRate: 0,
  legacyMaxModeSurcharge: 0,
};

const defaultCostOptions: CostOptions = {
  includeTeamsCursorTokenRate: false,
  includeLegacyMaxModeSurcharge: false,
};

export function calculateUsageCosts(
  rows: UsageRow[],
  catalog: PricingCatalog,
  options: CostOptions = defaultCostOptions,
): CostSummary {
  const calculatedRows = rows.map((row) => calculateUsageRow(row, catalog, options));
  const totalsByComponent = calculatedRows.reduce(
    (totals, row) => addComponents(totals, row.components),
    { ...emptyComponents },
  );
  const totalReportedCost = sumReportedCost(rows);
  const warnings = Array.from(new Set(calculatedRows.flatMap((row) => row.warnings)));

  return {
    rows: calculatedRows,
    totalEstimatedCost: sumComponents(totalsByComponent),
    totalReportedCost,
    totalsByComponent,
    totalTokens: rows.reduce((sum, row) => sum + row.totalTokens, 0),
    rowCount: rows.length,
    partialEstimateCount: calculatedRows.filter((row) => row.isPartialEstimate).length,
    unmappedModelCount: calculatedRows.filter((row) => row.resolution.modelId === null).length,
    warnings,
  };
}

function calculateUsageRow(
  usage: UsageRow,
  catalog: PricingCatalog,
  options: CostOptions = defaultCostOptions,
): CalculatedUsageRow {
  const resolution = resolveModel(usage.model, catalog);
  const warnings: string[] = [];
  const appliedRules: string[] = [];
  let components = { ...emptyComponents };

  if (!resolution.model || !resolution.modelId) {
    warnings.push(resolution.warning ?? `No pricing model matched "${usage.model}".`);

    return {
      usage,
      resolution,
      components,
      estimatedCost: 0,
      isPartialEstimate: true,
      warnings,
      appliedRules,
    };
  }

  const model = resolution.model;
  const componentResult = calculateBaseComponents(usage, model);
  components = componentResult.components;
  warnings.push(...componentResult.warnings);
  const isPartialEstimate = componentResult.isPartialEstimate;

  for (const rule of model.rules) {
    const result = applyModelRule(rule, usage, components);
    components = result.components;
    warnings.push(...result.warnings);
    appliedRules.push(...result.appliedRules);
  }

  const globalResult = applyGlobalRules(
    catalog.globalRules,
    usage,
    resolution.modelId,
    components,
    options,
  );
  components = globalResult.components;
  warnings.push(...globalResult.warnings);
  appliedRules.push(...globalResult.appliedRules);

  if (model.warnings) {
    warnings.push(...model.warnings.map((warning) => `${model.displayName}: ${warning}`));
  }

  return {
    usage,
    resolution,
    components,
    estimatedCost: sumComponents(components),
    isPartialEstimate,
    warnings,
    appliedRules,
  };
}

function calculateBaseComponents(
  usage: UsageRow,
  model: PricingModel,
): {
  components: CostComponentBreakdown;
  warnings: string[];
  isPartialEstimate: boolean;
} {
  const components = { ...emptyComponents };
  const warnings: string[] = [];
  let isPartialEstimate = false;

  const componentInputs = [
    ["input", usage.inputWithoutCacheWrite, model.pricing.input],
    ["cacheWrite", usage.inputWithCacheWrite, model.pricing.cacheWrite],
    ["cacheRead", usage.cacheRead, model.pricing.cacheRead],
    ["output", usage.outputTokens, model.pricing.output],
  ] as const;

  for (const [component, tokens, price] of componentInputs) {
    if (tokens === 0) {
      continue;
    }

    if (price === null) {
      warnings.push(
        `${model.displayName}: ${component} has ${tokens} tokens but no published price.`,
      );
      isPartialEstimate = true;
      continue;
    }

    components[component] = pricePerMillion(tokens, price);
  }

  return {
    components,
    warnings,
    isPartialEstimate,
  };
}

function applyModelRule(
  rule: PricingRule,
  usage: UsageRow,
  components: CostComponentBreakdown,
): {
  components: CostComponentBreakdown;
  warnings: string[];
  appliedRules: string[];
} {
  if (rule.type === "request_cost_multiplier" && ruleMatchesUsage(rule, usage)) {
    return {
      components: multiplyComponents(components, rule.appliesTo, rule.multiplier ?? 1),
      warnings: sourceNoteWarning(rule),
      appliedRules: [rule.id],
    };
  }

  if (rule.type === "input_price_multiplier" && ruleMatchesUsage(rule, usage)) {
    return {
      components: multiplyComponents(components, rule.appliesTo, rule.multiplier ?? 1),
      warnings: sourceNoteWarning(rule),
      appliedRules: [rule.id],
    };
  }

  if (rule.type === "conditional_surcharge_multiplier") {
    return {
      components,
      warnings: [
        `${rule.id}: not applied because the CSV does not include routing provider data.`,
      ],
      appliedRules: [],
    };
  }

  if (rule.type === "informational_cache_discount" && rule.sourceNote) {
    return {
      components,
      warnings: [rule.sourceNote],
      appliedRules: [],
    };
  }

  return {
    components,
    warnings: [],
    appliedRules: [],
  };
}

function applyGlobalRules(
  rules: PricingRule[],
  usage: UsageRow,
  modelId: string,
  components: CostComponentBreakdown,
  options: CostOptions,
): {
  components: CostComponentBreakdown;
  warnings: string[];
  appliedRules: string[];
} {
  const nextComponents = { ...components };
  const warnings: string[] = [];
  const appliedRules: string[] = [];

  for (const rule of rules) {
    if (
      rule.type === "cursor_token_rate" &&
      options.includeTeamsCursorTokenRate &&
      modelId !== "auto" &&
      rule.rate?.allTokens !== undefined
    ) {
      nextComponents.teamsCursorTokenRate += pricePerMillion(
        usage.totalTokens,
        rule.rate.allTokens,
      );
      warnings.push(...sourceNoteWarning(rule));
      appliedRules.push(rule.id);
    }

    if (
      rule.type === "surcharge_multiplier" &&
      options.includeLegacyMaxModeSurcharge &&
      usage.maxMode &&
      rule.multiplier !== undefined
    ) {
      const currentSubtotal = sumComponents(nextComponents);
      nextComponents.legacyMaxModeSurcharge += currentSubtotal * (rule.multiplier - 1);
      warnings.push(...sourceNoteWarning(rule));
      appliedRules.push(rule.id);
    }
  }

  return {
    components: nextComponents,
    warnings,
    appliedRules,
  };
}

function ruleMatchesUsage(rule: PricingRule, usage: UsageRow): boolean {
  if (rule.trigger?.maxMode !== undefined && rule.trigger.maxMode !== usage.maxMode) {
    return false;
  }

  if (
    rule.trigger?.inputTokensGreaterThan !== undefined &&
    inputTokenTotal(usage) <= rule.trigger.inputTokensGreaterThan
  ) {
    return false;
  }

  return true;
}

function inputTokenTotal(usage: UsageRow): number {
  return usage.inputWithoutCacheWrite + usage.inputWithCacheWrite + usage.cacheRead;
}

function multiplyComponents(
  components: CostComponentBreakdown,
  appliesTo: PricingRule["appliesTo"],
  multiplier: number,
): CostComponentBreakdown {
  const nextComponents = { ...components };

  for (const component of appliesTo ?? []) {
    nextComponents[component] = nextComponents[component] * multiplier;
  }

  return nextComponents;
}

function sourceNoteWarning(rule: PricingRule): string[] {
  return rule.sourceNote ? [rule.sourceNote] : [];
}

function addComponents(
  left: CostComponentBreakdown,
  right: CostComponentBreakdown,
): CostComponentBreakdown {
  return {
    input: left.input + right.input,
    cacheWrite: left.cacheWrite + right.cacheWrite,
    cacheRead: left.cacheRead + right.cacheRead,
    output: left.output + right.output,
    teamsCursorTokenRate: left.teamsCursorTokenRate + right.teamsCursorTokenRate,
    legacyMaxModeSurcharge:
      left.legacyMaxModeSurcharge + right.legacyMaxModeSurcharge,
  };
}

function sumComponents(components: CostComponentBreakdown): number {
  return Object.values(components).reduce((sum, value) => sum + value, 0);
}

function pricePerMillion(tokens: number, price: number): number {
  return (tokens * price) / 1_000_000;
}

function sumReportedCost(rows: UsageRow[]): number | null {
  const reportedRows = rows.filter((row) => row.reportedCost !== null);

  if (reportedRows.length === 0) {
    return null;
  }

  return reportedRows.reduce((sum, row) => sum + (row.reportedCost ?? 0), 0);
}
