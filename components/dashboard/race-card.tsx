"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Timer, Trophy } from "lucide-react";
import type { Student } from "@/lib/types";
import { ActionSheet } from "@/components/ui/action-sheet";
import { Card } from "@/components/ui/card";

export function RaceCard({
  student,
  variant = "list",
}: {
  student: Student;
  variant?: "list" | "metric";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
      >
        {variant === "metric" ? (
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Próxima prova
            </p>
            <p className="mt-3 text-3xl font-black text-white">21K</p>
            <p className="mt-2 truncate text-sm font-semibold text-primary">{student.nextRace}</p>
          </Card>
        ) : (
          <div className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.06] p-4 transition hover:bg-white/[0.09]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{student.nextRace}</p>
              <p className="truncate text-sm text-muted">{student.name}</p>
            </div>
          </div>
        )}
      </button>
      <RaceDetailsSheet student={student} open={open} onOpenChange={setOpen} />
    </>
  );
}

export function RaceDetailsSheet({
  student,
  open,
  onOpenChange,
}: {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ActionSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title={student.nextRace}
      description={`Estratégia de prova de ${student.name}`}
    >
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <RaceInfo icon={CalendarDays} label="Data" value="30 jun" />
          <RaceInfo icon={MapPin} label="Local" value="São Paulo" />
          <RaceInfo icon={Trophy} label="Distância" value="21 km" />
          <RaceInfo icon={Timer} label="Faltam" value="43 dias" />
        </div>
        <div className="rounded-2xl bg-white/[0.06] p-4">
          <p className="text-sm font-semibold text-white">Estratégia</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Largar controlado, estabilizar no ritmo alvo até o km 16 e acelerar se a percepção estiver leve.
          </p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] p-4">
          <p className="text-sm font-semibold text-white">Observações do professor</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Priorizar hidratação, controlar os primeiros quilômetros e respeitar o plano de ritmo.
          </p>
        </div>
      </div>
    </ActionSheet>
  );
}

function RaceInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-4">
      <Icon className="mb-2 h-4 w-4 text-primary" />
      <p className="font-black text-white">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
