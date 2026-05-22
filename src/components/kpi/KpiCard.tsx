import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { KpiMetric } from "../../domain/types";

export function KpiCard({ metric, icon }: { metric: KpiMetric; icon: ReactNode }) {
  const isBad = metric.tone === "bad" || metric.tone === "warning";
  const isGood = metric.tone === "good";
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-premium">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-xl bg-board p-2 text-navy">{icon}</div>
        {metric.delta ? (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${isBad ? "bg-red-50 text-danger" : isGood ? "bg-emerald-50 text-mint" : "bg-slate-100 text-muted"}`}>
            {isBad ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            {metric.delta}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted">{metric.label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink">{metric.value}</p>
    </div>
  );
}
