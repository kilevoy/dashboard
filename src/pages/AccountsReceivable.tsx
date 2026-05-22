import { Area, AreaChart, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import type { Order } from "../domain/types";
import { aggregateOrders, debtRows, paymentBuckets, revenueByMonth } from "../domain/metrics";
import { ChartCard } from "../components/charts/ChartCard";
import { DataTable } from "../components/tables/DataTable";
import { Badge } from "../components/ui/Card";
import { formatCompactRub, formatRub } from "../utils/formatters";
import { monthLabel } from "../utils/dates";

export function AccountsReceivable({ orders }: { orders: Order[] }) {
  const debt = debtRows(orders);
  const buckets = paymentBuckets(orders);
  const managersDebt = aggregateOrders(orders.filter((order) => order.is_overdue), "manager_name").slice(0, 10);
  const regionsDebt = aggregateOrders(orders.filter((order) => order.is_overdue), "region").slice(0, 10);
  const trend = revenueByMonth(orders).map((item) => ({ label: monthLabel(item.month), overdueDebt: item.overdueDebt }));
  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Aging buckets">
          <BarChart data={buckets}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Bar dataKey="value" fill="#B42318" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Динамика просрочки">
          <AreaChart data={trend}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Area dataKey="overdueDebt" fill="#FEE4E2" stroke="#B42318" />
          </AreaChart>
        </ChartCard>
        <ChartCard title="Дебиторка по менеджерам">
          <BarChart data={managersDebt}>
            <XAxis dataKey="name" tick={false} />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Bar dataKey="revenue" fill="#C0841A" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Дебиторка по регионам">
          <BarChart data={regionsDebt}>
            <XAxis dataKey="name" tick={false} />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Bar dataKey="revenue" fill="#46627F" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
      <DataTable
        title="Таблица дебиторской задолженности"
        rows={debt}
        filename="debt.csv"
        columns={[
          { key: "client", header: "Клиент" },
          { key: "region", header: "Регион" },
          { key: "overdueDebt", header: "Просрочка", align: "right", render: (row) => formatRub(row.overdueDebt), sort: (row) => row.overdueDebt },
          { key: "bucket", header: "Aging", render: (row) => <Badge tone={row.bucket === "90+ дней" ? "bad" : row.bucket === "61–90 дней" ? "warning" : "neutral"}>{row.bucket}</Badge> },
          { key: "riskScore", header: "Риск", align: "right", render: (row) => <Badge tone={row.riskScore > 55 ? "bad" : row.riskScore > 25 ? "warning" : "good"}>{row.riskScore}</Badge>, sort: (row) => row.riskScore },
          { key: "lastPurchase", header: "Последняя покупка" },
        ]}
      />
    </div>
  );
}
