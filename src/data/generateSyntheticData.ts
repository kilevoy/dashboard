import { addDays, addMonths, format, startOfMonth } from "date-fns";
import type {
  Brand,
  Client,
  ClientType,
  DashboardData,
  InventoryItem,
  Manager,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductGroup,
  Region,
  Warehouse,
} from "../domain/types";
import { TODAY, daysBetween } from "../utils/dates";

const regions: Region[] = [
  "Челябинская область",
  "Свердловская область",
  "Тюменская область",
  "Курганская область",
  "Башкортостан",
  "Татарстан",
  "Пермский край",
  "Новосибирская область",
  "Омская область",
  "Красноярский край",
  "Казахстан",
  "Киргизия",
];

const cities: Record<Region, string[]> = {
  "Челябинская область": ["Челябинск", "Магнитогорск", "Миасс"],
  "Свердловская область": ["Екатеринбург", "Нижний Тагил", "Каменск-Уральский"],
  "Тюменская область": ["Тюмень", "Тобольск", "Ишим"],
  "Курганская область": ["Курган", "Шадринск"],
  Башкортостан: ["Уфа", "Стерлитамак", "Нефтекамск"],
  Татарстан: ["Казань", "Набережные Челны", "Альметьевск"],
  "Пермский край": ["Пермь", "Березники", "Соликамск"],
  "Новосибирская область": ["Новосибирск", "Бердск", "Искитим"],
  "Омская область": ["Омск", "Тара"],
  "Красноярский край": ["Красноярск", "Ачинск", "Норильск"],
  Казахстан: ["Алматы", "Астана", "Караганда"],
  Киргизия: ["Бишкек", "Ош"],
};

const clientTypes: ClientType[] = [
  "Оптовая компания",
  "Магазин автозапчастей",
  "Сервисный центр",
  "Транспортная компания",
  "Корпоративный автопарк",
  "Дилер",
  "Интернет-магазин",
];

const groups: ProductGroup[] = [
  "Тормозная система",
  "Подвеска",
  "Сцепление",
  "Двигатель",
  "Фильтры",
  "Электрика",
  "Кузовные элементы",
  "Прицепная техника",
  "Пневмосистема",
  "Расходные материалы",
  "Масла и технические жидкости",
];

const groupMargins: Record<ProductGroup, number> = {
  "Тормозная система": 0.27,
  Подвеска: 0.24,
  Сцепление: 0.22,
  Двигатель: 0.19,
  Фильтры: 0.31,
  Электрика: 0.25,
  "Кузовные элементы": 0.18,
  "Прицепная техника": 0.23,
  Пневмосистема: 0.26,
  "Расходные материалы": 0.34,
  "Масла и технические жидкости": 0.16,
};

const subgroups: Record<ProductGroup, string[]> = {
  "Тормозная система": ["колодки", "диски", "суппорты", "клапаны ABS"],
  Подвеска: ["амортизаторы", "сайлентблоки", "рычаги", "рессоры"],
  Сцепление: ["комплекты сцепления", "выжимные подшипники", "диски сцепления"],
  Двигатель: ["помпы", "ремкомплекты", "прокладки", "турбины"],
  Фильтры: ["масляные", "воздушные", "топливные", "салонные"],
  Электрика: ["датчики", "фары", "стартеры", "генераторы"],
  "Кузовные элементы": ["крылья", "бамперы", "зеркала", "крепеж"],
  "Прицепная техника": ["оси", "ступицы", "опоры", "замки"],
  Пневмосистема: ["краны", "ресиверы", "пневмоподушки", "шланги"],
  "Расходные материалы": ["хомуты", "крепеж", "лампы", "смазки"],
  "Масла и технические жидкости": ["моторные масла", "AdBlue", "антифриз", "трансмиссионные масла"],
};

