import type { InventoryItem, Order, RiskAlert } from "./types";
import { aggregateOrders, clientRows, sum } from "./metrics";
import { formatCompactRub, formatPercent } from "../utils/formatters";

export function buildRiskAlerts(orders: Order[], inventory: InventoryItem[]): RiskAlert[] {
  if (!orders.length) {
    return [
      {
        severity: "medium",
        title: "Нет данных в текущем срезе",
        businessImpact: "Руководитель не видит фактическую картину продаж.",
        recommendedAction: "Расширить период или снять часть фильтров.",
      },
    ];
  }
  const revenue = sum(orders, (order) => order.revenue);
  const grossProfit = sum(orders, (order) => order.gross_profit);
  const overdue = sum(orders.filter((order) => order.is_overdue), (order) => order.revenue);
  const clients = clientRows(orders);
  const regions = aggregateOrders(orders, "region");
  const discounts = sum(orders, (order) => order.discount_pct) / orders.length;
  const slowStock = inventory.filter((item) => item.status === "slow-moving" || item.status === "overstock");
  const outStock = inventory.filter((item) => item.status === "out-of-stock");
  const topDebt = clients.sort((a, b) => b.overdueDebt - a.overdueDebt)[0];
  const weakRegion = regions.sort((a, b) => a.marginPct - b.marginPct)[0];
  const alerts: RiskAlert[] = [];

  if (overdue / Math.max(1, revenue) > 0.12) {
    alerts.push({
      severity: "high",
      title: "Высокая просроченная дебиторка",
      businessImpact: `В просрочке ${formatCompactRub(overdue)}, это ${formatPercent(overdue / revenue)} оборота периода.`,
      recommendedAction: `Разобрать график платежей с ${topDebt.client} и заморозить новые отгрузки без лимита.`,
    });
  }
  if (grossProfit / Math.max(1, revenue) < 0.21) {
    alerts.push({
      severity: "medium",
      title: "Маржа ниже целевого уровня",
      businessImpact: `Текущая валовая маржа ${formatPercent(grossProfit / revenue)} давит на прибыльность продаж.`,
      recommendedAction: "Проверить скидки, закупочные цены и низкомаржинальные группы.",
    });
  }
  if (slowStock.length > inventory.length * 0.22) {
    alerts.push({
      severity: "medium",
      title: "Рост медленно оборачиваемых запасов",
      businessImpact: `${slowStock.length} SKU имеют низкую оборачиваемость или избыточный запас.`,
      recommendedAction: "Запустить промо для медленно оборачиваемых SKU и перераспределить остатки между складами.",
    });
  }
  if (outStock.length > 0) {
    alerts.push({
      severity: "low",
      title: "Дефицитные позиции",
      businessImpact: `${outStock.length} SKU отсутствуют на складе и могут привести к потере повторных заказов.`,
      recommendedAction: "Проверить страховой запас по fast-moving позициям.",
    });
  }
  if (discounts > 0.08) {
    alerts.push({
      severity: "medium",
      title: "Слишком высокая средняя скидка",
      businessImpact: `Средняя скидка ${formatPercent(discounts)} снижает валовую прибыль.`,
      recommendedAction: "Разделить скидки на удержание A-клиентов и неконтролируемые уступки.",
    });
  }
  if (weakRegion.marginPct < 0.18) {
    alerts.push({
      severity: "high",
      title: "Регион с низкой доходностью",
      businessImpact: `${weakRegion.name} показывает маржу ${formatPercent(weakRegion.marginPct)}.`,
      recommendedAction: "Проверить структуру клиентов, логистику и скидки в регионе.",
    });
  }
  const inactiveClient = clients.find((client) => client.revenue > revenue * 0.015 && client.lastPurchase < "2026-03-01");
  if (inactiveClient) {
    alerts.push({
      severity: "medium",
      title: "Крупный клиент снизил активность",
      businessImpact: `${inactiveClient.client} давно не покупал, при обороте ${formatCompactRub(inactiveClient.revenue)}.`,
      recommendedAction: "Поставить менеджеру задачу на повторный контакт и коммерческое предложение.",
    });
  }

  return alerts.slice(0, 7);
}
