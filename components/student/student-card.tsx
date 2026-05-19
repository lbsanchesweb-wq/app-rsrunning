"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity, CheckCircle2, CreditCard, FileText, Trophy } from "lucide-react";
import type { Student } from "@/lib/types";
import { ActionSheet } from "@/components/ui/action-sheet";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { payments, weeklySessions } from "@/lib/data";

export function StudentCard({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full text-left transition duration-200 hover:-translate-y-1 active:translate-y-0 active:scale-[0.99]"
      >
        <Card className="h-full">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">{student.name}</h3>
              <p className="mt-1 text-sm text-muted">{student.goal}</p>
            </div>
            <Badge>{student.active ? "Ativo" : "Pausado"}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <InfoTile icon={Activity} label="semana" value={`${student.weeklyVolumeKm} km`} />
            <InfoTile icon={Trophy} label="prova" value={student.nextRace} />
          </div>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs text-muted">
              <span>Conclusão</span>
              <span>{student.completionRate}%</span>
            </div>
            <Progress value={student.completionRate} />
          </div>
          <p className="mt-4 text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100">
            Toque para ver detalhes
          </p>
        </Card>
      </button>

      <StudentDetailsSheet student={student} open={open} onOpenChange={setOpen} />
    </>
  );
}

export function StudentDetailsSheet({
  student,
  open,
  onOpenChange,
}: {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const studentSessions = weeklySessions.filter((session) => session.studentId === student.id);
  const payment = payments.find((item) => item.studentName === student.name);
  const paymentLabel = {
    paid: "Em dia",
    pending: "Pendente",
    overdue: "Atrasado",
  } as const;

  return (
    <ActionSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title={student.name}
      description={student.goal}
    >
      <div>
        <p className="mb-4 text-sm font-semibold text-primary">Perfil do aluno</p>
        <div className="grid grid-cols-2 gap-3">
          <InfoTile icon={Activity} label="Volume semanal" value={`${student.weeklyVolumeKm} km`} />
          <InfoTile icon={CheckCircle2} label="Conclusão" value={`${student.completionRate}%`} />
          <InfoTile icon={Trophy} label="Prova alvo" value={student.nextRace} />
          <InfoTile
            icon={CreditCard}
            label="Financeiro"
            value={payment ? paymentLabel[payment.status] : "Sem registro"}
          />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm text-muted">
            <span>Evolução</span>
            <span>{student.completionRate}%</span>
          </div>
          <Progress value={student.completionRate} className="h-3" />
        </div>

        <div className="mt-5 rounded-2xl bg-white/[0.06] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <FileText className="h-4 w-4 text-primary" aria-hidden />
            Observações
          </div>
          <p className="text-sm leading-6 text-muted">
            Manter foco em consistência, sono e recuperação. Boa resposta aos treinos moderados.
          </p>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-white">Histórico de treinos</h3>
          <div className="mt-3 space-y-2">
            {(studentSessions.length ? studentSessions : weeklySessions.slice(0, 3)).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-2xl bg-white/[0.06] p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{session.title}</p>
                  <p className="text-xs text-muted">{session.day} / {session.distanceKm} km</p>
                </div>
                <Badge className={session.status === "done" ? "bg-primary text-black" : undefined}>
                  {session.status === "done" ? "Concluído" : "Programado"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ActionSheet>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-3">
      <Icon className="mb-2 h-4 w-4 text-primary" aria-hidden />
      <p className="truncate text-sm font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
