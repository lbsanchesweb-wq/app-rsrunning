export type UserRole = "coach" | "student";

export type TrainingType =
  | "Rodagem leve"
  | "Rodagem moderada"
  | "Fartlek"
  | "Tiros"
  | "Longão"
  | "Rampa"
  | "Prova";

export type SessionStatus = "scheduled" | "done" | "missed";

export type PaymentStatus = "paid" | "pending" | "overdue";

export type Student = {
  id: string;
  name: string;
  goal: string;
  active: boolean;
  nextRace: string;
  weeklyVolumeKm: number;
  completionRate: number;
};

export type TrainingSession = {
  id: string;
  studentId: string;
  day: string;
  date: string;
  type: TrainingType;
  title: string;
  distanceKm: number;
  pace?: string;
  status: SessionStatus;
  feeling?: "leve" | "moderado" | "forte";
};

export type Payment = {
  id: string;
  studentName: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
};

export type Metric = {
  label: string;
  value: string;
  helper: string;
};
