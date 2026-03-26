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
    <aside className="overflow-hidden border-b border-white/10 bg-zinc-950/90 px-3 py-5 lg:border-b-0 lg:border-r">
      <div className="mb-6 px-2">
        {/* <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Mida</p> */}
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white">
          Mida
        </h1>
      </div>

      <nav className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
        {actions.map((action) => {
          const isActive = action.id === selectedAction;

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelect(action.id)}
              className={[
                "w-full rounded-xl border px-4 py-3 text-left transition",
                isActive
                  ? "border-amber-300/30 bg-amber-300/10"
                  : "border-white/10 bg-white/5 hover:bg-white/8"
              ].join(" ")}
            >
              <span className="text-sm font-medium text-white">{action.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
