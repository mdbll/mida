import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type ActionId = "ipAddress" | "nmapDiscovery" | "nmapQuick" | "nmapPorts";
type TabId = "terminal" | "summary";

type CommandPayload = {
  target?: string;
  portRange?: string;
};

type CommandResult = {
  ok: boolean;
  actionId: ActionId;
  command: string;
  stdout: string;
  stderr: string;
};

type CommandEvent = {
  runId: string;
  type: "start" | "stdout" | "stderr" | "complete";
  command?: string;
  chunk?: string;
  result?: CommandResult;
};

type ActionConfig = {
  id: ActionId;
  label: string;
  description: string;
  category: "system" | "scan";
  needsTarget?: boolean;
  needsPortRange?: boolean;
  helper: string;
};

type InterfaceSummary = {
  name: string;
  state: string;
  mac: string | null;
  ipv4: string[];
  ipv6: string[];
};

type NmapPort = {
  port: string;
  state: string;
  service: string;
  version: string;
};

type NmapSummary = {
  target: string | null;
  hostState: string | null;
  latency: string | null;
  openPorts: NmapPort[];
  hostnames: string[];
  interestingFacts: string[];
};

const ACTIONS: ActionConfig[] = [
  {
    id: "ipAddress",
    label: "Reseau",
    description: "Inspecter les interfaces locales et les adresses IP de la machine.",
    category: "system",
    helper: "Commande locale utile pour voir les interfaces, IPv4, IPv6 et l'etat reseau."
  },
  {
    id: "nmapDiscovery",
    label: "Decouverte",
    description: "Verifier si une cible ou un sous-reseau repond sans lancer un scan de ports.",
    category: "scan",
    needsTarget: true,
    helper: "Exemple: 192.168.1.10 ou 192.168.1.0/24"
  },
  {
    id: "nmapQuick",
    label: "Scan rapide",
    description: "Scanner rapidement les ports frequents pour identifier les services exposes.",
    category: "scan",
    needsTarget: true,
    helper: "Pratique pour un premier passage rapide sur une machine cible."
  },
  {
    id: "nmapPorts",
    label: "Ports cibles",
    description: "Scanner une plage de ports precise avec detection de service.",
    category: "scan",
    needsTarget: true,
    needsPortRange: true,
    helper: "Choisis une plage predefinie ou saisis une plage personnalisee."
  }
];

const PORT_RANGE_OPTIONS = [
  { label: "Top 1000", value: "1-1000" },
  { label: "Web", value: "80-443" },
  { label: "Admin", value: "20-25" },
  { label: "Services classiques", value: "21-3306" },
  { label: "Personnalisee", value: "custom" }
] as const;

function parseIpAddressOutput(output: string): InterfaceSummary[] {
  return output
    .split(/\n(?=\d+:\s)/)
    .map((section) => section.trim())
    .filter(Boolean)
    .map((section) => {
      const lines = section.split("\n").map((line) => line.trim());
      const header = lines[0] ?? "";
      const headerMatch = header.match(/^\d+:\s+([^:]+):\s+<([^>]*)>/);
      const stateMatch = header.match(/\bstate\s+([A-Z]+)/);
      const macMatch = section.match(/\blink\/\w+\s+([0-9a-f:]{17})/i);
      const ipv4 = [...section.matchAll(/\binet\s+(\d+\.\d+\.\d+\.\d+\/\d+)/g)].map(
        (match) => match[1]
      );
      const ipv6 = [...section.matchAll(/\binet6\s+([0-9a-f:]+\/\d+)/gi)].map(
        (match) => match[1]
      );

      return {
        name: headerMatch?.[1] ?? "unknown",
        state: stateMatch?.[1] ?? "UNKNOWN",
        mac: macMatch?.[1] ?? null,
        ipv4,
        ipv6
      };
    });
}

