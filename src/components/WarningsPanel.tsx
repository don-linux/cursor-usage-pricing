import type { CostSummary } from "../lib/types";

interface WarningsPanelProps {
  summary: CostSummary;
}

export function WarningsPanel({ summary }: WarningsPanelProps) {
  if (summary.warnings.length === 0) {
    return (
      <section className="panel panel--quiet">
        <h2>No warnings</h2>
        <p>The loaded rows mapped cleanly to the current pricing catalog.</p>
      </section>
    );
  }

  return (
    <section className="panel" aria-labelledby="warnings-title">
      <div className="section-heading">
        <p className="eyebrow">Review before relying on totals</p>
        <h2 id="warnings-title">Warnings and partial estimates</h2>
      </div>
      <ul className="warning-list">
        {summary.warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </section>
  );
}
