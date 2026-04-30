import Papa from "papaparse";
import { CSV_COLUMNS, type CsvColumn, type RawUsageRow, type UsageRow } from "./types";

interface ParseUsageCsvResult {
  rows: UsageRow[];
  missingColumns: CsvColumn[];
  warnings: string[];
}

export function parseUsageCsv(csvText: string): ParseUsageCsvResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const fields = parsed.meta.fields ?? [];
  const missingColumns = CSV_COLUMNS.filter((column) => !fields.includes(column));
  const warnings = parsed.errors.map(
    (error) => `Row ${error.row ?? "unknown"}: ${error.message}`,
  );

  if (missingColumns.length > 0) {
    return {
      rows: [],
      missingColumns,
      warnings,
    };
  }

  const rows = parsed.data.map((rawRow, index) =>
    normalizeUsageRow(rawRow as RawUsageRow, index + 2),
  );

  return {
    rows,
    missingColumns,
    warnings,
  };
}

function normalizeUsageRow(row: RawUsageRow, rowNumber: number): UsageRow {
  return {
    rowNumber,
    date: row.Date.trim(),
    kind: row.Kind.trim(),
    model: row.Model.trim(),
    maxMode: parseBoolean(row["Max Mode"]),
    inputWithCacheWrite: parseTokenCount(row["Input (w/ Cache Write)"]),
    inputWithoutCacheWrite: parseTokenCount(row["Input (w/o Cache Write)"]),
    cacheRead: parseTokenCount(row["Cache Read"]),
    outputTokens: parseTokenCount(row["Output Tokens"]),
    totalTokens: parseTokenCount(row["Total Tokens"]),
    reportedCost: parseReportedCost(row.Cost),
  };
}

export function parseTokenCount(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value ?? "")
    .trim()
    .replace(/,/g, "");

  if (normalized === "" || normalized.toLowerCase() === "included") {
    return 0;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseReportedCost(value: string | number | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = String(value ?? "")
    .trim()
    .replace(/[$,]/g, "");

  if (normalized === "" || normalized.toLowerCase() === "included") {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean(value: string | boolean | null | undefined): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value ?? "").trim().toLowerCase();
  return ["1", "true", "yes", "y", "enabled", "max", "on"].includes(normalized);
}
