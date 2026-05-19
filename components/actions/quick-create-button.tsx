"use client";

import { usePathname } from "next/navigation";
import { AddStudentButton } from "@/components/actions/add-student-button";
import { AddTrainingButton } from "@/components/actions/add-training-button";

export function QuickCreateButton() {
  const pathname = usePathname();

  if (pathname.startsWith("/training")) {
    return <AddTrainingButton compact />;
  }

  return <AddStudentButton compact />;
}
