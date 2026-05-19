import { Flame, HeartPulse, WalletCards } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { RaceCard } from "@/components/dashboard/race-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { PaymentCard } from "@/components/financial/payment-card";
import { CoachCard } from "@/components/student/coach-card";
import { TrainingCard } from "@/components/training/training-card";
import { WeeklySchedule } from "@/components/training/weekly-schedule";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { payments, students, studentMetrics, weeklySessions } from "@/lib/data";

export default function StudentPage() {
  return (
    <AppShell mode="student" title="Meu Painel" subtitle="Seu treino, sua semana e sua evolução.">
      <section className="mb-6 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/10 to-white/[0.02] p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Bom treino, Marina</p>
            <h1 className="mt-1 text-3xl font-black text-white">Meu Painel</h1>
          </div>
          <Badge>
            <Flame className="mr-1 h-3.5 w-3.5" />
            4 dias
          </Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          Seu treino está pronto. Foque em consistência e termine com controle.
        </p>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        {studentMetrics.map((metric) => (
          metric.label === "Próxima prova" ? (
            <RaceCard key={metric.label} student={students[0]} variant="metric" />
          ) : (
            <MetricCard key={metric.label} metric={metric} />
          )
        ))}
      </div>
      <div className="mt-5">
        <CoachCard />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <Card className="border-primary/20">
            <CardHeader title="Treino do dia" description="Execute e registre sua sensação." />
            <TrainingCard session={weeklySessions[1]} />
          </Card>
          <Card id="evolucao">
            <CardHeader
              title="Evolução"
              description="Você está construindo uma boa sequência."
            />
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
        </div>
        <div className="space-y-5">
          <div id="semana">
            <WeeklySchedule sessions={weeklySessions} />
          </div>
          <div id="mensalidade">
            <Card>
              <CardHeader
                title="Mensalidade"
                description="Status simples para você acompanhar sem ruído."
                action={<WalletCards className="h-5 w-5 text-primary" />}
              />
              <PaymentCard payment={payments[0]} />
            </Card>
          </div>
          <ProgressChart />
        </div>
      </div>
    </AppShell>
  );
}