const brands: Brand[] = [
  "Knorr-Bremse",
  "Wabco",
  "Sachs",
  "Febi",
  "Mann-Filter",
  "Bosch",
  "Hella",
  "BPW",
  "SAF",
  "Mahle",
  "Lemforder",
  "DT Spare Parts",
  "Diesel Technic",
  "Contitech",
  "ZF",
];

export const warehouses: Warehouse[] = [
  "Челябинск — центральный склад",
  "Екатеринбург",
  "Новосибирск",
  "Казань",
  "Алматы",
];

const regionTrend: Record<Region, number> = {
  "Челябинская область": 0.18,
  "Свердловская область": 0.15,
  "Тюменская область": 0.08,
  "Курганская область": -0.08,
  Башкортостан: 0.06,
  Татарстан: 0.12,
  "Пермский край": -0.03,
  "Новосибирская область": 0.2,
  "Омская область": -0.1,
  "Красноярский край": 0.04,
  Казахстан: 0.22,
  Киргизия: 0.1,
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(74012026);
const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)];
const money = (value: number) => Math.round(value);
const iso = (date: Date) => format(date, "yyyy-MM-dd");

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((sum, item) => sum + item, 0);
  let threshold = rand() * total;
  for (let i = 0; i < items.length; i += 1) {
    threshold -= weights[i];
    if (threshold <= 0) return items[i];
  }
  return items[items.length - 1];
}

function nearestWarehouse(region: Region): Warehouse {
  if (["Казахстан", "Киргизия"].includes(region)) return "Алматы";
  if (["Татарстан", "Башкортостан", "Пермский край"].includes(region)) return rand() > 0.35 ? "Казань" : "Екатеринбург";
  if (["Новосибирская область", "Омская область", "Красноярский край"].includes(region)) return "Новосибирск";
  if (["Свердловская область", "Тюменская область"].includes(region)) return "Екатеринбург";
  return "Челябинск — центральный склад";
}

function makeClients(): Client[] {
  const prefixes = ["Трак", "Урал", "Магистраль", "ЕвроДизель", "АвтоЛиния", "СеверТранс", "Партнер", "ТехСервис", "Фура", "ОптДеталь"];
  return Array.from({ length: 190 }, (_, i) => {
    const region = weightedPick(regions, [18, 15, 8, 4, 8, 9, 6, 9, 5, 5, 9, 4]);
    const tier = i < 20 ? "A" : i < 75 ? "B" : "C";
    const paymentDiscipline = tier === "A" ? 0.55 + rand() * 0.4 : tier === "B" ? 0.35 + rand() * 0.45 : 0.2 + rand() * 0.5;
    return {
      client_id: `CL-${String(i + 1).padStart(4, "0")}`,
      client_name: `${pick(prefixes)} ${pick(["74", "Урал", "Логистик", "Сервис", "Трейд", "Поставка", "Групп"])}-${String(i + 7).padStart(2, "0")}`,
      client_type: pick(clientTypes),
      region,
      city: pick(cities[region]),
      paymentDiscipline,
      tier,
    };
  });
}

function makeManagers(): Manager[] {
  const names = ["Антон Ковалев", "Ирина Мельникова", "Сергей Волков", "Елена Громова", "Дмитрий Соколов", "Мария Романова", "Павел Зуев", "Наталья Орлова", "Руслан Каримов", "Олег Морозов"];
  return names.map((manager_name, i) => ({
    manager_id: `M-${i + 1}`,
    manager_name,
    regionFocus: [regions[i % regions.length], regions[(i + 2) % regions.length], regions[(i + 5) % regions.length]],
    planFactor: [1.18, 1.1, 0.97, 1.04, 0.88, 1.14, 0.92, 1.22, 0.82, 1.01][i],
    marginDiscipline: [1.05, 1.02, 0.96, 1.08, 0.92, 1.0, 0.9, 1.06, 0.88, 1.01][i],
    debtRisk: [0.35, 0.28, 0.44, 0.25, 0.62, 0.38, 0.58, 0.3, 0.7, 0.4][i],
  }));
}

