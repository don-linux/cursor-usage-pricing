export const CSV_COLUMNS = [
  "Date",
  "Kind",
  "Model",
  "Max Mode",
  "Input (w/ Cache Write)",
  "Input (w/o Cache Write)",
  "Cache Read",
  "Output Tokens",
  "Total Tokens",
  "Cost",
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];

export type RawUsageRow = Record<CsvColumn, string>;

export interface UsageRow {
  rowNumber: number;
  date: string;
  kind: string;
  model: string;
  maxMode: boolean;
  inputWithCacheWrite: number;
  inputWithoutCacheWrite: number;
  cacheRead: number;
  outputTokens: number;
  totalTokens: number;
  reportedCost: number | null;
}

export interface PricingCatalog {
  schemaVersion: number;
  source: PricingSource;
  normalization: {
    notes?: string[];
    effortSuffixesIgnoredForPricing?: string[];
  };
  globalRules: PricingRule[];
  models: Record<string, PricingModel>;
  unmappedCsvModels?: Array<{
    model: string;
    reason: string;
  }>;
}

export interface PricingSource {
  name: string;
  url: string;
  retrievedAt: string;
  currency: string;
  unit: string;
}

export interface PricingModel {
  displayName: string;
  provider: string;
  pool: string;
  derivedFrom?: string;
  aliases: string[];
  matchers: ModelMatcher[];
  pricing: ModelPricing;
  rules: PricingRule[];
  warnings?: string[];
}

interface ModelPricing {
  input: number | null;
  cacheWrite: number | null;
  cacheRead: number | null;
  output: number | null;
  imageOutput?: number | null;
}

export type ModelMatcher =
  | {
      type: "exact";
      value: string;
      excludeContains?: string[];
    }
  | {
      type: "prefix";
      value: string;
      excludeContains?: string[];
    }
  | {
      type: "contains_all";
      values: string[];
      excludeContains?: string[];
    };

export interface PricingRule {
  id: string;
  type: string;
  trigger?: {
    inputTokensGreaterThan?: number;
    maxMode?: boolean;
    routingProviderIn?: string[];
  };
  appliesWhen?: {
    auto?: boolean;
    maxMode?: boolean;
  };
  appliesTo?: Array<"input" | "cacheWrite" | "cacheRead" | "output">;
  multiplier?: number;
  rate?: {
    allTokens?: number;
  };
  unit?: string;
  planScope?: string;
  baseModelId?: string;
  sourceNote?: string;
}

export interface ModelResolution {
  modelId: string | null;
  model: PricingModel | null;
  normalizedName: string;
  matchedBy: "alias" | "matcher" | "suffix" | "unmapped";
  warning?: string;
}

export interface CostOptions {
  includeTeamsCursorTokenRate: boolean;
  includeLegacyMaxModeSurcharge: boolean;
}

export interface CostComponentBreakdown {
  input: number;
  cacheWrite: number;
  cacheRead: number;
  output: number;
  teamsCursorTokenRate: number;
  legacyMaxModeSurcharge: number;
}

export interface CalculatedUsageRow {
  usage: UsageRow;
  resolution: ModelResolution;
  components: CostComponentBreakdown;
  estimatedCost: number;
  isPartialEstimate: boolean;
  warnings: string[];
  appliedRules: string[];
}

export interface CostSummary {
  rows: CalculatedUsageRow[];
  totalEstimatedCost: number;
  totalReportedCost: number | null;
  totalsByComponent: CostComponentBreakdown;
  totalTokens: number;
  rowCount: number;
  partialEstimateCount: number;
  unmappedModelCount: number;
  warnings: string[];
}
