import { Activity, BadgeCheck, Medal, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { StudentProfileEditButton } from "@/components/profile/student-profile-edit-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";

const achievements = [
  { icon: Trophy, title: "Semana completa", helper: "4 treinos concluídos" },
  { icon: Medal, title: "Consistência", helper: "30 dias ativos" },
  { icon: Sparkles, title: "Evolução", helper: "+12% no índice" },
];

const stats = [
  { label: "Km acumulados", value: "428 km" },
  { label: "Treinos feitos", value: "76" },
  { label: "Sequência atual", value: "4 dias" },
  { label: "Conclusão", value: "86%" },
];

export default function StudentProfilePage() {
  return (
    <AppShell mode="student" title="Perfil" subtitle="Sua jornada, conquistas e conexões.">
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <div className="flex items-start gap-4">
            <AvatarUpload label="Enviar foto do aluno" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary">Aluno RS Running</p>
              <h1 className="mt-1 text-2xl font-black text-white">Marina Costa</h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                Foco em meia maratona, consistência semanal e evolução com controle.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/[0.06] p-4">
                <p className="text-xs text-muted">{stat.label}</p>
                <p className="mt-1 font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <StudentProfileEditButton />
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Seu professor"
              description="Informações principais, de forma discreta."
              action={<Badge>Ativo</Badge>}
            />
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">Rui Sanches</p>
                <p className="text-sm text-muted">Corrida de rua / Meia maratona</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Insígnias conquistadas" description="Marcos importantes da sua evolução." />
            <div className="grid gap-3 sm:grid-cols-3">
              {achievements.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-2xl bg-white/[0.06] p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 text-muted">{item.helper}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Conexões"
              description="Sincronização com relógios e aplicativos."
              action={<Activity className="h-5 w-5 text-primary" />}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <IntegrationCard name="Garmin" helper="Conectar relógio" logo="GARMIN" />
              <IntegrationCard name="Strava" helper="Importar atividades" logo="STRAVA" />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function IntegrationCard({
  name,
  helper,
  logo,
}: {
  name: string;
  helper: string;
  logo: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white/[0.05] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-black tracking-[0.08em] text-white">{logo}</p>
          <p className="mt-1 text-sm text-muted">{helper}</p>
        </div>
        <Badge className="border-white/15 bg-white/10 text-muted">Em breve</Badge>
      </div>
      <Button variant="outline" className="mt-4 w-full rounded-2xl" disabled>
        <BadgeCheck className="h-4 w-4" />
        Configurar {name}
      </Button>
    </div>
  );
}
