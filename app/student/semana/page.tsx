import { AppShell } from "@/components/layout/app-shell";
import { WeeklySchedule } from "@/components/training/weekly-schedule";
import { weeklySessions } from "@/lib/data";

export default function StudentWeekPage() {
  return (
    <AppShell mode="student" title="Semana" subtitle="Seu cronograma personalizado publicado pelo professor.">
      <WeeklySchedule sessions={weeklySessions} />
    </AppShell>
  );
}
