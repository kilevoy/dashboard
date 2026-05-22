import { Bar, BarChart, CartesianGrid, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import type { InventoryItem } from "../domain/types";
import { groupBy, inventorySummary, sum } from "../domain/metrics";
import { ChartCard } from "../components/charts/ChartCard";
import { DataTable } from "../components/tables/DataTable";
import { Card, CardHeader, Badge } from "../components/ui/Card";
import { formatCompactRub, formatNumber, formatPercent, formatRub } from "../utils/formatters";

export function InventoryAnalytics({ inventory }: { inventory: InventoryItem[] }) {
  const summary = inventorySummary(inventory);
  const byWarehouse = Object.entries(groupBy(inventory, (item) => item.warehouse)).map(([name, rows]) => ({ name, stockCost: sum(rows, (item) => item.stock_cost), slow: rows.filter((item) => item.status === "slow-moving" || item.status === "overstock").length }));
  const byStatus = Object.entries(groupBy(inventory, (item) => item.status)).map(([name, rows]) => ({ name, value: rows.length }));
  const critical = [...inventory].sort((a, b) => b.turnover_days - a.turnover_days).slice(0, 120);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="KPI склада" subtitle="Остатки, медленная оборачиваемость и дефицит" />
        <div className="grid gap-4 p-5 md:grid-cols-5">
          <Metric title="Остаток в закупке" value={formatCompactRub(summary.stockCost)} />
          <Metric title="Медленные SKU" value={formatNumber(summary.slowSku)} />
          <Metric title="Дефицитные SKU" value={formatNumber(summary.outOfStockSku)} />
          <Metric title="Средняя оборачиваемость" value={`${Math.round(summary.averageTurnoverDays)} дней`} />
          <Metric title="Доля неликвидов" value={formatPercent(summary.illiquidShare)} />
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Остатки по складам">
          <BarChart data={byWarehouse}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="name" tick={false} />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Bar dataKey="stockCost" fill="#17324D" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Структура оборачиваемости запасов">
          <PieChart>
            <Tooltip />
            <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={105} fill="#2F8F7B" label />
          </PieChart>
        </ChartCard>
      </div>
      <DataTable
        title="Таблица складских остатков"
        rows={critical}
        filename="inventory.csv"
        columns={[
          { key: "sku", header: "SKU" },
          { key: "product_name", header: "Товар" },
          { key: "product_group", header: "Группа" },
          { key: "warehouse", header: "Склад" },
          { key: "stock_qty", header: "Остаток", align: "right", sort: (row) => row.stock_qty },
          { key: "stock_cost", header: "Остаток в закупке", align: "right", render: (row) => formatRub(row.stock_cost), sort: (row) => row.stock_cost },
          { key: "monthly_sales_qty", header: "Продажи/мес", align: "right", sort: (row) => row.monthly_sales_qty },
          { key: "turnover_days", header: "Оборот, дней", align: "right", sort: (row) => row.turnover_days },
          { key: "status", header: "Статус", render: (row) => <Badge tone={row.status === "overstock" ? "bad" : row.status === "slow-moving" ? "warning" : row.status === "out-of-stock" ? "bad" : "good"}>{statusLabel[row.status]}</Badge> },
        ]}
      />
    </div>
  );
}

const statusLabel: Record<InventoryItem["status"], string> = {
  "fast-moving": "Быстрый оборот",
  normal: "Норма",
  "slow-moving": "Медленный оборот",
  overstock: "Избыточный запас",
  "out-of-stock": "Дефицит",
};

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-board p-4">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">{title}</p>
      <p className="mt-2 font-display text-xl font-bold text-ink">{value}</p>
    </div>
  );
}