function parseNmapOutput(output: string): NmapSummary {
  const targetMatch = output.match(/Nmap scan report for\s+(.+)/);
  const hostStateMatch = output.match(/Host is (\w+)(?:\s+\(([^)]+)\))?/);
  const hostnames = [...output.matchAll(/Nmap scan report for\s+(.+)/g)].map(
    (match) => match[1].trim()
  );
  const openPorts = [...output.matchAll(/^(\d+\/\w+)\s+(\w+)\s+([\w?-]+)\s*(.*)$/gm)].map(
    (match) => ({
      port: match[1],
      state: match[2],
      service: match[3],
      version: match[4].trim()
    })
  );

  const interestingFacts: string[] = [];
  const hostsUpMatch = output.match(/(\d+)\s+hosts up/);

  if (hostsUpMatch?.[1]) {
    interestingFacts.push(`${hostsUpMatch[1]} hote(s) actif(s) detecte(s).`);
  }

  if (openPorts.length > 0) {
    interestingFacts.push(`${openPorts.length} port(s) ouvert(s) detecte(s).`);
  }

  if (output.includes("Not shown:")) {
    interestingFacts.push("Des ports supplementaires ont ete filtres ou fermes.");
  }

  if (output.includes("Service Info:")) {
    interestingFacts.push("Des informations de service supplementaires ont ete detectees.");
  }

  return {
    target: targetMatch?.[1]?.trim() ?? null,
    hostState: hostStateMatch?.[1]?.trim() ?? null,
    latency: hostStateMatch?.[2]?.trim() ?? null,
    openPorts,
    hostnames,
    interestingFacts
  };
}

function buildPayload(
  action: ActionConfig,
  target: string,
  selectedPortRange: string,
  customPortRange: string
): CommandPayload {
  if (action.id === "ipAddress") {
    return {};
  }

  const payload: CommandPayload = {
    target: target.trim()
  };

  if (action.needsPortRange) {
    payload.portRange =
      selectedPortRange === "custom" ? customPortRange.trim() : selectedPortRange;
  }

  return payload;
}