function makeProducts(): Product[] {
  return Array.from({ length: 360 }, (_, i) => {
    const product_group = weightedPick(groups, [12, 9, 7, 9, 13, 8, 5, 7, 8, 14, 8]);
    const brand = weightedPick(brands, [10, 9, 7, 8, 9, 9, 5, 7, 6, 7, 7, 9, 8, 6, 7]);
    const base = 900 + rand() * 52000;
    const turnoverClass = rand() > 0.82 ? "slow" : rand() > 0.36 ? "regular" : "fast";
    return {
      product_id: `P-${String(i + 1).padStart(4, "0")}`,
      sku: `${brand.slice(0, 3).toUpperCase()}-${10000 + i}`,
      product_name: `${brand} ${pick(subgroups[product_group])} для грузовой техники`,
      product_group,
      product_subgroup: pick(subgroups[product_group]),
      brand,
      base_price: money(base),
      base_margin: groupMargins[product_group] + (rand() - 0.5) * 0.08,
      turnoverClass,
    };
  });
}

function seasonFactor(date: Date) {
  const month = date.getMonth();
  const quarterEnd = [2, 5, 8, 11].includes(month) ? 1.23 : 1;
  const winterService = [0, 1, 9, 10, 11].includes(month) ? 1.13 : 1;
  const summerDip = [6].includes(month) ? 0.88 : 1;
  return quarterEnd * winterService * summerDip;
}

function generateOrders(clients: Client[], products: Product[], managers: Manager[]): Order[] {
  const orders: Order[] = [];
  const start = new Date("2024-01-01T10:00:00+05:00");
  const months = 29;

  for (let monthIndex = 0; monthIndex < months; monthIndex += 1) {
    const monthDate = startOfMonth(addMonths(start, monthIndex));
    const monthFactor = seasonFactor(monthDate) * (1 + monthIndex * 0.012);
    const count = Math.round(580 * monthFactor + rand() * 160);

    for (let i = 0; i < count; i += 1) {
      const client = weightedPick(
        clients,
        clients.map((clientItem, idx) => (clientItem.tier === "A" ? 18 - idx * 0.28 : clientItem.tier === "B" ? 4 : 1.2)),
      );
      const manager = weightedPick(
        managers,
        managers.map((managerItem) => (managerItem.regionFocus.includes(client.region) ? 4 : 1) * managerItem.planFactor),
      );
      const product = weightedPick(
        products,
        products.map((productItem) => (productItem.turnoverClass === "fast" ? 5.5 : productItem.turnoverClass === "regular" ? 2.8 : 0.75)),
      );
      const day = 1 + Math.floor(rand() * 27);
      const orderDate = addDays(monthDate, day);
      const regionGrowth = 1 + regionTrend[client.region] * (monthIndex / months);
      const qtyBase = product.turnoverClass === "fast" ? 4 + rand() * 22 : product.turnoverClass === "regular" ? 1 + rand() * 9 : 1 + rand() * 4;
      const quantity = Math.max(1, Math.round(qtyBase * (client.tier === "A" ? 1.9 : client.tier === "B" ? 1.25 : 0.85)));
      const discount_pct = Math.min(0.22, Math.max(0, (client.tier === "A" ? 0.05 : 0.025) + (1 - manager.marginDiscipline) * 0.08 + rand() * 0.055));
      const unit_price = money(product.base_price * regionGrowth * (1 - discount_pct) * (0.95 + rand() * 0.18));
      const revenue = money(quantity * unit_price);
      const margin = Math.max(0.07, product.base_margin * manager.marginDiscipline - discount_pct * 0.72 + (rand() - 0.5) * 0.045);
      const gross_profit = money(revenue * margin);
      const cost = revenue - gross_profit;
      const warehouse = rand() > 0.22 ? nearestWarehouse(client.region) : pick(warehouses);
      const baseDelivery = warehouse === nearestWarehouse(client.region) ? 1 + Math.floor(rand() * 3) : 3 + Math.floor(rand() * 5);
      const shipmentDate = addDays(orderDate, baseDelivery);
      const dueDays = client.tier === "A" ? 30 : client.tier === "B" ? 21 : 14;
      const dueDate = addDays(orderDate, dueDays);
      const lateChance = manager.debtRisk * (1 - client.paymentDiscipline) + (client.tier === "C" ? 0.12 : 0);
      const is_overdue = rand() < lateChance && dueDate < TODAY;
      const paymentDate = is_overdue ? null : addDays(dueDate, Math.round((rand() - 0.35) * 12));
      const days_overdue = is_overdue ? Math.max(1, daysBetween(dueDate, TODAY)) : 0;
      const payment_status: PaymentStatus = is_overdue ? "Просрочен" : rand() > 0.9 ? "Частично оплачен" : paymentDate && paymentDate <= TODAY ? "Оплачен" : "Ожидает оплаты";
      const order_status: OrderStatus = rand() > 0.985 ? "Возврат" : rand() > 0.95 ? "В пути" : payment_status === "Оплачен" ? "Закрыт" : "Отгружен";

      orders.push({
        order_id: `ORD-${String(orders.length + 1).padStart(6, "0")}`,
        order_date: iso(orderDate),
        shipment_date: iso(shipmentDate),
        client_id: client.client_id,
        client_name: client.client_name,
        client_type: client.client_type,
        region: client.region,
        city: client.city,
        manager_id: manager.manager_id,
        manager_name: manager.manager_name,
        product_id: product.product_id,
        sku: product.sku,
        product_name: product.product_name,
        product_group: product.product_group,
        product_subgroup: product.product_subgroup,
        brand: product.brand,
        quantity,
        unit_price,
        revenue,
        cost,
        gross_profit,
        margin_pct: gross_profit / revenue,
        discount_pct,
        warehouse,
        delivery_days: baseDelivery,
        payment_status,
        payment_due_date: iso(dueDate),
        payment_date: paymentDate && paymentDate <= TODAY ? iso(paymentDate) : null,
        days_overdue,
        is_overdue,
        order_status,
      });
    }
  }
  return orders;
}

