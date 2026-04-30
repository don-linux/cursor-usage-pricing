import { formatCurrency, formatInteger } from "../lib/format";
import type { CostSummary as CostSummaryData } from "../lib/types";

interface CostSummaryProps {
  summary: CostSummaryData;
}

export function CostSummary({ summary }: CostSummaryProps) {
  const reportedDifference =
    summary.totalReportedCost === null
      ? null
      : summary.totalEstimatedCost - summary.totalReportedCost;

  return (
    <section className="summary-grid" aria-label="Cost summary">
      <article className="metric-card metric-card--primary">
        <span>Estimated cost</span>
        <strong>{formatCurrency(summary.totalEstimatedCost)}</strong>
        <small>
          {summary.partialEstimateCount > 0
            ? `${summary.partialEstimateCount} partial rows`
            : "All rows priced"}
        </small>
      </article>

      <article className="metric-card">
        <span>Total tokens</span>
        <strong>{formatInteger(summary.totalTokens)}</strong>
        <small>{formatInteger(summary.rowCount)} usage rows</small>
      </article>

      <article className="metric-card">
        <span>CSV reported cost</span>
        <strong>
          {summary.totalReportedCost === null
            ? "Included"
            : formatCurrency(summary.totalReportedCost)}
        </strong>
        <small>
          {reportedDifference === null
            ? "Cursor may show included usage."
            : `${formatCurrency(reportedDifference)} difference`}
        </small>
      </article>

      <article className="metric-card">
        <span>Model mapping</span>
        <strong>{formatInteger(summary.unmappedModelCount)}</strong>
        <small>unmapped models</small>
      </article>
    </section>
  );
}
