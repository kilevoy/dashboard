import type { Insight, InventoryItem, Order } from "./types";
import { aggregateOrders, clientRows, managerRows, productRows, revenueByMonth } from "./metrics";
import { formatCompactRub, formatPercent, formatPp } from "../utils/formatters";

export function buildInsights(orders: Order[], inventory: InventoryItem[], managers: Parameters<typeof managerRows>[1]): Insight[] {
  if (!orders.length) return [{ title: "Нет данных", text: "Измените фильтры, чтобы увидеть управленческие инсайты.", value: "0" }];
  const region = aggregateOrders(orders, "region");
  const groups = aggregateOrders(orders, "product_group");
  const clients = clientRows(orders);
  const managersRows = managerRows(orders, managers);
  const products = productRows(orders, inventory);
  const months = revenueByMonth(orders);
  const bestRegion = region[0];
  const weakRegion = [...region].sort((a, b) => a.marginPct - b.marginPct)[0];
  const marginWeakGroup = [...groups].sort((a, b) => a.marginPct - b.marginPct)[0];
  const riskyClient = [...clients].sort((a, b) => b.overdueDebt - a.overdueDebt)[0];
  const bestManager = [...managersRows].sort((a, b) => b.planCompletion - a.planCompletion)[0];
  const slowGroup = Object.entries(
    inventory
      .filter((item) => item.status === "overstock" || item.status === "slow-moving")
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.product_group] = (acc[item.product_group] ?? 0) + item.stock_cost;
        return acc;
      }, {}),
  ).sort((a, b) => b[1] - a[1])[0];
  const latest = months.at(-1);
  const previous = months.at(-2);
  const mom = latest && previous ? (latest.revenue - previous.revenue) / previous.revenue : 0;
  const priceCandidate = products.find((product) => product.priceReview);

  return [
    {
      title: "Регион-лидер",
      text: `${bestRegion.name} формирует ${formatPercent(bestRegion.revenue / Math.max(1, region.reduce((s, r) => s + r.revenue, 0)))} выручки с маржей ${formatPercent(bestRegion.marginPct)}.`,
      value: formatCompactRub(bestRegion.revenue),
    },
    {
      title: "Маржинальный разрыв",
      text: `${weakRegion.name} имеет самую слабую маржу: ${formatPercent(weakRegion.marginPct)}, это ниже среднего портфеля на ${formatPp(weakRegion.marginPct - orders.reduce((s, o) => s + o.gross_profit, 0) / Math.max(1, orders.reduce((s, o) => s + o.revenue, 0)))}.`,
      value: formatPercent(weakRegion.marginPct),
    },
    {
      title: "Группа под контролем",
      text: `${marginWeakGroup.name} показывает маржу ${formatPercent(marginWeakGroup.marginPct)} при обороте ${formatCompactRub(marginWeakGroup.revenue)}. Нужна проверка скидок и закупочных цен.`,
      value: formatCompactRub(marginWeakGroup.revenue),
    },
    {
      title: "Дебиторский риск",
      text: `${riskyClient.client} остается значимым клиентом, но держит просрочку ${formatCompactRub(riskyClient.overdueDebt)}.`,
      value: riskyClient.abc,
    },
    {
      title: "План-факт",
      text: `${bestManager.manager} выполняет план на ${formatPercent(bestManager.planCompletion)} при средней скидке ${formatPercent(bestManager.discountPct)}.`,
      value: formatPercent(bestManager.planCompletion),
    },
    {
      title: "Риск неликвидов",
      text: `${slowGroup?.[0] ?? "Склад"} концентрирует медленно оборачиваемые остатки на ${formatCompactRub(slowGroup?.[1] ?? 0)}.`,
      value: formatCompactRub(slowGroup?.[1] ?? 0),
    },
    {
      title: "Месячная динамика",
      text: `Последний месяц изменился к предыдущему на ${formatPercent(mom)}. Это помогает отделить сезонность от реального падения спроса.`,
      value: formatPercent(mom),
    },
    {
      title: "Пересмотр цены",
      text: priceCandidate ? `${priceCandidate.sku} продается с маржей ${formatPercent(priceCandidate.marginPct)} и подходит для пересмотра цены.` : "Критичных низкомаржинальных SKU в текущем срезе нет.",
      value: priceCandidate ? formatPercent(priceCandidate.marginPct) : "OK",
    },
  ];
}
