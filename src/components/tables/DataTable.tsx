import { Download, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, EmptyState } from "../ui/Card";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sort?: (row: T) => string | number;
  align?: "left" | "right";
}

function valueOf<T>(row: T, column: Column<T>) {
  if (column.sort) return column.sort(row);
  return String((row as Record<string, unknown>)[String(column.key)] ?? "");
}

function exportCsv<T>(rows: T[], columns: Column<T>[], filename: string) {
  const header = columns.map((column) => column.header).join(";");
  const body = rows
    .map((row) =>
      columns
        .map((column) => {
          const raw = valueOf(row, column);
          return `"${String(raw).replaceAll('"', '""')}"`;
        })
        .join(";"),
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataTable<T extends object>({ title, rows, columns, filename = "export.csv" }: { title: string; rows: T[]; columns: Column<T>[]; filename?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(String(columns[0]?.key ?? ""));
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    setQuery("");
    setSortKey(String(columns[0]?.key ?? ""));
    setDirection("desc");
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [columns, filename, title]);
  const visibleRows = useMemo(() => {
    const normalized = query.toLowerCase();
    const filtered = normalized ? rows.filter((row) => JSON.stringify(row).toLowerCase().includes(normalized)) : rows;
    const column = columns.find((item) => String(item.key) === sortKey) ?? columns[0];
    return [...filtered]
      .sort((a, b) => {
        const av = valueOf(a, column);
        const bv = valueOf(b, column);
        if (typeof av === "number" && typeof bv === "number") return direction === "asc" ? av - bv : bv - av;
        return direction === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      })
      .slice(0, 100);
  }, [columns, direction, query, rows, sortKey]);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={title}
        subtitle={`${rows.length} строк в текущем срезе`}
        action={
          <button className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-navy shadow-hairline hover:bg-board" onClick={() => exportCsv(visibleRows, columns, filename)}>
            <Download size={16} /> CSV
          </button>
        }
      />
      <div className="border-b border-line p-4">
        <label className="flex max-w-md items-center gap-2 rounded-xl border border-line bg-board px-3 py-2 text-sm text-muted">
          <Search size={16} />
          <input className="w-full bg-transparent outline-none" placeholder="Поиск по таблице" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>
      {visibleRows.length ? (
        <div ref={scrollRef} className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-board text-xs uppercase tracking-[0.06em] text-muted">
              <tr>
                {columns.map((column) => (
                  <th key={String(column.key)} className={`px-4 py-3 font-semibold ${column.align === "right" ? "text-right" : "text-left"}`}>
                    <button
                      onClick={() => {
                        setSortKey(String(column.key));
                        setDirection(sortKey === String(column.key) && direction === "desc" ? "asc" : "desc");
                      }}
                    >
                      {column.header}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visibleRows.map((row, index) => (
                <tr key={index} className="hover:bg-board/70">
                  {columns.map((column) => (
                    <td key={String(column.key)} className={`px-4 py-3 text-ink ${column.align === "right" ? "text-right" : "text-left"}`}>
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[String(column.key)] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-5">
          <EmptyState />
        </div>
      )}
    </Card>
  );
}
