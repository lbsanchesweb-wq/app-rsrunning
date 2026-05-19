"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ProfileSaveButton() {
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function save() {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      showToast("Perfil atualizado");
    }, 600);
  }

  return (
    <Button className="mt-6 w-full rounded-2xl sm:w-auto" onClick={save} disabled={saving}>
      <Save className="h-4 w-4" />
      {saving ? "Salvando..." : "Salvar perfil"}
    </Button>
  );
}
