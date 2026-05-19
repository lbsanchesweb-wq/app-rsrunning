import { CalendarDays, ClipboardList, Flame, Send, WalletCards } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { FollowUpButton } from "@/components/dashboard/follow-up-button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TodayActions } from "@/components/dashboard/today-actions";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { coachMetrics, payments, students, weeklySessions } from "@/lib/data";

const operationalItems = [
  { icon: ClipboardList, title: "Semanas a montar", helper: "3 alunos sem cronograma publicado" },
  { icon: Send, title: "Publicações pendentes", helper: "2 semanas em rascunho" },
  { icon: CalendarDays, title: "Feedbacks recebidos", helper: "5 respostas para revisar" },
];

export default function DashboardPage() {
  const pendingPayments = payments.filter((payment) => payment.status !== "paid");
  const lowEngagementStudents = students.filter((student) => student.completionRate < 85);

  return (
    <AppShell title="Início" subtitle="Operação semanal da assessoria RS Running.">
      <section className="mb-6 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 shadow-card md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Bom trabalho, Rui</p>
            <h1 className="mt-1 text-3xl font-black text-white">Operação</h1>
          </div>
          <Badge>
            <Flame className="mr-1 h-3.5 w-3.5" />
            Semana
          </Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          Monte as semanas, publique para os alunos e acompanhe quem concluiu os treinos.
        </p>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        {coachMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Prioridade operacional"
              description="O professor administra cronogramas. A conclusão acontece só no app do aluno."
            />
            <div className="grid gap-3 md:grid-cols-3">
              {operationalItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-2xl bg-white/[0.06] p-4">
                    <Icon className="mb-3 h-5 w-5 text-primary" aria-hidden />
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 text-muted">{item.helper}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Alunos que merecem atenção"
              description="Acesse o aluno, revise a semana e ajuste o próximo cronograma."
            />
            <div className="grid gap-3">
              {lowEngagementStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.06] p-4">
                  <div>
                    <p className="font-semibold text-white">{student.name}</p>
                    <p className="text-sm text-muted">{student.completionRate}% de conclusão da semana</p>
                  </div>
                  <FollowUpButton student={student} />
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Ações de hoje" description="Atalhos para operar a assessoria." />
            <TodayActions
              sessions={weeklySessions}
              students={students}
              pendingPayments={pendingPayments}
            />
          </Card>
          <Card>
            <CardHeader title="Financeiro discreto" description="Pendências sem roubar o foco da operação." />
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <WalletCards className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="font-black text-white">{pendingPayments.length} mensalidades pendentes</p>
                <p className="text-sm text-muted">Abra Financeiro para histórico e lembretes.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
