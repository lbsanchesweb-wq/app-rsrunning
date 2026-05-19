import { TrendingUp } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const values = [
  { label: "Seg", km: 6, percent: 42 },
  { label: "Ter", km: 8, percent: 58 },
  { label: "Qua", km: 0, percent: 12 },
  { label: "Qui", km: 10, percent: 70 },
  { label: "Sex", km: 5, percent: 46 },
  { label: "Sáb", km: 12, percent: 86 },
  { label: "Dom", km: 14, percent: 96 },
];

export function ProgressChart() {
  return (
    <Card>
      <CardHeader
        title="Evolução recente"
        description="Volume e consistência dos últimos sete dias."
        action={
          <Badge>
            <TrendingUp className="mr-1 h-3.5 w-3.5" />
            +14%
          </Badge>
        }
      />
      <div className="rounded-3xl bg-black/20 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-white">55 km</p>
            <p className="text-sm text-muted">volume acumulado</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-primary">86%</p>
            <p className="text-xs text-muted">conclusão</p>
          </div>
        </div>
        <div className="flex h-44 items-end gap-2">
          {values.map((value) => (
            <div key={value.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] font-semibold text-muted">{value.km}k</span>
              <div className="flex h-32 w-full items-end rounded-full bg-white/[0.06] p-1">
                <div
                  className="w-full rounded-full bg-gradient-to-t from-secondary to-primary shadow-glow transition-all duration-500"
                  style={{ height: `${value.percent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-muted">{value.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.05] px-3 py-2 text-xs text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Volume realizado
          </span>
          <span>Meta semanal: 64 km</span>
        </div>
      </div>
    </Card>
  );
}
