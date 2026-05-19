"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Camera, UserRound } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function AvatarUpload({
  label,
  size = "lg",
}: {
  label: string;
  size?: "md" | "lg";
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const dimensions = size === "lg" ? "h-24 w-24 rounded-[2rem]" : "h-20 w-20 rounded-[1.75rem]";
  const iconSize = size === "lg" ? "h-11 w-11" : "h-10 w-10";

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFile(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Selecione uma imagem válida");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    showToast("Foto carregada");
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`${dimensions} relative flex items-center justify-center overflow-hidden border border-primary/25 bg-primary/10 text-primary shadow-glow transition hover:border-primary/50 hover:bg-primary/15 active:scale-[0.98]`}
        aria-label={label}
      >
        {preview ? (
          <Image src={preview} alt={label} fill sizes={size === "lg" ? "96px" : "80px"} className="object-cover" />
        ) : (
          <UserRound className={iconSize} aria-hidden />
        )}
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-black shadow-glow transition hover:bg-secondary active:scale-95"
        aria-label={label}
      >
        <Camera className="h-4 w-4" aria-hidden />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}
