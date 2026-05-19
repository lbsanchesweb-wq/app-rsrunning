import { Flame } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { FollowUpButton } from "@/components/dashboard/follow-up-button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RaceCard } from "@/components/dashboard/race-card";
import { TodayActions } from "@/components/dashboard/today-actions";
import { TrainingCard } from "@/components/training/training-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { coachMetrics, payments, students, weeklySessions } from "@/lib/data";

export default function DashboardPage() {
  const todaySession = weeklySessions[1];
  const pendingPayments = payments.filter((payment) => payment.status !== "paid");
  const lowEngagementStudents = students.filter((student) => student.completionRate < 85);

  return (
    <AppShell title="Início" subtitle="Prioridades de hoje para cuidar dos alunos.">
      <section className="mb-6 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 shadow-card md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Bom treino, coach</p>
            <h1 className="mt-1 text-3xl font-black text-white">Início</h1>
          </div>
          <Badge>
            <Flame className="mr-1 h-3.5 w-3.5" />
            Maio
          </Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          Hoje vale olhar treinos, alunos com baixa sequência e mensalidades pendentes.
        </p>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        {coachMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          <div>
            <div className="mb-3 px-1">
              <h2 className="text-lg font-bold text-white">Treino em destaque</h2>
              <p className="text-sm text-muted">Próximo treino do dia para acompanhamento.</p>
            </div>
            <TrainingCard session={todaySession} />
          </div>
          <Card>
            <CardHeader
              title="Alunos que merecem atenção"
              description="Sinais simples para agir rápido, sem virar planilha."
            />
            <div className="grid gap-3">
              {lowEngagementStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.06] p-4">
                  <div>
                    <p className="font-semibold text-white">{student.name}</p>
                    <p className="text-sm text-muted">{student.completionRate}% de conclusão</p>
                  </div>
                  <FollowUpButton student={student} />
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Ações de hoje" description="O que pede sua atenção agora." />
            <TodayActions
              sessions={weeklySessions}
              students={students}
              pendingPayments={pendingPayments}
            />
          </Card>
          <Card>
            <CardHeader title="Próximas provas" description="Objetivos que estão chegando." />
            <div className="space-y-3">
              {students.slice(0, 2).map((student) => (
                <RaceCard key={student.id} student={student} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
