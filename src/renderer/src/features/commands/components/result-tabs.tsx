import { Button } from "@/components/ui/button";
import type { TabId } from "../../../../../shared/commands";

type ResultTabsProps = {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  onClear: () => void;
};

export function ResultTabs({ activeTab, onChange, onClear }: ResultTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onChange("terminal")}
          className={[
            "rounded-xl px-3.5 py-2 text-sm transition",
            activeTab === "terminal"
              ? "bg-white text-zinc-950"
              : "bg-white/5 text-zinc-300 hover:bg-white/10"
          ].join(" ")}
        >
          Terminal
        </button>
        <button
          type="button"
          onClick={() => onChange("summary")}
          className={[
            "rounded-xl px-3.5 py-2 text-sm transition",
            activeTab === "summary"
              ? "bg-white text-zinc-950"
              : "bg-white/5 text-zinc-300 hover:bg-white/10"
          ].join(" ")}
        >
          Résumé
        </button>
      </div>

      <Button size="sm" variant="secondary" onClick={onClear}>
        Vider
      </Button>
    </div>
  );
}
