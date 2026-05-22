import { Bar, BarChart, CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import type { InventoryItem, Order } from "../domain/types";
import { aggregateOrders, productRows, topLowMarginProducts } from "../domain/metrics";
import { ChartCard } from "../components/charts/ChartCard";
import { DataTable } from "../components/tables/DataTable";
import { Badge } from "../components/ui/Card";
import { formatCompactRub, formatPercent, formatRub } from "../utils/formatters";

export function ProductAnalytics({ orders, inventory }: { orders: Order[]; inventory: InventoryItem[] }) {
  const rows = productRows(orders, inventory);
  const groups = aggregateOrders(orders, "product_group");
  const lowMargin = topLowMarginProducts(rows);
  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Выручка по товарным группам">
          <BarChart data={groups}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="name" tick={false} />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Bar dataKey="revenue" fill="#17324D" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Маржа по группам">
          <BarChart data={groups}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="name" tick={false} />
            <YAxis tickFormatter={(v) => formatPercent(Number(v))} />
            <Tooltip formatter={(v) => formatPercent(Number(v))} />
            <Bar dataKey="marginPct" fill="#2F8F7B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
      <ChartCard title="SKU: прибыльность и оборачиваемость">
        <ScatterChart>
          <CartesianGrid stroke="#E6EAF0" />
          <XAxis dataKey="turnoverDays" name="Дни оборота" />
          <YAxis dataKey="marginPct" name="Маржа" tickFormatter={(v) => formatPercent(Number(v))} />
          <Tooltip formatter={(v, n) => (n === "marginPct" ? formatPercent(Number(v)) : String(v))} />
          <Scatter data={rows.slice(0, 160)} fill="#C0841A" />
        </ScatterChart>
      </ChartCard>
      <DataTable
        title="Таблица товаров"
        rows={[...lowMargin, ...rows.slice(0, 80)]}
        filename="products.csv"
        columns={[
          { key: "sku", header: "SKU" },
          { key: "product", header: "Товар" },
          { key: "group", header: "Группа" },
          { key: "brand", header: "Бренд" },
          { key: "revenue", header: "Выручка", align: "right", render: (row) => formatRub(row.revenue), sort: (row) => row.revenue },
          { key: "marginPct", header: "Маржа", align: "right", render: (row) => formatPercent(row.marginPct), sort: (row) => row.marginPct },
          { key: "turnoverDays", header: "Оборот, дней", align: "right", render: (row) => Math.round(row.turnoverDays), sort: (row) => row.turnoverDays },
          { key: "priceReview", header: "Действие", render: (row) => <Badge tone={row.priceReview ? "bad" : "good"}>{row.priceReview ? "Пересмотреть цену" : "OK"}</Badge> },
        ]}
      />
    </div>
  );
}
