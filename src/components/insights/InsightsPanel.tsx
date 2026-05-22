import { Lightbulb, ShieldAlert } from "lucide-react";
import type { Insight, RiskAlert } from "../../domain/types";
import { Card, CardHeader, Badge } from "../ui/Card";

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Бизнес-инсайты" subtitle="Автоматические выводы по текущим фильтрам" />
      <div className="divide-y divide-line">
        {insights.slice(0, 8).map((insight) => (
          <div key={insight.title} className="flex gap-3 p-4">
            <div className="mt-1 rounded-xl bg-amber-50 p-2 text-amber">
              <Lightbulb size={18} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-sm font-semibold text-ink">{insight.title}</p>
                <Badge>{insight.value}</Badge>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted">{insight.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function RiskAlertsPanel({ alerts }: { alerts: RiskAlert[] }) {
  const tone = { low: "neutral", medium: "warning", high: "bad" } as const;
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Риск-алерты" subtitle="Риски, которые требуют управленческого действия" />
      <div className="divide-y divide-line">
        {alerts.map((alert) => (
          <div key={alert.title} className="p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className={alert.severity === "high" ? "text-danger" : alert.severity === "medium" ? "text-amber" : "text-steel"} />
              <p className="font-display text-sm font-semibold text-ink">{alert.title}</p>
              <Badge tone={tone[alert.severity]}>{alert.severity}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{alert.businessImpact}</p>
            <p className="mt-2 rounded-xl bg-board p-3 text-sm font-medium text-navy">{alert.recommendedAction}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
