import type { Metric } from "@/lib/types";
import { Card } from "@/components/ui/card";

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {metric.label}
      </p>
      <p className="mt-3 text-3xl font-black text-white">{metric.value}</p>
      <p className="mt-2 text-sm font-semibold text-primary">{metric.helper}</p>
    </Card>
  );
}
