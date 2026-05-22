export const formatRub = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);

export const formatCompactRub = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);

export const formatPercent = (value: number, digits = 1) =>
  `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value * 100)}%`;

export const formatPp = (value: number) =>
  `${value >= 0 ? "+" : ""}${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1,
  }).format(value * 100)} п.п.`;
