import { CalendarRange, RotateCcw, Search } from "lucide-react";
import type { FilterState } from "../../domain/types";
import { dictionaries } from "../../data/generateSyntheticData";
import { getPresetRange } from "../../utils/dates";

interface Props {
  filters: FilterState;
  managers: string[];
  onChange: (filters: FilterState) => void;
}

export function GlobalFilters({ filters, managers, onChange }: Props) {
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    if (key === "preset" && value !== "custom") {
      const preset = value as FilterState["preset"];
      onChange({ ...filters, preset, ...getPresetRange(preset) });
    }
    else onChange({ ...filters, [key]: value });
  };
  const reset = () => onChange({ ...filters, ...getPresetRange("last12"), preset: "last12", region: "Все", manager: "Все", productGroup: "Все", warehouse: "Все", clientType: "Все", paymentStatus: "Все", search: "" });
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-premium">
      <div className="grid gap-3 lg:grid-cols-[1.15fr_1.45fr_1fr_auto]">
        <div className="flex flex-wrap gap-2">
          {(["YTD", "last12", "quarter", "custom"] as const).map((preset) => (
            <button key={preset} className={`rounded-xl px-3 py-2 text-sm font-semibold ${filters.preset === preset ? "bg-navy text-white" : "bg-board text-steel hover:bg-slate-200"}`} onClick={() => update("preset", preset)}>
              {preset === "YTD" ? "YTD" : preset === "last12" ? "12 месяцев" : preset === "quarter" ? "Квартал" : "Период"}
            </button>
          ))}
        </div>
        <label className="grid min-w-0 grid-cols-[auto_1fr] items-center gap-x-2 gap-y-2 rounded-xl border border-line bg-board px-3 py-2 text-sm text-muted sm:flex">
          <CalendarRange size={16} />
          <input className="min-w-0 bg-transparent outline-none" type="date" value={filters.startDate} onChange={(e) => onChange({ ...filters, preset: "custom", startDate: e.target.value })} />
          <span className="hidden sm:inline">—</span>
          <input className="col-start-2 min-w-0 bg-transparent outline-none sm:col-auto" type="date" value={filters.endDate} onChange={(e) => onChange({ ...filters, preset: "custom", endDate: e.target.value })} />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-board px-3 py-2 text-sm text-muted">
          <Search size={16} />
          <input className="w-full bg-transparent outline-none" placeholder="Клиент, SKU, менеджер" value={filters.search} onChange={(e) => update("search", e.target.value)} />
        </label>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-navy hover:bg-board" onClick={reset}>
          <RotateCcw size={16} /> Сбросить
        </button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Select label="Регион" value={filters.region} onChange={(v) => update("region", v as FilterState["region"])} options={["Все", ...dictionaries.regions]} />
        <Select label="Менеджер" value={filters.manager} onChange={(v) => update("manager", v)} options={["Все", ...managers]} />
        <Select label="Группа" value={filters.productGroup} onChange={(v) => update("productGroup", v as FilterState["productGroup"])} options={["Все", ...dictionaries.groups]} />
        <Select label="Склад" value={filters.warehouse} onChange={(v) => update("warehouse", v as FilterState["warehouse"])} options={["Все", ...dictionaries.warehouses]} />
        <Select label="Тип клиента" value={filters.clientType} onChange={(v) => update("clientType", v as FilterState["clientType"])} options={["Все", ...dictionaries.clientTypes]} />
        <Select label="Оплата" value={filters.paymentStatus} onChange={(v) => update("paymentStatus", v as FilterState["paymentStatus"])} options={["Все", "Оплачен", "Частично оплачен", "Ожидает оплаты", "Просрочен"]} />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-muted">{label}</span>
      <select className="w-full rounded-xl border border-line bg-board px-3 py-2 text-sm font-medium text-ink outline-none focus:border-steel" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
