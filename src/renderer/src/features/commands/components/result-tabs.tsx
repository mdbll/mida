import { Button } from "@/components/ui/button";
import type { TabId } from "../../../../../shared/commands";

type ResultTabsProps = {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  onClear: () => void;
};

export function ResultTabs({ activeTab, onChange, onClear }: ResultTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange("terminal")}
          className={[
            "rounded-lg px-2.5 py-1.5 text-[11px] transition",
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
            "rounded-lg px-2.5 py-1.5 text-[11px] transition",
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
