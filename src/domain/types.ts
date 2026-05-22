export type ClientType =
  | "Оптовая компания"
  | "Магазин автозапчастей"
  | "Сервисный центр"
  | "Транспортная компания"
  | "Корпоративный автопарк"
  | "Дилер"
  | "Интернет-магазин";

export type Region =
  | "Челябинская область"
  | "Свердловская область"
  | "Тюменская область"
  | "Курганская область"
  | "Башкортостан"
  | "Татарстан"
  | "Пермский край"
  | "Новосибирская область"
  | "Омская область"
  | "Красноярский край"
  | "Казахстан"
  | "Киргизия";

export type ProductGroup =
  | "Тормозная система"
  | "Подвеска"
  | "Сцепление"
  | "Двигатель"
  | "Фильтры"
  | "Электрика"
  | "Кузовные элементы"
  | "Прицепная техника"
  | "Пневмосистема"
  | "Расходные материалы"
  | "Масла и технические жидкости";

export type Brand =
  | "Knorr-Bremse"
  | "Wabco"
  | "Sachs"
  | "Febi"
  | "Mann-Filter"
  | "Bosch"
  | "Hella"
  | "BPW"
  | "SAF"
  | "Mahle"
  | "Lemforder"
  | "DT Spare Parts"
  | "Diesel Technic"
  | "Contitech"
  | "ZF";

export type Warehouse =
  | "Челябинск — центральный склад"
  | "Екатеринбург"
  | "Новосибирск"
  | "Казань"
  | "Алматы";

export type PaymentStatus = "Оплачен" | "Частично оплачен" | "Ожидает оплаты" | "Просрочен";
export type OrderStatus = "Отгружен" | "В пути" | "Закрыт" | "Возврат";
export type RiskLevel = "low" | "medium" | "high";

export interface Client {
  client_id: string;
  client_name: string;
  client_type: ClientType;
  region: Region;
  city: string;
  paymentDiscipline: number;
  tier: "A" | "B" | "C";
}

export interface Product {
  product_id: string;
  sku: string;
  product_name: string;
  product_group: ProductGroup;
  product_subgroup: string;
  brand: Brand;
  base_price: number;
  base_margin: number;
  turnoverClass: "fast" | "regular" | "slow";
}

export interface Manager {
  manager_id: string;
  manager_name: string;
  regionFocus: Region[];
  planFactor: number;
  marginDiscipline: number;
  debtRisk: number;
}

export interface Order {
  order_id: string;
  order_date: string;
  shipment_date: string;
  client_id: string;
  client_name: string;
  client_type: ClientType;
  region: Region;
  city: string;
  manager_id: string;
  manager_name: string;
  product_id: string;
  sku: string;
  product_name: string;
  product_group: ProductGroup;
  product_subgroup: string;
  brand: Brand;
  quantity: number;
  unit_price: number;
  revenue: number;
  cost: number;
  gross_profit: number;
  margin_pct: number;
  discount_pct: number;
  warehouse: Warehouse;
  delivery_days: number;
  payment_status: PaymentStatus;
  payment_due_date: string;
  payment_date: string | null;
  days_overdue: number;
  is_overdue: boolean;
  order_status: OrderStatus;
}

export interface InventoryItem {
  product_id: string;
  sku: string;
  product_name: string;
  product_group: ProductGroup;
  brand: Brand;
  warehouse: Warehouse;
  stock_qty: number;
  stock_cost: number;
  monthly_sales_qty: number;
  turnover_days: number;
  status: "fast-moving" | "normal" | "slow-moving" | "overstock" | "out-of-stock";
}

export interface DashboardData {
  orders: Order[];
  clients: Client[];
  products: Product[];
  managers: Manager[];
  inventory: InventoryItem[];
}

export interface FilterState {
  preset: "YTD" | "last12" | "quarter" | "custom";
  startDate: string;
  endDate: string;
  region: "Все" | Region;
  manager: "Все" | string;
  productGroup: "Все" | ProductGroup;
  warehouse: "Все" | Warehouse;
  clientType: "Все" | ClientType;
  paymentStatus: "Все" | PaymentStatus;
  search: string;
}

export interface KpiMetric {
  label: string;
  value: string;
  delta?: string;
  tone?: "neutral" | "good" | "warning" | "bad";
}

export interface Insight {
  title: string;
  text: string;
  value: string;
}

export interface RiskAlert {
  severity: RiskLevel;
  title: string;
  businessImpact: string;
  recommendedAction: string;
}
