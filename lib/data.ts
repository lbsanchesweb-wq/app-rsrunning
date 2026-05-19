import type { Metric, Payment, Student, TrainingSession } from "@/lib/types";

export const coachMetrics: Metric[] = [
  { label: "Semanas publicadas", value: "18", helper: "alunos ativos" },
  { label: "Treinos concluídos", value: "318", helper: "semana atual" },
  { label: "Receita prevista", value: "R$ 8.940", helper: "maio" },
];

export const studentMetrics: Metric[] = [
  { label: "Semana", value: "32 km", helper: "volume planejado" },
  { label: "Conclusão", value: "86%", helper: "últimos 30 dias" },
  { label: "Cronograma", value: "4/4", helper: "treinos da semana" },
];

export const students: Student[] = [
  {
    id: "stu-1",
    name: "Marina Costa",
    goal: "Meia maratona sub 2h",
    active: true,
    nextRace: "SP City 21K",
    weeklyVolumeKm: 36,
    completionRate: 92,
  },
  {
    id: "stu-2",
    name: "Rafael Lima",
    goal: "Primeiros 10K",
    active: true,
    nextRace: "Track&Field Run",
    weeklyVolumeKm: 24,
    completionRate: 78,
  },
  {
    id: "stu-3",
    name: "Beatriz Nunes",
    goal: "Base aeróbica",
    active: true,
    nextRace: "Sem prova definida",
    weeklyVolumeKm: 18,
    completionRate: 84,
  },
];

export const weeklySessions: TrainingSession[] = [
  {
    id: "ses-1",
    studentId: "stu-1",
    day: "Seg",
    date: "18 mai",
    type: "Rodagem leve",
    title: "Base leve + mobilidade",
    distanceKm: 6,
    pace: "6:10/km",
    status: "done",
    feeling: "leve",
  },
  {
    id: "ses-2",
    studentId: "stu-1",
    day: "Ter",
    date: "19 mai",
    type: "Tiros",
    title: "6x 600m forte",
    distanceKm: 8,
    pace: "4:45/km",
    status: "scheduled",
  },
  {
    id: "ses-3",
    studentId: "stu-1",
    day: "Qui",
    date: "21 mai",
    type: "Rodagem moderada",
    title: "Ritmo controlado",
    distanceKm: 10,
    pace: "5:35/km",
    status: "scheduled",
  },
  {
    id: "ses-4",
    studentId: "stu-1",
    day: "Dom",
    date: "24 mai",
    type: "Longão",
    title: "Longão progressivo",
    distanceKm: 14,
    pace: "5:55/km",
    status: "scheduled",
  },
];

export const payments: Payment[] = [
  {
    id: "pay-1",
    studentName: "Marina Costa",
    amount: 249,
    dueDate: "20 mai",
    status: "paid",
  },
  {
    id: "pay-2",
    studentName: "Rafael Lima",
    amount: 219,
    dueDate: "25 mai",
    status: "pending",
  },
  {
    id: "pay-3",
    studentName: "Beatriz Nunes",
    amount: 219,
    dueDate: "15 mai",
    status: "overdue",
  },
];
