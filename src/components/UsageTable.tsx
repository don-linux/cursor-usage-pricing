import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { formatCurrency, formatInteger } from "../lib/format";
import type { CalculatedUsageRow } from "../lib/types";

interface UsageTableProps {
  rows: CalculatedUsageRow[];
}

const PAGE_SIZE = 50;

export function UsageTable({ rows }: UsageTableProps) {
  const [modelFilter, setModelFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [maxModeFilter, setMaxModeFilter] = useState("all");
  const [mappingFilter, setMappingFilter] = useState("all");

  const modelOptions = useMemo(() => uniqueSorted(rows.map((row) => row.usage.model)), [rows]);
  const kindOptions = useMemo(() => uniqueSorted(rows.map((row) => row.usage.kind)), [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const modelMatches = modelFilter === "all" || row.usage.model === modelFilter;
        const kindMatches = kindFilter === "all" || row.usage.kind === kindFilter;
        const maxModeMatches =
          maxModeFilter === "all" ||
          (maxModeFilter === "yes" ? row.usage.maxMode : !row.usage.maxMode);
        const mappingMatches =
          mappingFilter === "all" ||
          (mappingFilter === "mapped"
            ? row.resolution.modelId !== null
            : row.resolution.modelId === null);

        return modelMatches && kindMatches && maxModeMatches && mappingMatches;
      }),
    [kindFilter, mappingFilter, maxModeFilter, modelFilter, rows],
  );

  const columns = useMemo<ColumnDef<CalculatedUsageRow>[]>(
    () => [
      {
        header: "Date",
        accessorFn: (row) => row.usage.date,
      },
      {
        header: "Kind",
        accessorFn: (row) => row.usage.kind,
      },
      {
        header: "Model",
        cell: ({ row }) => (
          <div className="model-cell">
            <strong>{row.original.usage.model}</strong>
            <span>{row.original.resolution.model?.displayName ?? "Unmapped"}</span>
          </div>
        ),
      },
      {
        header: "Max Mode",
        cell: ({ row }) => (row.original.usage.maxMode ? "Yes" : "No"),
      },
      {
        header: "Tokens",
        cell: ({ row }) => formatInteger(row.original.usage.totalTokens),
      },
      {
        header: "Estimated cost",
        cell: ({ row }) => formatCurrency(row.original.estimatedCost),
      },
      {
        header: "Status",
        cell: ({ row }) => (
          <span className={row.original.isPartialEstimate ? "status partial" : "status"}>
            {row.original.isPartialEstimate ? "Partial" : "Priced"}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: PAGE_SIZE,
      },
    },
  });
  const paginationState = table.getState().pagination;

  return (
    <section className="panel" aria-labelledby="table-title">
      <div className="section-heading section-heading--row">
        <div>
          <p className="eyebrow">Usage detail</p>
          <h2 id="table-title">Rows and filters</h2>
        </div>
        <p className="muted">
          Showing {formatInteger(filteredRows.length)} of {formatInteger(rows.length)} rows.
        </p>
      </div>

      <div className="filters">
        <FilterSelect
          label="Model"
          value={modelFilter}
          onChange={setModelFilter}
          options={modelOptions}
        />
        <FilterSelect
          label="Kind"
          value={kindFilter}
          onChange={setKindFilter}
          options={kindOptions}
        />
        <label>
          Max Mode
          <select value={maxModeFilter} onChange={(event) => setMaxModeFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label>
          Mapping
          <select value={mappingFilter} onChange={(event) => setMappingFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="mapped">Mapped</option>
            <option value="unmapped">Unmapped</option>
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          Page {formatInteger(paginationState.pageIndex + 1)} of{" "}
          {formatInteger(table.getPageCount() || 1)}
        </span>
        <div>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
