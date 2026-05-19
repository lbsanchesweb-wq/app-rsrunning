"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ClipboardList, Send, UserRound } from "lucide-react";
import { students, weeklySessions } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const weeklySlots = ["Treino 1", "Treino 2", "Treino 3", "Treino 4"];

const monthWeeks = [
  { id: "semana-1", label: "Semana 1", range: "04 a 10 mai", status: "publicada" },
  { id: "semana-2", label: "Semana 2", range: "11 a 17 mai", status: "publicada" },
  { id: "semana-3", label: "Semana 3", range: "18 a 24 mai", status: "rascunho" },
  { id: "semana-4", label: "Semana 4", range: "25 a 31 mai", status: "planejar" },
];

export function WeeklyPlanBuilder() {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [weekId, setWeekId] = useState(monthWeeks[2].id);
  const [published, setPublished] = useState(false);
  const { showToast } = useToast();
  const selectedStudent = useMemo(
    () => students.find((student) => student.id === studentId) ?? students[0],
    [studentId],
  );
  const selectedWeek = monthWeeks.find((week) => week.id === weekId) ?? monthWeeks[0];

  function publishWeek() {
    setPublished(true);
    showToast(`${selectedWeek.label} publicada para ${selectedStudent.name}`);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <CardHeader
          title="Montar semana"
          description="Escolha o aluno e organize os 4 treinos que ele vai receber."
        />
        <label className="block">
          <span className="text-sm font-semibold text-white">Aluno</span>
          <div className="mt-2 flex h-12 items-center gap-2 rounded-2xl border border-border bg-white/[0.05] px-3">
            <UserRound className="h-4 w-4 text-primary" aria-hidden />
            <select
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value);
                setPublished(false);
              }}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id} className="bg-card">
                  {student.name}
                </option>
              ))}
            </select>
          </div>
        </label>

        <div className="mt-5 rounded-2xl bg-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <p className="font-semibold text-white">{selectedWeek.label}</p>
              <p className="text-sm text-muted">{selectedWeek.range} / 4 treinos</p>
            </div>
          </div>
        </div>

        <Button className="mt-5 w-full rounded-2xl" onClick={publishWeek}>
          {published ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {published ? "Semana publicada" : "Publicar para o aluno"}
        </Button>
      </Card>

      <Card>
        <CardHeader
          title={`Cronograma de ${selectedStudent.name}`}
          description="Organize visualmente as semanas do mês antes de publicar."
          action={<Badge>{published ? "Publicado" : "Rascunho"}</Badge>}
        />
        <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {monthWeeks.map((week) => {
            const active = week.id === weekId;

            return (
              <button
                key={week.id}
                type="button"
                onClick={() => {
                  setWeekId(week.id);
                  setPublished(week.status === "publicada");
                }}
                className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] ${
                  active
                    ? "border-primary/60 bg-primary/10 shadow-glow"
                    : "border-border bg-white/[0.04] hover:bg-white/[0.07]"
                }`}
              >
                <p className={active ? "font-black text-primary" : "font-bold text-white"}>{week.label}</p>
                <p className="mt-1 text-xs text-muted">{week.range}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {week.status}
                </p>
              </button>
            );
          })}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {weeklySlots.map((slot, index) => {
            const session = weeklySessions[index];

            return (
              <div key={slot} className="rounded-3xl border border-border bg-white/[0.05] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      {slot}
                    </p>
                    <h3 className="mt-2 text-lg font-black text-white">{session.title}</h3>
                    <p className="mt-1 text-sm text-muted">{session.day} / {session.type}</p>
                  </div>
                  <ClipboardList className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted">
                  <span className="rounded-full bg-white/[0.07] px-3 py-1.5">{session.distanceKm} km</span>
                  {session.pace ? (
                    <span className="rounded-full bg-white/[0.07] px-3 py-1.5">{session.pace}</span>
                  ) : null}
                  <span className="rounded-full bg-white/[0.07] px-3 py-1.5">Objetivo definido</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
