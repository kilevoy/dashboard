import { useMemo, useState } from "react";
import { demoData } from "../data/demoData";
import type { FilterState } from "../domain/types";
import { calculateSummary, filterInventory, filterOrders } from "../domain/metrics";
import { buildInsights } from "../domain/analytics";
import { formatCompactRub, formatPercent } from "../utils/formatters";
import { getPresetRange } from "../utils/dates";
import { AppShell, type PageId } from "../components/layout/AppShell";
import { GlobalFilters } from "../components/filters/GlobalFilters";
import { ExecutiveOverview } from "../pages/ExecutiveOverview";
import { SalesAnalytics } from "../pages/SalesAnalytics";
import { ClientsAnalysis } from "../pages/ClientsAnalysis";
import { ProductAnalytics } from "../pages/ProductAnalytics";
import { InventoryAnalytics } from "../pages/InventoryAnalytics";
import { ManagersPerformance } from "../pages/ManagersPerformance";
import { AccountsReceivable } from "../pages/AccountsReceivable";

const initialRange = getPresetRange("last12");

const initialFilters: FilterState = {
  preset: "last12",
  startDate: initialRange.startDate,
  endDate: initialRange.endDate,
  region: "Все",
  manager: "Все",
  productGroup: "Все",
  warehouse: "Все",
  clientType: "Все",
  paymentStatus: "Все",
  search: "",
};

export default function App() {
  const [page, setPage] = useState<PageId>("overview");
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const orders = useMemo(() => filterOrders(demoData.orders, filters), [filters]);
  const inventory = useMemo(() => filterInventory(demoData.inventory, filters), [filters]);
  const summary = calculateSummary(orders, inventory, demoData.managers);
  const insights = buildInsights(orders, inventory, demoData.managers);
  const report = `Выручка ${formatCompactRub(summary.revenue)}, маржа ${formatPercent(summary.marginPct)}, активных клиентов ${summary.activeClients}. ${insights[0]?.text ?? ""}`;

  return (
    <AppShell page={page} setPage={setPage} report={report}>
      <div className="mx-auto max-w-[1640px] space-y-6">
        <ExecutiveSummary report={report} ordersCount={orders.length} />
        <GlobalFilters filters={filters} managers={demoData.managers.map((manager) => manager.manager_name)} onChange={setFilters} />
        {page === "overview" ? <ExecutiveOverview orders={orders} inventory={inventory} managers={demoData.managers} /> : null}
        {page === "sales" ? <SalesAnalytics orders={orders} /> : null}
        {page === "clients" ? <ClientsAnalysis orders={orders} /> : null}
        {page === "products" ? <ProductAnalytics orders={orders} inventory={inventory} /> : null}
        {page === "inventory" ? <InventoryAnalytics inventory={inventory} /> : null}
        {page === "managers" ? <ManagersPerformance orders={orders} managers={demoData.managers} /> : null}
        {page === "debt" ? <AccountsReceivable orders={orders} /> : null}
      </div>
    </AppShell>
  );
}

function ExecutiveSummary({ report, ordersCount }: { report: string; ordersCount: number }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-2xl border border-line bg-[linear-gradient(135deg,#17324D_0%,#46627F_60%,#2F8F7B_100%)] p-5 text-white shadow-premium">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Панель руководителя</p>
          <h2 className="mt-2 font-display text-2xl font-bold md:text-4xl">Управление продажами, маржей и складом в одном срезе</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/78">
            В текущем фильтре анализируется {ordersCount.toLocaleString("ru-RU")} заказных строк. Dashboard помогает увидеть вклад регионов, клиентов, менеджеров, товарных групп и дебиторки без ручной сборки Excel-отчетов.
          </p>
        </div>
        <button className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-navy shadow-hairline hover:bg-slate-100" onClick={() => setOpen((value) => !value)}>
          Сформировать отчёт руководителю
        </button>
      </div>
      {open ? (
        <div className="mt-5 rounded-2xl bg-white/12 p-4 backdrop-blur">
          <p className="font-display text-base font-semibold">Краткое резюме</p>
          <p className="mt-2 text-sm leading-6 text-white/85">{report}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {["Пересмотреть скидки", "Усилить работу с дебиторкой", "Ускорить продажу медленно оборачиваемых SKU", "Перераспределить складские остатки"].map((item) => (
              <div key={item} className="rounded-xl bg-white/10 p-3 text-sm font-semibold">
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
