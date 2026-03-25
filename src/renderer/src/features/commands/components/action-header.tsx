import { Button } from "@/components/ui/button";
import type { ActionConfig } from "../types";

type ActionHeaderProps = {
  action: ActionConfig;
  isRunning: boolean;
  platform: string;
  onRun: () => void;
};

export function ActionHeader({
  action,
  isRunning,
  platform,
  onRun
}: ActionHeaderProps) {
  return (
    <header className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] text-zinc-500">Action selectionnee</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
            {action.label}
          </h2>
          <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-zinc-400">
            {action.description}
          </p>
          <p className="mt-1 text-[11px] leading-5 text-zinc-500">{action.helper}</p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-400">
            {platform}
          </div>
          <Button onClick={onRun} disabled={isRunning}>
            {isRunning ? "Execution..." : "Executer"}
          </Button>
        </div>
      </div>
    </header>
  );
}
