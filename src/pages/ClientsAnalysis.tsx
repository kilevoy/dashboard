import type { Order } from "../domain/types";
import { clientRows } from "../domain/metrics";
import { DataTable } from "../components/tables/DataTable";
import { Badge } from "../components/ui/Card";
import { formatPercent, formatRub } from "../utils/formatters";

export function ClientsAnalysis({ orders }: { orders: Order[] }) {
  const rows = clientRows(orders);
  return (
    <DataTable
      title="ABC-анализ клиентов"
      rows={rows}
      filename="clients-abc.csv"
      columns={[
        { key: "client", header: "Клиент" },
        { key: "type", header: "Тип" },
        { key: "abc", header: "ABC", render: (row) => <Badge tone={row.abc === "A" ? "good" : row.abc === "B" ? "warning" : "neutral"}>{row.abc}</Badge> },
        { key: "region", header: "Регион" },
        { key: "revenue", header: "Выручка", align: "right", render: (row) => formatRub(row.revenue), sort: (row) => row.revenue },
        { key: "grossProfit", header: "Валовая прибыль", align: "right", render: (row) => formatRub(row.grossProfit), sort: (row) => row.grossProfit },
        { key: "marginPct", header: "Маржа", align: "right", render: (row) => formatPercent(row.marginPct), sort: (row) => row.marginPct },
        { key: "orders", header: "Заказы", align: "right", sort: (row) => row.orders },
        { key: "averageOrder", header: "Средний чек", align: "right", render: (row) => formatRub(row.averageOrder), sort: (row) => row.averageOrder },
        { key: "overdueDebt", header: "Просрочка", align: "right", render: (row) => formatRub(row.overdueDebt), sort: (row) => row.overdueDebt },
        { key: "lastPurchase", header: "Последняя покупка" },
        { key: "riskScore", header: "Риск", align: "right", render: (row) => <Badge tone={row.riskScore > 55 ? "bad" : row.riskScore > 25 ? "warning" : "good"}>{row.riskScore}</Badge>, sort: (row) => row.riskScore },
      ]}
    />
  );
}
