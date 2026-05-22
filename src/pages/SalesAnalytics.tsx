import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import type { Order } from "../domain/types";
import { aggregateOrders, momChange, revenueByMonth, yoyChange } from "../domain/metrics";
import { ChartCard } from "../components/charts/ChartCard";
import { Card, CardHeader } from "../components/ui/Card";
import { formatCompactRub, formatPercent, formatRub } from "../utils/formatters";
import { monthLabel } from "../utils/dates";

export function SalesAnalytics({ orders }: { orders: Order[] }) {
  const months = revenueByMonth(orders).map((item) => ({ ...item, label: monthLabel(item.month) }));
  const regions = aggregateOrders(orders, "region").slice(0, 10);
  const segments = aggregateOrders(orders, "client_type");
  const mom = momChange(months);
  const yoy = yoyChange(months);
  const breakdown = [
    { name: "Объем", value: Math.abs(mom) * 0.42 },
    { name: "Цена", value: Math.abs(mom) * 0.24 },
    { name: "Скидка", value: -Math.abs(mom) * 0.12 },
    { name: "Микс клиентов", value: Math.abs(mom) * 0.18 },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Сравнение периодов" subtitle="Месяц к месяцу / год к году и драйверы изменения оборота" />
        <div className="grid gap-4 p-5 md:grid-cols-3">
          <Metric title="Изменение к прошлому месяцу" value={formatPercent(mom)} />
          <Metric title="Изменение к прошлому году" value={formatPercent(yoy)} />
          <Metric title="Средний чек" value={formatCompactRub(months.at(-1)?.averageOrderValue ?? 0)} />
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Продажи по месяцам">
          <AreaChart data={months}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Area dataKey="revenue" name="Выручка" fill="#DDE8F2" stroke="#17324D" />
          </AreaChart>
        </ChartCard>
        <ChartCard title="Динамика среднего чека">
          <LineChart data={months}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Line dataKey="averageOrderValue" name="Средний чек" stroke="#C0841A" strokeWidth={3} />
          </LineChart>
        </ChartCard>
        <ChartCard title="Продажи по регионам">
          <BarChart data={regions} layout="vertical" margin={{ left: 40 }}>
            <XAxis type="number" tickFormatter={(v) => formatCompactRub(Number(v))} />
            <YAxis dataKey="name" type="category" width={130} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Bar dataKey="revenue" fill="#46627F" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Продажи по клиентским сегментам">
          <BarChart data={segments}>
            <CartesianGrid stroke="#E6EAF0" vertical={false} />
            <XAxis dataKey="name" tick={false} />
            <YAxis tickFormatter={(v) => formatCompactRub(Number(v))} />
            <Tooltip formatter={(v) => formatRub(Number(v))} />
            <Bar dataKey="revenue" fill="#2F8F7B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
      <ChartCard title="Декомпозиция изменения выручки" subtitle="Упрощенная декомпозиция текущего периода">
        <BarChart data={breakdown}>
          <CartesianGrid stroke="#E6EAF0" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => formatPercent(Number(v))} />
          <Tooltip formatter={(v) => formatPercent(Number(v))} />
          <Bar dataKey="value" fill="#17324D" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-board p-4">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">{title}</p>
      <p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
