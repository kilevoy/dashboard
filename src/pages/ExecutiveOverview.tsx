import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { Banknote, Boxes, Gauge, Percent, Receipt, Target, TrendingUp, Users } from "lucide-react";
import type { InventoryItem, Manager, Order } from "../domain/types";
import { aggregateOrders, calculateSummary, clientRows, planByManager, revenueByMonth } from "../domain/metrics";
import { buildInsights } from "../domain/analytics";
import { buildRiskAlerts } from "../domain/riskScoring";
import { formatCompactRub, formatNumber, formatPercent, formatRub } from "../utils/formatters";
import { iso, monthKey, monthLabel, TODAY } from "../utils/dates";
import { KpiCard } from "../components/kpi/KpiCard";
import { ChartCard } from "../components/charts/ChartCard";
import { InsightsPanel, RiskAlertsPanel } from "../components/insights/InsightsPanel";
import { DataTable } from "../components/tables/DataTable";
import { Badge } from "../components/ui/Card";

export function ExecutiveOverview({ orders, comparisonOrders, inventory, managers }: { orders: Order[]; comparisonOrders: Order[]; inventory: InventoryItem[]; managers: Manager[] }) {
  const summary = calculateSummary(orders, inventory, managers);
  const months = revenueByMonth(orders).map((item) => ({ ...item, label: monthLabel(item.month) }));
  const period = buildPeriodComparison(comparisonOrders);
  const regions = aggregateOrders(orders, "region").slice(0, 8);
  const clients = clientRows(orders);
  const groups = aggregateOrders(orders, "product_group").slice(0, 8);
  const managerPlan = planByManager(orders, managers).slice(0, 10);
  const debtClients = clients.filter((client) => client.overdueDebt > 0).slice(0, 10);
  const insights = buildInsights(orders, inventory, managers);
  const alerts = buildRiskAlerts(orders, inventory);
  const kpis = [
    { label: "Выручка", value: formatCompactRub(summary.revenue), delta: period.revenueDelta.label, tone: period.revenueDelta.tone, icon: <TrendingUp size={20} /> },
    { label: "Валовая прибыль", value: formatCompactRub(summary.grossProfit), delta: period.grossProfitDelta.label, tone: period.grossProfitDelta.tone, icon: <Banknote size={20} /> },
    { label: "Маржинальность", value: formatPercent(summary.marginPct), delta: period.marginDelta.label, tone: period.marginDelta.tone, icon: <Percent size={20} /> },
    { label: "Активные клиенты", value: formatNumber(summary.activeClients), delta: period.clientsDelta.label, tone: period.clientsDelta.tone, icon: <Users size={20} /> },
    { label: "Средний чек", value: formatCompactRub(summary.averageOrderValue), delta: period.averageOrderDelta.label, tone: period.averageOrderDelta.tone, icon: <Receipt size={20} /> },
    { label: "Просроченная дебиторка", value: formatCompactRub(summary.overdueDebt), delta: formatPercent(summary.overdueDebt / Math.max(1, summary.revenue)), tone: summary.overdueDebt / Math.max(1, summary.revenue) > 0.12 ? "bad" as const : "warning" as const, icon: <Banknote size={20} /> },
    { label: "Выполнение плана", value: formatPercent(summary.planCompletionPct), delta: summary.planCompletionPct > 1 ? "выше плана" : "ниже плана", tone: summary.planCompletionPct > 1 ? "good" as const : "warning" as const, icon: <Target size={20} /> },
    { label: "Оборачиваемость склада", value: `${summary.inventoryTurnover.toFixed(1)}x`, delta: `${Math.round(summary.dso)} DSO`, tone: "neutral" as const, icon: <Boxes size={20} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric) => (
          <KpiCard key={metric.label} metric={metric} icon={metric.icon} />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Выручка и валовая прибыль по месяцам" subtitle="Динамика продаж и валовой прибыли">
            <ComposedChart data={months}>
              <CartesianGrid stroke="#E6EAF0" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
              <Tooltip formatter={(v) => formatRub(Number(v))} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Выручка" fill="#DDE8F2" stroke="#17324D" />
              <Line type="monotone" dataKey="grossProfit" name="Валовая прибыль" stroke="#2F8F7B" strokeWidth={3} />
            </ComposedChart>
          </ChartCard>
        </div>
        <ChartCard title="Продажи по регионам" subtitle="Топ регионов по обороту">
          <BarChart data={regions} layout="vertical" margin={{ left: 32 }}>
            <CartesianGrid stroke="#E6EAF0" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => formatCompactRub(Number(v))} />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Bar dataKey="revenue" name="Выручка" fill="#46627F" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ChartCard>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard title="Топ-10 клиентов по выручке">
          <BarChart data={clients.slice(0, 10)}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="client" tick={false} />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} labelFormatter={(_, p) => p?.[0]?.payload?.client ?? ""} />
            <Bar dataKey="revenue" name="Выручка" fill="#17324D" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Товарные группы по выручке">
          <PieChart>
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Pie data={groups} dataKey="revenue" nameKey="name" innerRadius={58} outerRadius={102} fill="#2F8F7B" label />
          </PieChart>
        </ChartCard>
        <ChartCard title="План-факт менеджеров">
          <BarChart data={managerPlan}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="name" tick={false} />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Bar dataKey="plan" name="План" fill="#CBD5E1" radius={[8, 8, 0, 0]} />
            <Bar dataKey="fact" name="Факт" fill="#C0841A" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard title="Просроченная дебиторка по клиентам">
          <AreaChart data={debtClients}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="client" tick={false} />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} labelFormatter={(_, p) => p?.[0]?.payload?.client ?? ""} />
            <Area dataKey="overdueDebt" name="Просрочка" stroke="#B42318" fill="#FEE4E2" />
          </AreaChart>
        </ChartCard>
        <div className="xl:col-span-2 grid gap-5 xl:grid-cols-2">
          <InsightsPanel insights={insights} />
          <RiskAlertsPanel alerts={alerts} />
        </div>
      </div>
      <DataTable
        title="Таблица клиентов"
        rows={clients.slice(0, 60)}
        filename="clients.csv"
        columns={[
          { key: "client", header: "Клиент" },
          { key: "abc", header: "ABC", render: (row) => <Badge tone={row.abc === "A" ? "good" : row.abc === "B" ? "warning" : "neutral"}>{row.abc}</Badge> },
          { key: "region", header: "Регион" },
          { key: "revenue", header: "Выручка", align: "right", render: (row) => formatRub(row.revenue), sort: (row) => row.revenue },
          { key: "marginPct", header: "Маржа", align: "right", render: (row) => formatPercent(row.marginPct), sort: (row) => row.marginPct },
          { key: "overdueDebt", header: "Просрочка", align: "right", render: (row) => formatRub(row.overdueDebt), sort: (row) => row.overdueDebt },
          { key: "riskScore", header: "Риск", align: "right", render: (row) => <Badge tone={row.riskScore > 55 ? "bad" : row.riskScore > 25 ? "warning" : "good"}>{row.riskScore}</Badge>, sort: (row) => row.riskScore },
        ]}
      />
    </div>
  );
}