function makeInventory(products: Product[], orders: Order[]): InventoryItem[] {
  const recentOrders = orders.filter((order) => order.order_date >= "2026-01-01");
  const items: InventoryItem[] = [];
  for (const product of products) {
    for (const warehouse of warehouses) {
      const sold = recentOrders
        .filter((order) => order.product_id === product.product_id && order.warehouse === warehouse)
        .reduce((sum, order) => sum + order.quantity, 0);
      const monthly_sales_qty = Math.max(0, Math.round(sold / 5));
      const stockBias = product.turnoverClass === "slow" ? 6.5 : product.turnoverClass === "regular" ? 3.2 : 1.7;
      const stock_qty = Math.round(monthly_sales_qty * stockBias + rand() * 28);
      const stock_cost = money(stock_qty * product.base_price * (1 - product.base_margin));
      const turnover_days = monthly_sales_qty === 0 ? 365 : Math.round((stock_qty / monthly_sales_qty) * 30);
      const status =
        stock_qty === 0
          ? "out-of-stock"
          : turnover_days > 180
            ? "overstock"
            : turnover_days > 95
              ? "slow-moving"
              : turnover_days < 35
                ? "fast-moving"
                : "normal";
      items.push({
        product_id: product.product_id,
        sku: product.sku,
        product_name: product.product_name,
        product_group: product.product_group,
        brand: product.brand,
        warehouse,
        stock_qty,
        stock_cost,
        monthly_sales_qty,
        turnover_days,
        status,
      });
    }
  }
  return items;
}

export const dictionaries = { regions, clientTypes, groups, warehouses };

export function generateSyntheticData(): DashboardData {
  const clients = makeClients();
  const managers = makeManagers();
  const products = makeProducts();
  const orders = generateOrders(clients, products, managers);
  const inventory = makeInventory(products, orders);
  return { orders, clients, products, managers, inventory };
}
