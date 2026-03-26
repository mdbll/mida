import type {
  HashFileEntry,
  WordlistEntry
} from "../../../../../shared/commands";
import {
  HASHCAT_MODE_OPTIONS,
  HYDRA_HOST_OPTIONS,
  PORT_RANGE_OPTIONS
} from "../config";
import type { ActionConfig } from "../types";

type CommandFormProps = {
  action: ActionConfig;
  customPortRange: string;
  hashFile: string;
  hashFiles: HashFileEntry[];
  host: string;
  mode: string;
  selectedPortRange: string;
  target: string;
  username: string;
  validationError: string;
  wordlist: string;
  wordlists: WordlistEntry[];
  onCustomPortRangeChange: (value: string) => void;
  onHashFileChange: (value: string) => void;
  onHostChange: (value: string) => void;
  onModeChange: (value: string) => void;
  onSelectedPortRangeChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onWordlistChange: (value: string) => void;
};

export function CommandForm({
  action,
  customPortRange,
  hashFile,
  hashFiles,
  host,
  mode,
  selectedPortRange,
  target,
  username,
  validationError,
  wordlist,
  wordlists,
  onCustomPortRangeChange,
  onHashFileChange,
  onHostChange,
  onModeChange,
  onSelectedPortRangeChange,
  onTargetChange,
  onUsernameChange,
  onWordlistChange
}: CommandFormProps) {
  const hasVisibleFields =
    action.needsHost ||
    action.needsMode ||
    action.needsUsername ||
    action.needsTarget ||
    action.needsHashFile ||
    action.needsWordlist ||
    action.needsPortRange;

  if (!hasVisibleFields && !validationError) {
    return null;
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-3">
      {hasVisibleFields ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {action.needsHost ? (
            <label className="rounded-lg bg-zinc-900/70 p-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Host
              </span>
              <select
                value={host}
                onChange={(event) => onHostChange(event.target.value)}
                className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition focus:border-amber-300/40"
              >
                {HYDRA_HOST_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {action.needsMode ? (
            <label className="rounded-lg bg-zinc-900/70 p-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Mode
              </span>
              <select
                value={mode}
                onChange={(event) => onModeChange(event.target.value)}
                className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition focus:border-amber-300/40"
              >
                {HASHCAT_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {action.needsUsername ? (
            <label className="rounded-lg bg-zinc-900/70 p-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Utilisateur
              </span>
              <input
                value={username}
                onChange={(event) => onUsernameChange(event.target.value)}
                placeholder="admin"
                className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-300/40"
              />
            </label>
          ) : null}

          {action.needsTarget ? (
            <label className="rounded-lg bg-zinc-900/70 p-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                IP cible
              </span>
              <input
                value={target}
                onChange={(event) => onTargetChange(event.target.value)}
                placeholder="192.168.1.1 ou 192.168.1.0/24"
                className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-300/40"
              />
            </label>
          ) : null}

          {action.needsHashFile ? (
            <label className="rounded-lg bg-zinc-900/70 p-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Fichier hash
              </span>
              <select
                value={hashFile}
                onChange={(event) => onHashFileChange(event.target.value)}
                className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition focus:border-amber-300/40"
              >
                {hashFiles.length > 0 ? (
                  hashFiles.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))
                ) : (
                  <option value="">Aucun fichier hash</option>
                )}
              </select>
            </label>
          ) : null}

          {action.needsWordlist ? (
            <label className="rounded-lg bg-zinc-900/70 p-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Wordlist
              </span>
              <select
                value={wordlist}
                onChange={(event) => onWordlistChange(event.target.value)}
                className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition focus:border-amber-300/40"
              >
                {wordlists.length > 0 ? (
                  wordlists.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))
                ) : (
                  <option value="">Aucune wordlist</option>
                )}
              </select>
            </label>
          ) : null}

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
          ) : null}

          {action.needsPortRange && selectedPortRange === "custom" ? (
            <label className="rounded-lg bg-zinc-900/70 p-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Valeur effective
              </span>
              <input
                value={customPortRange}
                onChange={(event) => onCustomPortRangeChange(event.target.value)}
                placeholder="1-65535"
                className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-300/40"
              />
            </label>
          ) : null}
        </div>
      ) : null}

      {validationError ? (
        <p className="mt-3 text-[11px] text-amber-300">{validationError}</p>
      ) : null}
    </section>
  );
}
