import { AppShell } from "@/components/layout/app-shell";
import { AddTrainingButton } from "@/components/actions/add-training-button";
import { WeeklyPlanBuilder } from "@/components/training/weekly-plan-builder";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const trainingTypes = ["Rodagem leve", "Rodagem moderada", "Fartlek", "Tiros", "Longão", "Rampa"];

export default function TrainingPage() {
  return (
    <AppShell title="Treinos" subtitle="Monte e publique semanas personalizadas para cada aluno.">
      <Card className="mb-5">
        <CardHeader
          title="Biblioteca de treinos"
          description="Use os modelos como base para criar o cronograma semanal do aluno."
          action={<AddTrainingButton />}
        />
        <div className="flex flex-wrap gap-2">
          {trainingTypes.map((type) => (
            <Badge key={type}>{type}</Badge>
          ))}
        </div>
      </Card>
      <WeeklyPlanBuilder />
    </AppShell>
  );
}
