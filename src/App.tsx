import { useCallback, useMemo, useReducer } from "react";
import cursorLockup from "../.cursor/skills/cursor-brand/assets/logos/General Logos/Lockup Horizontal/SVG/LOCKUP_HORIZONTAL_2D_LIGHT.svg";
import { CostSummary } from "./components/CostSummary";
import { CsvUpload } from "./components/CsvUpload";
import { PricingSource } from "./components/PricingSource";
import { UsageTable } from "./components/UsageTable";
import { WarningsPanel } from "./components/WarningsPanel";
import { calculateUsageCosts } from "./lib/costEngine";
import { parseUsageCsv } from "./lib/csv";
import { pricingCatalog } from "./lib/pricingCatalog";
import type { CostOptions, UsageRow } from "./lib/types";

interface AppState {
  rows: UsageRow[];
  fileName: string | null;
  parseWarnings: string[];
  error: string | null;
  costOptions: CostOptions;
}

type AppAction =
  | {
      type: "file-selected";
      fileName: string;
    }
  | {
      type: "file-error";
      error: string;
      parseWarnings?: string[];
    }
  | {
      type: "csv-loaded";
      rows: UsageRow[];
      parseWarnings: string[];
    }
  | {
      type: "cost-option-changed";
      option: keyof CostOptions;
      value: boolean;
    };

const initialState: AppState = {
  rows: [],
  fileName: null,
  parseWarnings: [],
  error: null,
  costOptions: {
    includeTeamsCursorTokenRate: false,
    includeLegacyMaxModeSurcharge: false,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "file-selected":
      return {
        ...state,
        fileName: action.fileName,
        error: null,
      };
    case "file-error":
      return {
        ...state,
        rows: [],
        error: action.error,
        parseWarnings: action.parseWarnings ?? [],
      };
    case "csv-loaded":
      return {
        ...state,
        rows: action.rows,
        parseWarnings: action.parseWarnings,
        error: null,
      };
    case "cost-option-changed":
      return {
        ...state,
        costOptions: {
          ...state.costOptions,
          [action.option]: action.value,
        },
      };
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const summary = useMemo(
    () => calculateUsageCosts(state.rows, pricingCatalog, state.costOptions),
    [state.costOptions, state.rows],
  );

  const handleFileSelected = useCallback(async (file: File) => {
    dispatch({ type: "file-selected", fileName: file.name });

    if (!file.name.toLowerCase().endsWith(".csv")) {
      dispatch({
        type: "file-error",
        error: "Please select a CSV file exported from Cursor.",
      });
      return;
    }

    const text = await file.text();
    const parsed = parseUsageCsv(text);

    if (parsed.missingColumns.length > 0) {
      dispatch({
        type: "file-error",
        error: `Missing columns: ${parsed.missingColumns.join(", ")}.`,
        parseWarnings: parsed.warnings,
      });
      return;
    }

    dispatch({
      type: "csv-loaded",
      rows: parsed.rows,
      parseWarnings: parsed.warnings,
    });
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <nav aria-label="Brand">
          <img src={cursorLockup} alt="Cursor" className="brand-lockup" />
          <span>Usage pricing</span>
        </nav>
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Token cost estimator</p>
            <h1>Estimate the real cost of your Cursor usage</h1>
            <p>
              Upload a Cursor usage CSV and calculate estimated token cost locally
              against the versioned pricing catalog in this repo.
            </p>
          </div>
          <div className="hero-note">
            <strong>No account required.</strong>
            <span>
              Cursor may show included usage in the export. This app estimates what
              the consumed tokens would cost at published token rates.
            </span>
          </div>
        </div>
      </section>

      <CsvUpload
        fileName={state.fileName}
        error={state.error}
        onFileSelected={handleFileSelected}
      />

      <section className="assumptions-card" aria-labelledby="assumptions-title">
        <div>
          <p className="eyebrow">Pricing assumptions</p>
          <h2 id="assumptions-title">Optional rules</h2>
          <p className="muted">
            These rules depend on plan context that is not always present in the CSV.
          </p>
        </div>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={state.costOptions.includeTeamsCursorTokenRate}
            onChange={(event) =>
              dispatch({
                type: "cost-option-changed",
                option: "includeTeamsCursorTokenRate",
                value: event.target.checked,
              })
            }
          />
          Include Teams Cursor Token Rate
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={state.costOptions.includeLegacyMaxModeSurcharge}
            onChange={(event) =>
              dispatch({
                type: "cost-option-changed",
                option: "includeLegacyMaxModeSurcharge",
                value: event.target.checked,
              })
            }
          />
          Include legacy Max Mode surcharge
        </label>
      </section>

      {state.rows.length > 0 ? (
        <>
          <CostSummary summary={summary} />
          {state.parseWarnings.length > 0 ? (
            <section className="panel">
              <h2>CSV parse notes</h2>
              <ul className="warning-list">
                {state.parseWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </section>
          ) : null}
          <WarningsPanel summary={summary} />
          <UsageTable rows={summary.rows} />
        </>
      ) : (
        <section className="empty-state">
          <p>Load a CSV to see estimated cost, warnings, and row-level pricing.</p>
        </section>
      )}

      <PricingSource source={pricingCatalog.source} />
    </main>
  );
}

export default App;
