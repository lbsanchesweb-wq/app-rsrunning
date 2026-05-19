import { Brand } from "@/components/layout/brand";
import { NotificationsButton } from "@/components/actions/notifications-button";
import { QuickCreateButton } from "@/components/actions/quick-create-button";

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-background/85 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Brand />
        <div className="hidden min-w-0 flex-1 md:block">
          <h1 className="truncate text-xl font-bold text-white">{title}</h1>
          <p className="truncate text-sm text-muted">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationsButton />
          <QuickCreateButton />
        </div>
      </div>
    </header>
  );
}
