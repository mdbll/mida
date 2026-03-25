import type { ActionId } from "../../../../../shared/commands";
import type { ActionConfig } from "../types";

type ActionSidebarProps = {
  actions: ActionConfig[];
  selectedAction: ActionId;
  onSelect: (actionId: ActionId) => void;
};

export function ActionSidebar({
  actions,
  selectedAction,
  onSelect
}: ActionSidebarProps) {
  return (
    <aside className="overflow-hidden border-b border-white/10 bg-zinc-950/90 px-2.5 py-4 lg:border-b-0 lg:border-r">
      <div className="mb-5 px-1.5">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Mida</p>
        <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
          Kali Commands
        </h1>
        <p className="mt-1.5 text-[11px] leading-5 text-zinc-400">
          Reseau local, scans Nmap et synthese exploitable.
        </p>
      </div>

      <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {actions.map((action) => {
          const isActive = action.id === selectedAction;

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelect(action.id)}
              className={[
                "w-full rounded-lg border px-3 py-2.5 text-left transition",
                isActive
                  ? "border-amber-300/30 bg-amber-300/10"
                  : "border-white/10 bg-white/5 hover:bg-white/8"
              ].join(" ")}
            >
              <span className="text-[11px] font-medium text-white">{action.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
