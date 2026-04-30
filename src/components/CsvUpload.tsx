import { CSV_COLUMNS } from "../lib/types";

interface CsvUploadProps {
  fileName: string | null;
  error: string | null;
  onFileSelected: (file: File) => void;
}

export function CsvUpload({ fileName, error, onFileSelected }: CsvUploadProps) {
  return (
    <section className="upload-card" aria-labelledby="upload-title">
      <div>
        <p className="eyebrow">Local CSV import</p>
        <h2 id="upload-title">Upload your Cursor usage export</h2>
        <p className="muted">
          The file stays in your browser. The calculator expects the columns from the
          Cursor usage CSV export.
        </p>
      </div>

      <label className="dropzone">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              onFileSelected(file);
            }
          }}
        />
        <span>{fileName ?? "Choose a .csv file"}</span>
        <small>{fileName ? "Select another file to replace it." : "No login or backend required."}</small>
      </label>

      {error ? <p className="error-text">{error}</p> : null}

      <details className="columns-list">
        <summary>Expected columns</summary>
        <ul>
          {CSV_COLUMNS.map((column) => (
            <li key={column}>{column}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
