import type { FilterState, InventoryItem, Manager, Order, Product } from "./types";
import { monthKey } from "../utils/dates";

export interface SummaryMetrics {
  revenue: number;
  grossProfit: number;
  marginPct: number;
  activeClients: number;
  averageOrderValue: number;
  overdueDebt: number;
  planCompletionPct: number;
  inventoryTurnover: number;
  ordersCount: number;
  dso: number;
}

export const sum = <T,>(items: T[], selector: (item: T) => number) =>
  items.reduce((total, item) => total + selector(item), 0);

export function filterOrders(orders: Order[], filters: FilterState): Order[] {
  const query = filters.search.trim().toLowerCase();
  return orders.filter((order) => {
    if (order.order_date < filters.startDate || order.order_date > filters.endDate) return false;
    if (filters.region !== "Все" && order.region !== filters.region) return false;
    if (filters.manager !== "Все" && order.manager_name !== filters.manager) return false;
    if (filters.productGroup !== "Все" && order.product_group !== filters.productGroup) return false;
    if (filters.warehouse !== "Все" && order.warehouse !== filters.warehouse) return false;
    if (filters.clientType !== "Все" && order.client_type !== filters.clientType) return false;
    if (filters.paymentStatus !== "Все" && order.payment_status !== filters.paymentStatus) return false;
    if (query) {
      const haystack = `${order.client_name} ${order.sku} ${order.product_name} ${order.manager_name}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function filterInventory(inventory: InventoryItem[], filters: FilterState): InventoryItem[] {
  const query = filters.search.trim().toLowerCase();
  return inventory.filter((item) => {
    if (filters.productGroup !== "Все" && item.product_group !== filters.productGroup) return false;
    if (filters.warehouse !== "Все" && item.warehouse !== filters.warehouse) return false;
    if (query) {
      const haystack = `${item.sku} ${item.product_name}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function calculateSummary(orders: Order[], inventory: InventoryItem[], managers: Manager[]): SummaryMetrics {
  const revenue = sum(orders, (order) => order.revenue);
  const grossProfit = sum(orders, (order) => order.gross_profit);
  const activeClients = new Set(orders.map((order) => order.client_id)).size;
  const overdueDebt = sum(orders.filter((order) => order.is_overdue), (order) => order.revenue);
  const stockCost = sum(inventory, (item) => item.stock_cost);
  const cogs = sum(orders, (order) => order.cost);
  const managerPlan = managers.reduce((acc, manager) => {
    const fact = sum(orders.filter((order) => order.manager_id === manager.manager_id), (order) => order.revenue);
    return acc + fact / Math.max(0.65, manager.planFactor);
  }, 0);
  return {
    revenue,
    grossProfit,
    marginPct: revenue ? grossProfit / revenue : 0,
    activeClients,
    averageOrderValue: orders.length ? revenue / new Set(orders.map((order) => order.order_id)).size : 0,
    overdueDebt,
    planCompletionPct: managerPlan ? revenue / managerPlan : 0,
    inventoryTurnover: stockCost ? cogs / stockCost : 0,
    ordersCount: orders.length,
    dso: revenue ? (overdueDebt / revenue) * 365 : 0,
  };
}

export function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item);
      acc[key] = acc[key] ?? [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

export function revenueByMonth(orders: Order[]) {
  const grouped = groupBy(orders, (order) => monthKey(order.order_date));
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthOrders]) => ({
      month,
      revenue: sum(monthOrders, (order) => order.revenue),
      grossProfit: sum(monthOrders, (order) => order.gross_profit),
      marginPct: sum(monthOrders, (order) => order.gross_profit) / Math.max(1, sum(monthOrders, (order) => order.revenue)),
      averageOrderValue: sum(monthOrders, (order) => order.revenue) / Math.max(1, monthOrders.length),
      overdueDebt: sum(monthOrders.filter((order) => order.is_overdue), (order) => order.revenue),
    }));
}

export function aggregateOrders(orders: Order[], field: keyof Order) {
  const grouped = groupBy(orders, (order) => String(order[field]));
  return Object.entries(grouped)
    .map(([name, rows]) => {
      const revenue = sum(rows, (order) => order.revenue);
      const grossProfit = sum(rows, (order) => order.gross_profit);
      return {
        name,
        revenue,
        grossProfit,
        marginPct: revenue ? grossProfit / revenue : 0,
        orders: rows.length,
        overdueDebt: sum(rows.filter((order) => order.is_overdue), (order) => order.revenue),
        discountPct: rows.length ? sum(rows, (order) => order.discount_pct) / rows.length : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function clientRows(orders: Order[]) {
  const grouped = groupBy(orders, (order) => order.client_id);
  const totalRevenue = sum(orders, (order) => order.revenue);
  let cumulative = 0;
  return Object.entries(grouped)
    .map(([, rows]) => {
      const revenue = sum(rows, (order) => order.revenue);
      const grossProfit = sum(rows, (order) => order.gross_profit);
      const overdueDebt = sum(rows.filter((order) => order.is_overdue), (order) => order.revenue);
      return {
        client: rows[0].client_name,
        type: rows[0].client_type,
        region: rows[0].region,
        revenue,
        grossProfit,
        marginPct: revenue ? grossProfit / revenue : 0,
        orders: rows.length,
        averageOrder: revenue / rows.length,
        overdueDebt,
        lastPurchase: rows.map((order) => order.order_date).sort().at(-1) ?? "",
        riskScore: Math.min(100, Math.round((overdueDebt / Math.max(1, revenue)) * 120 + (rows.length < 3 ? 22 : 0))),
        abc: "C" as "A" | "B" | "C",
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .map((row) => {
      cumulative += row.revenue;
      return {
        ...row,
        abc: cumulative / Math.max(1, totalRevenue) <= 0.8 ? "A" : cumulative / Math.max(1, totalRevenue) <= 0.95 ? "B" : "C",
      };
    });
}

export function productRows(orders: Order[], inventory: InventoryItem[]) {
  const grouped = groupBy(orders, (order) => order.product_id);
  return Object.entries(grouped)
    .map(([, rows]) => {
      const revenue = sum(rows, (order) => order.revenue);
      const grossProfit = sum(rows, (order) => order.gross_profit);
      const stock = inventory.filter((item) => item.product_id === rows[0].product_id);
      const stockCost = sum(stock, (item) => item.stock_cost);
      return {
        sku: rows[0].sku,
        product: rows[0].product_name,
        group: rows[0].product_group,
        brand: rows[0].brand,
        revenue,
        grossProfit,
        marginPct: revenue ? grossProfit / revenue : 0,
        quantity: sum(rows, (order) => order.quantity),
        stockCost,
        turnoverDays: stock.length ? sum(stock, (item) => item.turnover_days) / stock.length : 0,
        priceReview: revenue > 0 && grossProfit / revenue < 0.16,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function managerRows(orders: Order[], managers: Manager[]) {
  return managers
    .map((manager) => {
      const rows = orders.filter((order) => order.manager_id === manager.manager_id);
      const revenue = sum(rows, (order) => order.revenue);
      const grossProfit = sum(rows, (order) => order.gross_profit);
      return {
        manager: manager.manager_name,
        revenue,
        grossProfit,
        marginPct: revenue ? grossProfit / revenue : 0,
        activeClients: new Set(rows.map((order) => order.client_id)).size,
        overdueDebt: sum(rows.filter((order) => order.is_overdue), (order) => order.revenue),
        averageOrder: rows.length ? revenue / rows.length : 0,
        newClients: Math.round(new Set(rows.filter((order) => order.order_date >= "2026-01-01").map((order) => order.client_id)).size * 0.16),
        discountPct: rows.length ? sum(rows, (order) => order.discount_pct) / rows.length : 0,
        planCompletion: manager.planFactor,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function debtRows(orders: Order[]) {
  return clientRows(orders)
    .filter((row) => row.overdueDebt > 0)
    .map((row) => ({
      client: row.client,
      region: row.region,
      overdueDebt: row.overdueDebt,
      bucket: row.overdueDebt > 2_500_000 ? "90+ дней" : row.overdueDebt > 1_500_000 ? "61–90 дней" : row.overdueDebt > 800_000 ? "31–60 дней" : "8–30 дней",
      riskScore: row.riskScore,
      lastPurchase: row.lastPurchase,
    }))
    .sort((a, b) => b.overdueDebt - a.overdueDebt);
}

export function momChange(series: { revenue: number }[]) {
  const latest = series.at(-1)?.revenue ?? 0;
  const previous = series.at(-2)?.revenue ?? 0;
  return previous ? (latest - previous) / previous : 0;
}

export function yoyChange(series: { month: string; revenue: number }[]) {
  const latest = series.at(-1);
  if (!latest) return 0;
  const prior = series.find((item) => item.month === `${Number(latest.month.slice(0, 4)) - 1}${latest.month.slice(4)}`);
  return prior?.revenue ? (latest.revenue - prior.revenue) / prior.revenue : 0;
}

export function discountImpact(orders: Order[]) {
  return sum(orders, (order) => order.revenue * order.discount_pct);
}

export function riskScore(row: { overdueDebt: number; revenue: number; marginPct: number; discountPct?: number }) {
  return Math.min(
    100,
    Math.round(
      (row.overdueDebt / Math.max(1, row.revenue)) * 80 +
        (row.marginPct < 0.18 ? 22 : 0) +
        ((row.discountPct ?? 0) > 0.09 ? 18 : 0),
    ),
  );
}

export function inventorySummary(inventory: InventoryItem[]) {
  const stockCost = sum(inventory, (item) => item.stock_cost);
  const slow = inventory.filter((item) => item.status === "slow-moving" || item.status === "overstock");
  const out = inventory.filter((item) => item.status === "out-of-stock");
  return {
    stockCost,
    slowSku: slow.length,
    outOfStockSku: out.length,
    averageTurnoverDays: inventory.length ? sum(inventory, (item) => item.turnover_days) / inventory.length : 0,
    illiquidShare: stockCost ? sum(slow, (item) => item.stock_cost) / stockCost : 0,
  };
}

export function planByManager(orders: Order[], managers: Manager[]) {
  return managerRows(orders, managers).map((row) => ({
    name: row.manager,
    fact: row.revenue,
    plan: row.revenue / Math.max(0.65, row.planCompletion),
    completion: row.planCompletion,
  }));
}

export function paymentBuckets(orders: Order[]) {
  const overdue = orders.filter((order) => order.is_overdue);
  const buckets = [
    { name: "0–7 дней", min: 0, max: 7 },
    { name: "8–30 дней", min: 8, max: 30 },
    { name: "31–60 дней", min: 31, max: 60 },
    { name: "61–90 дней", min: 61, max: 90 },
    { name: "90+ дней", min: 91, max: 999 },
  ];
  return buckets.map((bucket) => ({
    name: bucket.name,
    value: sum(
      overdue.filter((order) => order.days_overdue >= bucket.min && order.days_overdue <= bucket.max),
      (order) => order.revenue,
    ),
  }));
}

export function topLowMarginProducts(products: ReturnType<typeof productRows>) {
  return [...products].filter((item) => item.priceReview).sort((a, b) => a.marginPct - b.marginPct).slice(0, 12);
}
