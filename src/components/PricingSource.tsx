import type { PricingSource as PricingSourceData } from "../lib/types";

interface PricingSourceProps {
  source: PricingSourceData;
}

export function PricingSource({ source }: PricingSourceProps) {
  return (
    <section className="source-card" aria-label="Pricing source">
      <div>
        <p className="eyebrow">Pricing source</p>
        <h2>{source.name}</h2>
        <p>
          Retrieved {source.retrievedAt}. Prices are stored in {source.currency}{" "}
          {source.unit.replace(/_/g, " ")}.
        </p>
      </div>
      <a href={source.url} target="_blank" rel="noreferrer">
        Open source
      </a>
    </section>
  );
}
