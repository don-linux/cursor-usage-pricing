import type {
  ModelMatcher,
  ModelResolution,
  PricingCatalog,
  PricingModel,
} from "./types";

type ModelEntry = [string, PricingModel];

interface ModelResolverIndex {
  aliases: Map<string, ModelEntry>;
  matcherModels: ModelEntry[];
  ignoredSuffixes: string[];
}

const catalogIndexCache = new WeakMap<PricingCatalog, ModelResolverIndex>();

export function resolveModel(
  rawModelName: string,
  catalog: PricingCatalog,
): ModelResolution {
  const index = getResolverIndex(catalog);
  const normalizedName = normalizeModelName(rawModelName);
  const aliasMatch = findAliasMatch(normalizedName, index);

  if (aliasMatch) {
    return toResolution(aliasMatch, normalizedName, "alias");
  }

  const matcherMatch = findMatcherMatch(normalizedName, index);

  if (matcherMatch) {
    return toResolution(matcherMatch, normalizedName, "matcher");
  }

  const suffixMatch = findIgnoredSuffixMatch(normalizedName, index);

  if (suffixMatch) {
    return toResolution(suffixMatch, normalizedName, "suffix");
  }

  return {
    modelId: null,
    model: null,
    normalizedName,
    matchedBy: "unmapped",
    warning: `No pricing model matched "${rawModelName}".`,
  };
}

function normalizeModelName(modelName: string): string {
  return modelName
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getResolverIndex(catalog: PricingCatalog): ModelResolverIndex {
  const cachedIndex = catalogIndexCache.get(catalog);

  if (cachedIndex) {
    return cachedIndex;
  }

  const aliases = new Map<string, ModelEntry>();
  const matcherModels = Object.entries(catalog.models);

  for (const [modelId, model] of Object.entries(catalog.models)) {
    const modelAliases = [modelId, model.displayName, ...model.aliases].map(normalizeModelName);

    for (const alias of modelAliases) {
      if (!aliases.has(alias)) {
        aliases.set(alias, [modelId, model]);
      }
    }
  }

  const index = {
    aliases,
    matcherModels,
    ignoredSuffixes:
      catalog.normalization.effortSuffixesIgnoredForPricing?.map(normalizeModelName) ?? [],
  };

  catalogIndexCache.set(catalog, index);
  return index;
}

function findAliasMatch(
  normalizedName: string,
  index: ModelResolverIndex,
): ModelEntry | null {
  return index.aliases.get(normalizedName) ?? null;
}

function findMatcherMatch(
  normalizedName: string,
  index: ModelResolverIndex,
): ModelEntry | null {
  let bestMatch: ModelEntry | null = null;

  for (const [modelId, model] of index.matcherModels) {
    if (model.matchers.some((matcher) => matchesMatcher(normalizedName, matcher))) {
      if (!bestMatch || modelId.length > bestMatch[0].length) {
        bestMatch = [modelId, model];
      }
    }
  }

  return bestMatch;
}

function findIgnoredSuffixMatch(
  normalizedName: string,
  index: ModelResolverIndex,
): ModelEntry | null {
  for (const normalizedSuffix of index.ignoredSuffixes) {
    if (!normalizedName.endsWith(`-${normalizedSuffix}`)) {
      continue;
    }

    const strippedName = normalizedName.slice(0, -normalizedSuffix.length - 1);
    return findAliasMatch(strippedName, index) ?? findMatcherMatch(strippedName, index);
  }

  return null;
}

function matchesMatcher(normalizedName: string, matcher: ModelMatcher): boolean {
  if (hasExcludedTerm(normalizedName, matcher.excludeContains)) {
    return false;
  }

  if (matcher.type === "exact") {
    return normalizedName === normalizeModelName(matcher.value);
  }

  if (matcher.type === "prefix") {
    return normalizedName.startsWith(normalizeModelName(matcher.value));
  }

  return matcher.values.every((value) => normalizedName.includes(normalizeModelName(value)));
}

function hasExcludedTerm(
  normalizedName: string,
  excludeContains: string[] | undefined,
): boolean {
  return (
    excludeContains?.some((term) => normalizedName.includes(normalizeModelName(term))) ?? false
  );
}

function toResolution(
  [modelId, model]: ModelEntry,
  normalizedName: string,
  matchedBy: ModelResolution["matchedBy"],
): ModelResolution {
  return {
    modelId,
    model,
    normalizedName,
    matchedBy,
  };
}