function buildPeriodComparison(orders: Order[]) {
  const currentMonth = monthKey(iso(TODAY));
  const months = revenueByMonth(orders).filter((item) => item.month !== currentMonth);
  const current = months.at(-1);
  const previous = current ? months.find((item) => item.month === `${Number(current.month.slice(0, 4)) - 1}${current.month.slice(4)}`) : undefined;
  const currentOrders = current ? orders.filter((order) => monthKey(order.order_date) === current.month) : [];
  const previousOrders = previous ? orders.filter((order) => monthKey(order.order_date) === previous.month) : [];
  const currentClients = new Set(currentOrders.map((order) => order.client_id)).size;
  const previousClients = new Set(previousOrders.map((order) => order.client_id)).size;

  return {
    revenueDelta: percentDelta(current?.revenue ?? 0, previous?.revenue ?? 0),
    grossProfitDelta: percentDelta(current?.grossProfit ?? 0, previous?.grossProfit ?? 0),
    marginDelta: ppDelta(current?.marginPct ?? 0, previous?.marginPct ?? 0),
    clientsDelta: countDelta(currentClients, previousClients),
    averageOrderDelta: percentDelta(current?.averageOrderValue ?? 0, previous?.averageOrderValue ?? 0),
  };
}

function percentDelta(current: number, previous: number) {
  if (!previous) return { label: "YoY нет базы", tone: "neutral" as const };
  const value = (current - previous) / previous;
  return { label: `${signed(formatPercent(value))} YoY`, tone: value >= 0 ? ("good" as const) : ("warning" as const) };
}

function ppDelta(current: number, previous: number) {
  const value = (current - previous) * 100;
  const formatted = `${value >= 0 ? "+" : ""}${value.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} п.п. YoY`;
  return { label: formatted, tone: value >= 0 ? ("good" as const) : ("warning" as const) };
}

function countDelta(current: number, previous: number) {
  const value = current - previous;
  if (!previous) return { label: "YoY нет базы", tone: "neutral" as const };
  return { label: `${value >= 0 ? "+" : ""}${formatNumber(value)} YoY`, tone: value >= 0 ? ("good" as const) : ("warning" as const) };
}

function signed(value: string) {
  return value.startsWith("-") ? value : `+${value}`;
}
