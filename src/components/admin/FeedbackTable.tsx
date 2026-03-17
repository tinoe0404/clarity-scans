"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import type { FeedbackRecord } from "@/types";
import type { DateRangeOption } from "./DateRangeSelector";
import { adminFetch } from "@/lib/adminFetch";
import { handleClientError } from "@/lib/globalErrorHandler";

const EMOJI_MAP: Record<number, string> = { 1: "😌", 2: "🙂", 3: "😐", 4: "😟", 5: "😰" };

type SortCol = "created_at" | "anxiety_before" | "anxiety_after" | "reduction";
type SortDir = "asc" | "desc";

interface FeedbackTableProps {
  dateRange: DateRangeOption;
}

export default function FeedbackTable({ dateRange }: FeedbackTableProps) {
  const [rows, setRows] = useState<FeedbackRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<SortCol>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/feedback?page=${page}&pageSize=${pageSize}`);
      const json = await res.json();
      if (json.success) {
        setRows(json.data);
        setTotal(json.pagination.total);
      }
    } catch (error) {
      handleClientError(error, "FeedbackTable - fetchData");
    }
    finally { setLoading(false); }
  }, [page, pageSize]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when date range / page size changes
  useEffect(() => { setPage(1); }, [dateRange, pageSize]);

  // Client-side sort
  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      let av: number, bv: number;
      switch (sortCol) {
        case "created_at":
          av = new Date(a.created_at).getTime();
          bv = new Date(b.created_at).getTime();
          break;
        case "anxiety_before":
          av = a.anxiety_before ?? 0;
          bv = b.anxiety_before ?? 0;
          break;
        case "anxiety_after":
          av = a.anxiety_after ?? 0;
          bv = b.anxiety_after ?? 0;
          break;
        case "reduction":
          av = (a.anxiety_before ?? 0) - (a.anxiety_after ?? 0);
          bv = (b.anxiety_before ?? 0) - (b.anxiety_after ?? 0);
          break;
        default:
          return 0;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [rows, sortCol, sortDir]);

  // Client-side search on current page
  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((r) =>
      r.submitted_by.toLowerCase().includes(q) ||
      (r.comments?.toLowerCase().includes(q)) ||
      new Date(r.created_at).toLocaleDateString().includes(q)
    );
  }, [sorted, search]);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) return <ChevronDown className="ml-1 inline h-3 w-3 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp className="ml-1 inline h-3 w-3 text-brand-400" />
      : <ChevronDown className="ml-1 inline h-3 w-3 text-brand-400" />;
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card no-print">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-surface-border px-4 sm:px-6 py-4">
        <h3 className="text-sm font-medium text-slate-400">Raw Feedback</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-8 rounded-lg border border-white/10 bg-surface-base pl-8 pr-3 text-xs text-white placeholder:text-slate-600 focus:border-brand-500/40 focus:outline-none"
            />
          </div>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-8 rounded-lg border border-white/10 bg-surface-base px-2 text-xs text-white focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-xs">
          <thead>
            <tr className="border-b border-surface-border text-left text-slate-500">
              <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort("created_at")}>
                Date <SortIcon col="created_at" />
              </th>
              <th className="px-4 py-3">Lang</th>
              <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort("anxiety_before")}>
                Before <SortIcon col="anxiety_before" />
              </th>
              <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort("anxiety_after")}>
                After <SortIcon col="anxiety_after" />
              </th>
              <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort("reduction")}>
                Change <SortIcon col="reduction" />
              </th>
              <th className="px-4 py-3">Understood</th>
              <th className="px-4 py-3">Helpful</th>
              <th className="px-4 py-3">By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">No feedback records found.</td></tr>
            ) : (
              filtered.map((r) => {
                const reduction = (r.anxiety_before ?? 0) - (r.anxiety_after ?? 0);
                return (
                  <tr key={r.id} className="border-b border-surface-border last:border-0 text-slate-300 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      {new Date(r.created_at).toLocaleDateString("en-ZW", {
                        timeZone: "Africa/Harare", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-400">
                        {((r as unknown as Record<string, unknown>).language_used as string) ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.anxiety_before ? `${EMOJI_MAP[r.anxiety_before]} ${r.anxiety_before}` : "—"}</td>
                    <td className="px-4 py-3">{r.anxiety_after ? `${EMOJI_MAP[r.anxiety_after]} ${r.anxiety_after}` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={reduction > 0 ? "text-medical-green" : reduction < 0 ? "text-medical-red" : "text-slate-500"}>
                        {r.anxiety_before && r.anxiety_after ? (reduction > 0 ? `−${reduction}` : reduction === 0 ? "0" : `+${Math.abs(reduction)}`) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.understood_procedure === null ? "—" : r.understood_procedure ? "✓" : "✗"}</td>
                    <td className="px-4 py-3">{r.app_helpful === null ? "—" : r.app_helpful ? "✓" : "✗"}</td>
                    <td className="px-4 py-3 capitalize">{r.submitted_by}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-surface-border px-6 py-3">
        <span className="text-xs text-slate-500">
          Page {page} of {totalPages} · {total} records
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
