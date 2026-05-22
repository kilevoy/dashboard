import { BarChart3, Boxes, BriefcaseBusiness, ChartNoAxesCombined, CircleDollarSign, ClipboardList, LayoutDashboard, PackageSearch, Search } from "lucide-react";
import type { ReactNode } from "react";

export type PageId = "overview" | "sales" | "clients" | "products" | "inventory" | "managers" | "debt";

const nav: { id: PageId; label: string; icon: ReactNode }[] = [
  { id: "overview", label: "Обзор руководителя", icon: <LayoutDashboard size={18} /> },
  { id: "sales", label: "Аналитика продаж", icon: <ChartNoAxesCombined size={18} /> },
  { id: "clients", label: "Клиенты / ABC", icon: <BriefcaseBusiness size={18} /> },
  { id: "products", label: "Товары и маржа", icon: <PackageSearch size={18} /> },
  { id: "inventory", label: "Склад и оборачиваемость", icon: <Boxes size={18} /> },
  { id: "managers", label: "Менеджеры", icon: <BarChart3 size={18} /> },
  { id: "debt", label: "Дебиторка", icon: <CircleDollarSign size={18} /> },
];

export function AppShell({ page, setPage, children, report }: { page: PageId; setPage: (page: PageId) => void; children: ReactNode; report: string }) {
  return (
    <div className="min-h-screen bg-board">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-line bg-white px-4 py-5 shadow-premium lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-white">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-ink">Auto Parts BI</p>
            <p className="text-xs text-muted">Продажи · Маржа · Склад · Дебиторка</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <button key={item.id} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${page === item.id ? "bg-navy text-white shadow-hairline" : "text-steel hover:bg-board"}`} onClick={() => setPage(item.id)}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-line bg-board p-4">
          <p className="font-display text-sm font-semibold text-ink">Отчёт руководителю</p>
          <p className="mt-2 line-clamp-5 text-xs leading-5 text-muted">{report}</p>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-line bg-white/90 px-4 py-4 shadow-hairline backdrop-blur md:px-7">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber">Портфолио-дашборд</p>
              <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">B2B-аналитика продаж, маржи, склада и дебиторки</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-line bg-board px-3 py-2 text-sm text-muted md:flex">
                <Search size={16} />
                Быстрый поиск работает через глобальный фильтр
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Демо на синтетических данных</span>
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {nav.map((item) => (
              <button key={item.id} className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold ${page === item.id ? "bg-navy text-white" : "bg-board text-steel"}`} onClick={() => setPage(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </header>
        <main className="px-4 py-6 md:px-7">{children}</main>
        <footer className="border-t border-line px-7 py-5 text-center text-xs font-semibold text-muted">Демо на синтетических данных · Портфолио-проект</footer>
      </div>
    </div>
  );
}
