import { HeartPulse } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function StudentProgressPage() {
  return (
    <AppShell mode="student" title="Evolução" subtitle="Acompanhe consistência, conclusão e progresso.">
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader title="Resumo da semana" description="Você está construindo uma boa sequência." />
          <div className="grid gap-3">
            <div className="rounded-2xl bg-white/[0.06] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Progresso semanal</span>
                <span className="text-sm font-bold text-primary">86%</span>
              </div>
              <Progress value={86} className="h-3" />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4">
              <HeartPulse className="h-5 w-5 text-primary" aria-hidden />
              <div>
                <p className="font-semibold text-white">Sequência ativa: 4 treinos</p>
                <p className="text-sm text-muted">Mantenha o ritmo sem forçar além do combinado.</p>
              </div>
            </div>
          </div>
        </Card>
        <ProgressChart />
      </div>
    </AppShell>
  );
}
