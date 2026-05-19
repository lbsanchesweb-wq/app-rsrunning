import Link from "next/link";
import { CalendarDays, Flame, TrendingUp, WalletCards } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CoachCard } from "@/components/student/coach-card";
import { TrainingCard } from "@/components/training/training-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { studentMetrics, weeklySessions } from "@/lib/data";

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
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5">
        <CoachCard />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-primary/20">
          <CardHeader title="Treino do dia" description="Execute e registre sua sensação." />
          <TrainingCard session={weeklySessions[1]} />
        </Card>
        <Card>
          <CardHeader title="Acessos rápidos" description="Abra cada área em uma página dedicada." />
          <div className="grid gap-3">
            <Shortcut href="/student/semana" icon={CalendarDays} title="Ver semana" helper="Cronograma completo com 4 treinos." />
            <Shortcut href="/student/evolucao" icon={TrendingUp} title="Ver evolução" helper="Sequência, conclusão e progresso." />
            <Shortcut href="/student/mensalidade" icon={WalletCards} title="Ver mensalidade" helper="Status e histórico financeiro." />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Shortcut({
  href,
  icon: Icon,
  title,
  helper,
}: {
  href: string;
  icon: typeof CalendarDays;
  title: string;
  helper: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4 transition hover:bg-white/[0.09] active:scale-[0.99]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-white">{title}</p>
        <p className="text-sm text-muted">{helper}</p>
      </div>
    </Link>
  );
}