export default function App() {
  const [selectedAction, setSelectedAction] = useState<ActionId>("ipAddress");
  const [activeAction, setActiveAction] = useState<ActionId>("ipAddress");
  const [activeTab, setActiveTab] = useState<TabId>("terminal");
  const [target, setTarget] = useState("192.168.1.1");
  const [selectedPortRange, setSelectedPortRange] = useState<string>("1-1000");
  const [customPortRange, setCustomPortRange] = useState("1-65535");
  const [validationError, setValidationError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);
  const [terminalOutput, setTerminalOutput] = useState("Aucune commande executee.");
  const [liveCommand, setLiveCommand] = useState("");

  const terminalRef = useRef<HTMLPreElement | null>(null);
  const activeRunIdRef = useRef<string | null>(null);

  const currentAction = ACTIONS.find((action) => action.id === selectedAction)!;

  useEffect(() => {
    if (!window.mida?.onCommandEvent) {
      return;
    }

    return window.mida.onCommandEvent((event: CommandEvent) => {
      if (event.runId !== activeRunIdRef.current) {
        return;
      }

      if (event.type === "start") {
        const command = event.command ?? "";
        setLiveCommand(command);
        setTerminalOutput(command ? `$ ${command}\n\n` : "");
        return;
      }

      if (event.type === "stdout" || event.type === "stderr") {
        setTerminalOutput((current) => `${current}${event.chunk ?? ""}`);
        return;
      }

      if (event.type === "complete" && event.result) {
        setResult(event.result);
        setIsRunning(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }

    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminalOutput]);

  async function handleRun() {
    if (currentAction.needsTarget && !target.trim()) {
      setValidationError("Une cible IP, CIDR ou hostname est requise.");
      return;
    }

    if (
      currentAction.needsPortRange &&
      selectedPortRange === "custom" &&
      !customPortRange.trim()
    ) {
      setValidationError("Une plage de ports personnalisee est requise.");
      return;
    }

    setValidationError("");
    setIsRunning(true);
    setActiveAction(selectedAction);
    setActiveTab("terminal");
    setResult(null);
    setLiveCommand("");
    setTerminalOutput("");

    const runId = crypto.randomUUID();
    activeRunIdRef.current = runId;

    try {
      if (!window.mida?.runCommand) {
        const fallback = {
          ok: false,
          actionId: selectedAction,
          command: "preload unavailable",
          stdout: "",
          stderr: "L'API preload Electron n'est pas disponible."
        } satisfies CommandResult;

        setResult(fallback);
        setTerminalOutput(`$ ${fallback.command}\n\n${fallback.stderr}`);
        setIsRunning(false);
        return;
      }

      await window.mida.runCommand({
        runId,
        actionId: selectedAction,
        payload: buildPayload(
          currentAction,
          target,
          selectedPortRange,
          customPortRange
        )
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inattendue pendant l'execution.";

      setResult({
        ok: false,
        actionId: selectedAction,
        command: liveCommand || "command failed",
        stdout: "",
        stderr: message
      });
      setTerminalOutput((current) => `${current}${current ? "\n" : ""}${message}`);
      setIsRunning(false);
    }
  }

  function handleClearTerminal() {
    setTerminalOutput("Terminal vide.");
    setLiveCommand("");
  }

  const networkSummary = useMemo(
    () => parseIpAddressOutput(result?.actionId === "ipAddress" ? result.stdout : ""),
    [result]
  );

  const nmapSummary = useMemo(
    () =>
      parseNmapOutput(
        result && result.actionId !== "ipAddress" ? result.stdout : ""
      ),
    [result]
  );

  return (
    <main className="h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[220px_1fr]">
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
            {ACTIONS.map((action) => {
              const isActive = action.id === selectedAction;

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => setSelectedAction(action.id)}
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

        <section className="flex h-full min-h-0 flex-col overflow-hidden">
          <header className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] text-zinc-500">Action selectionnee</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
                  {currentAction.label}
                </h2>
                <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-zinc-400">
                  {currentAction.description}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                  {currentAction.helper}
                </p>
              </div>

              <div className="flex items-center gap-3 self-start lg:self-auto">
                <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-400">
                  {window.mida?.platform ?? "unknown"}
                </div>
                <Button onClick={() => void handleRun()} disabled={isRunning}>
                  {isRunning ? "Execution..." : "Executer"}
                </Button>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4">
              <section className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg bg-zinc-900/70 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Type
                    </p>
                    <p className="mt-1.5 text-[11px] text-zinc-200">
                      {currentAction.category === "scan" ? "Nmap" : "Systeme"}
                    </p>
                  </div>

                  {currentAction.needsTarget ? (
                    <label className="rounded-lg bg-zinc-900/70 p-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Cible
                      </span>
                      <input
                        value={target}
                        onChange={(event) => setTarget(event.target.value)}
                        placeholder="192.168.1.1 ou 192.168.1.0/24"
                        className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-300/40"
                      />
                    </label>
                  ) : (
                    <div className="rounded-lg bg-zinc-900/70 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Cible
                      </p>
                      <p className="mt-1.5 text-[11px] text-zinc-500">Non requise</p>
                    </div>
                  )}

                  {currentAction.needsPortRange ? (
                    <label className="rounded-lg bg-zinc-900/70 p-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Plage de ports
                      </span>
                      <select
                        value={selectedPortRange}
                        onChange={(event) => setSelectedPortRange(event.target.value)}
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

                  {currentAction.needsPortRange ? (
                    <label className="rounded-lg bg-zinc-900/70 p-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Valeur effective
                      </span>
                      <input
                        value={
                          selectedPortRange === "custom"
                            ? customPortRange
                            : selectedPortRange
                        }
                        onChange={(event) => setCustomPortRange(event.target.value)}
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

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("terminal")}
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
                    onClick={() => setActiveTab("summary")}
                    className={[
                      "rounded-lg px-2.5 py-1.5 text-[11px] transition",
                      activeTab === "summary"
                        ? "bg-white text-zinc-950"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    ].join(" ")}
                  >
                    Resume
                  </button>
                </div>

                <Button size="sm" variant="secondary" onClick={handleClearTerminal}>
                  Vider
                </Button>
              </div>

              {activeTab === "terminal" ? (
                <div className="rounded-xl border border-white/10 bg-zinc-900">
                  <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[11px] text-zinc-400">
                    <span>Terminal classique</span>
                    <span className="truncate pl-3 text-zinc-500">
                      {liveCommand || "Aucune commande en cours"}
                    </span>
                  </div>
                  <pre
                    ref={terminalRef}
                    className="max-h-[58vh] min-h-[320px] overflow-auto p-3 font-mono text-[11px] leading-5 text-zinc-200"
                  >
                    {terminalOutput}
                  </pre>
                </div>
              ) : activeAction === "ipAddress" ? (
                <div className="grid gap-3">
                  {networkSummary.length > 0 ? (
                    networkSummary.map((item) => (
                      <article
                        key={item.name}
                        className="rounded-xl border border-white/10 bg-white/5 p-3.5"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-white">{item.name}</h3>
                            <p className="mt-1 text-[11px] text-zinc-400">
                              Etat: {item.state}
                            </p>
                          </div>
                          <div className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                            interface
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                          <div className="rounded-lg bg-zinc-900/80 p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                              MAC
                            </p>
                            <p className="mt-1.5 break-all font-mono text-[11px] text-zinc-200">
                              {item.mac ?? "N/A"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-zinc-900/80 p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                              IPv4
                            </p>
                            <div className="mt-2 space-y-2">
                              {item.ipv4.length > 0 ? (
                                item.ipv4.map((value) => (
                                  <p key={value} className="font-mono text-[11px] text-zinc-200">
                                    {value}
                                  </p>
                                ))
                              ) : (
                                <p className="font-mono text-[11px] text-zinc-500">N/A</p>
                              )}
                            </div>
                          </div>

                          <div className="rounded-lg bg-zinc-900/80 p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                              IPv6
                            </p>
                            <div className="mt-2 space-y-2">
                              {item.ipv6.length > 0 ? (
                                item.ipv6.map((value) => (
                                  <p key={value} className="font-mono text-[11px] text-zinc-200">
                                    {value}
                                  </p>
                                ))
                              ) : (
                                <p className="font-mono text-[11px] text-zinc-500">N/A</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-[11px] text-zinc-400">
                      Aucune information a afficher pour le moment.
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Cible
                      </p>
                      <p className="mt-1.5 text-[11px] text-zinc-100">
                        {nmapSummary.target ?? "N/A"}
                      </p>
                    </article>

                    <article className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Etat
                      </p>
                      <p className="mt-1.5 text-[11px] text-zinc-100">
                        {nmapSummary.hostState ?? "Inconnu"}
                      </p>
                    </article>

                    <article className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Latence
                      </p>
                      <p className="mt-1.5 text-[11px] text-zinc-100">
                        {nmapSummary.latency ?? "N/A"}
                      </p>
                    </article>

                    <article className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Ports ouverts
                      </p>
                      <p className="mt-1.5 text-[11px] text-zinc-100">
                        {nmapSummary.openPorts.length}
                      </p>
                    </article>
                  </section>

                  <section className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                    <h3 className="text-sm font-medium text-white">Points utiles</h3>
                    <div className="mt-3 grid gap-2">
                      {nmapSummary.interestingFacts.length > 0 ? (
                        nmapSummary.interestingFacts.map((fact) => (
                          <div
                            key={fact}
                            className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-300"
                          >
                            {fact}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-500">
                          Aucune synthese disponible pour le moment.
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
                    <article className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                      <h3 className="text-sm font-medium text-white">Ports et services</h3>
                      <div className="mt-3 space-y-2">
                        {nmapSummary.openPorts.length > 0 ? (
                          nmapSummary.openPorts.map((port) => (
                            <div
                              key={`${port.port}-${port.service}`}
                              className="grid gap-2 rounded-lg bg-zinc-900/80 px-3 py-2 md:grid-cols-[100px_90px_120px_1fr]"
                            >
                              <p className="font-mono text-[11px] text-zinc-100">{port.port}</p>
                              <p className="text-[11px] text-zinc-300">{port.state}</p>
                              <p className="text-[11px] text-zinc-300">{port.service}</p>
                              <p className="text-[11px] text-zinc-500">
                                {port.version || "Version non detectee"}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-500">
                            Aucun port ouvert detecte ou aucune sortie encore disponible.
                          </div>
                        )}
                      </div>
                    </article>

                    <article className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                      <h3 className="text-sm font-medium text-white">Hotes vus</h3>
                      <div className="mt-3 space-y-2">
                        {nmapSummary.hostnames.length > 0 ? (
                          nmapSummary.hostnames.map((host) => (
                            <div
                              key={host}
                              className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-300"
                            >
                              {host}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-500">
                            Aucun hote liste.
                          </div>
                        )}
                      </div>
                    </article>
                  </section>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
