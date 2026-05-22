import type { ReactElement } from "react";
import { ResponsiveContainer } from "recharts";
import { Card, CardHeader, EmptyState } from "../ui/Card";

export function ChartCard({ title, subtitle, children, height = 300 }: { title: string; subtitle?: string; children: ReactElement; height?: number }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader title={title} subtitle={subtitle} />
      <div className="p-4">
        {children ? (
          <div style={{ width: "100%", height }}>
            <ResponsiveContainer>{children}</ResponsiveContainer>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </Card>
  );
}
