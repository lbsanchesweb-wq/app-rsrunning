"use client";

import { useState } from "react";
import type { Student } from "@/lib/types";
import { StudentDetailsSheet } from "@/components/student/student-card";

export function FollowUpButton({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-full border border-yellow-300/30 bg-yellow-300/10 px-2.5 py-1 text-xs font-medium text-yellow-100 transition hover:-translate-y-0.5 hover:bg-yellow-300/15 active:translate-y-0 active:scale-95"
      >
        Acompanhar
      </button>
      <StudentDetailsSheet student={student} open={open} onOpenChange={setOpen} />
    </>
  );
}
