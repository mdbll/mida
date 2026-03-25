import { PORT_RANGE_OPTIONS } from "../config";
import type { ActionConfig } from "../types";

type CommandFormProps = {
  action: ActionConfig;
  customPortRange: string;
  selectedPortRange: string;
  target: string;
  validationError: string;
  onCustomPortRangeChange: (value: string) => void;
  onSelectedPortRangeChange: (value: string) => void;
  onTargetChange: (value: string) => void;
};

export function CommandForm({
  action,
  customPortRange,
  selectedPortRange,
  target,
  validationError,
  onCustomPortRangeChange,
  onSelectedPortRangeChange,
  onTargetChange
}: CommandFormProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-zinc-900/70 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Type</p>
          <p className="mt-1.5 text-[11px] text-zinc-200">
            {action.category === "scan" ? "Nmap" : "Systeme"}
          </p>
        </div>

        {action.needsTarget ? (
          <label className="rounded-lg bg-zinc-900/70 p-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Cible
            </span>
            <input
              value={target}
              onChange={(event) => onTargetChange(event.target.value)}
              placeholder="192.168.1.1 ou 192.168.1.0/24"
              className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-300/40"
            />
          </label>
        ) : (
          <div className="rounded-lg bg-zinc-900/70 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Cible</p>
            <p className="mt-1.5 text-[11px] text-zinc-500">Non requise</p>
          </div>
        )}

        {action.needsPortRange ? (
          <label className="rounded-lg bg-zinc-900/70 p-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Plage de ports
            </span>
            <select
              value={selectedPortRange}
              onChange={(event) => onSelectedPortRangeChange(event.target.value)}
              className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition focus:border-amber-300/40"
            >
              {PORT_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="rounded-lg bg-zinc-900/70 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Parametre
            </p>
            <p className="mt-1.5 text-[11px] text-zinc-500">
              Aucun parametre supplementaire
            </p>
          </div>
        )}

        {action.needsPortRange ? (
          <label className="rounded-lg bg-zinc-900/70 p-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Valeur effective
            </span>
            <input
              value={
                selectedPortRange === "custom" ? customPortRange : selectedPortRange
              }
              onChange={(event) => onCustomPortRangeChange(event.target.value)}
              disabled={selectedPortRange !== "custom"}
              placeholder="1-65535"
              className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition placeholder:text-zinc-500 disabled:opacity-50 focus:border-amber-300/40"
            />
          </label>
        ) : (
          <div className="rounded-lg bg-zinc-900/70 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Execution
            </p>
            <p className="mt-1.5 text-[11px] text-zinc-500">
              Clique sur Executer pour lancer l'action.
            </p>
          </div>
        )}
      </div>

      {validationError ? (
        <p className="mt-3 text-[11px] text-amber-300">{validationError}</p>
      ) : null}
    </section>
  );
}
