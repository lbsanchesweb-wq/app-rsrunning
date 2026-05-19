"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const alreadyShown = window.sessionStorage.getItem("rs-running-splash");

    if (alreadyShown) return;

    setVisible(true);
    window.sessionStorage.setItem("rs-running-splash", "true");

    const leaveTimer = window.setTimeout(() => setLeaving(true), 1500);
    const hideTimer = window.setTimeout(() => setVisible(false), 1950);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] grid place-items-center bg-background transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      aria-label="Carregando RS Running"
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid h-28 w-28 place-items-center rounded-[2rem] border border-primary/25 bg-card shadow-glow">
          <Image
            src="/re-running-brand.png"
            alt="RS Running"
            width={92}
            height={52}
            priority
            className="animate-logo-pulse object-contain"
          />
        </div>
        <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-primary animate-loading-bar" />
        </div>
        <p className="mt-4 text-sm font-semibold text-muted">Preparando sua semana de treinos</p>
      </div>
    </div>
  );
}
