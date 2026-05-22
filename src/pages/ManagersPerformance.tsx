import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import type { Manager, Order } from "../domain/types";
import { managerRows } from "../domain/metrics";
import { ChartCard } from "../components/charts/ChartCard";
import { DataTable } from "../components/tables/DataTable";
import { Badge } from "../components/ui/Card";
import { formatCompactRub, formatPercent, formatRub } from "../utils/formatters";

export function ManagersPerformance({ orders, managers }: { orders: Order[]; managers: Manager[] }) {
  const rows = managerRows(orders, managers);
  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="План-факт по менеджерам">
          <BarChart data={rows}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="manager" tick={false} />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Bar dataKey="revenue" name="Выручка" fill="#17324D" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Дебиторка по менеджерам">
          <BarChart data={rows}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="manager" tick={false} />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Bar dataKey="overdueDebt" name="Просрочка" fill="#B42318" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
      <DataTable
        title="Таблица рейтинга менеджеров"
        rows={rows}
        filename="managers.csv"
        columns={[
          { key: "manager", header: "Менеджер" },
          { key: "revenue", header: "Выручка", align: "right", render: (row) => formatRub(row.revenue), sort: (row) => row.revenue },
          { key: "grossProfit", header: "Валовая прибыль", align: "right", render: (row) => formatRub(row.grossProfit), sort: (row) => row.grossProfit },
          { key: "marginPct", header: "Маржа", align: "right", render: (row) => formatPercent(row.marginPct), sort: (row) => row.marginPct },
          { key: "activeClients", header: "Активные клиенты", align: "right", sort: (row) => row.activeClients },
          { key: "overdueDebt", header: "Дебиторка", align: "right", render: (row) => formatRub(row.overdueDebt), sort: (row) => row.overdueDebt },
          { key: "averageOrder", header: "Средний чек", align: "right", render: (row) => formatRub(row.averageOrder), sort: (row) => row.averageOrder },
          { key: "newClients", header: "Новые клиенты", align: "right", sort: (row) => row.newClients },
          { key: "discountPct", header: "Скидка", align: "right", render: (row) => formatPercent(row.discountPct), sort: (row) => row.discountPct },
          { key: "planCompletion", header: "План", align: "right", render: (row) => <Badge tone={row.planCompletion >= 1 ? "good" : "warning"}>{formatPercent(row.planCompletion)}</Badge>, sort: (row) => row.planCompletion },
        ]}
      />
    </div>
  );
}
