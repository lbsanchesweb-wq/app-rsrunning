import { AppShell } from "@/components/layout/app-shell";
import { WeeklySchedule } from "@/components/training/weekly-schedule";
import { AddTrainingButton } from "@/components/actions/add-training-button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { weeklySessions } from "@/lib/data";

const trainingTypes = ["Rodagem leve", "Rodagem moderada", "Fartlek", "Tiros", "Longão", "Rampa", "Prova"];

export default function TrainingPage() {
  return (
    <AppShell title="Treinos" subtitle="Monte semanas de treino e acompanhe conclusões.">
      <Card>
        <CardHeader
          title="Tipos de treino"
          description="Biblioteca base para montar a semana dos alunos."
          action={<AddTrainingButton />}
        />
        <div className="flex flex-wrap gap-2">
          {trainingTypes.map((type) => (
            <Badge key={type}>{type}</Badge>
          ))}
        </div>
      </Card>
      <div className="mt-5">
        <WeeklySchedule sessions={weeklySessions} />
      </div>
    </AppShell>
  );
}
