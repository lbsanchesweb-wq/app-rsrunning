"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && Boolean(window.navigator.standalone))
  );
}

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [installed, setInstalled] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setInstalled(isStandalone());

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setShowIosHint(isIos && !isStandalone());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
      showToast("App instalado");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [showToast]);

  async function installApp() {
    if (installed) {
      showToast("O app já está instalado");
      return;
    }

    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        showToast("Instalação iniciada");
        setInstallPrompt(null);
      }
      return;
    }

    if (showIosHint) {
      showToast("No iPhone, toque em Compartilhar e depois em Adicionar à Tela de Início");
      return;
    }

    showToast("Se disponível, use o menu do navegador para instalar o app");
  }

  if (installed) return null;

  return (
    <Button
      variant="outline"
      className={compact ? "h-10 w-10 rounded-2xl px-0 md:w-auto md:px-4" : "rounded-2xl"}
      onClick={installApp}
      aria-label="Instalar aplicativo"
    >
      {compact ? <Smartphone className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      <span className={compact ? "hidden md:inline" : undefined}>Instalar App</span>
    </Button>
  );
}
