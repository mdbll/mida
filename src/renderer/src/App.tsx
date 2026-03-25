import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type ActionId = "ipAddress";
type TabId = "terminal" | "summary";

type CommandResult = {
  ok: boolean;
  actionId: ActionId;
  command: string;
  stdout: string;
  stderr: string;
};

type InterfaceSummary = {
  name: string;
  state: string;
  mac: string | null;
  ipv4: string[];
  ipv6: string[];
};

const ACTIONS: Array<{ id: ActionId; label: string; description: string }> = [
  {
    id: "ipAddress",
    label: "Reseau",
    description: "Inspecter les interfaces et les adresses IP"
  }
];

function parseIpAddressOutput(output: string): InterfaceSummary[] {
  const sections = output
    .split(/\n(?=\d+:\s)/)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.map((section) => {
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

export default function App() {
  const [selectedAction, setSelectedAction] = useState<ActionId>("ipAddress");
  const [activeAction, setActiveAction] = useState<ActionId>("ipAddress");
  const [activeTab, setActiveTab] = useState<TabId>("terminal");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);

  async function handleRun(actionId: ActionId) {
    setIsRunning(true);
    setActiveAction(actionId);

    try {
      if (!window.mida?.runCommand) {
        setResult({
          ok: false,
          actionId,
          command: "preload unavailable",
          stdout: "",
          stderr: "L'API preload Electron n'est pas disponible."
        });
        return;
      }

      const nextResult = await window.mida.runCommand(actionId);
      setResult(nextResult);
    } finally {
      setIsRunning(false);
    }
  }

  const summary = useMemo(
    () => parseIpAddressOutput(result?.stdout ?? ""),
    [result?.stdout]
  );
  const currentAction = ACTIONS.find((action) => action.id === selectedAction);

  const terminalOutput = useMemo(() => {
    if (!result) {
      return "Aucune commande executee.";
    }

    const blocks = [`$ ${result.command}`];

    if (result.stdout.trim()) {
      blocks.push(result.stdout.trim());
    }

    if (result.stderr.trim()) {
      blocks.push(result.stderr.trim());
    }

    return blocks.join("\n\n");
  }, [result]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-white/10 bg-zinc-950/90 px-3 py-5 lg:border-b-0 lg:border-r">
          <div className="mb-6 px-2">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              Mida
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">
              Kali Commands
            </h1>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Lance des commandes utiles avec une interface plus lisible.
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
                    "w-full rounded-xl border p-3 text-left transition",
                    isActive
                      ? "border-amber-300/30 bg-amber-300/10"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  ].join(" ")}
                >
                  <span className="text-xs font-medium text-white">{action.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="flex min-h-screen flex-col">
          <header className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs text-zinc-500">Action courante</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                {currentAction?.label}
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-400">
                {currentAction?.description}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                {window.mida?.platform ?? "unknown"}
              </div>
              <Button
                onClick={() => void handleRun(selectedAction)}
                disabled={isRunning}
              >
                {isRunning ? "Execution..." : "Executer"}
              </Button>
            </div>
          </header>

          <div className="flex flex-1 flex-col px-4 py-5 sm:px-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("terminal")}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs transition",
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
                  "rounded-lg px-3 py-1.5 text-xs transition",
                  activeTab === "summary"
                    ? "bg-white text-zinc-950"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10"
                ].join(" ")}
              >
                Resume
              </button>
            </div>

            {activeTab === "terminal" ? (
              <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                <div className="border-b border-white/10 px-4 py-2.5 text-xs text-zinc-400">
                  Terminal classique
                </div>
                <pre className="h-full overflow-auto p-4 font-mono text-xs leading-6 text-zinc-200">
                  {terminalOutput}
                </pre>
              </div>
            ) : (
              <div className="grid gap-4">
                {summary.length > 0 ? (
                  summary.map((item) => (
                    <article
                      key={item.name}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-base font-medium text-white">{item.name}</h3>
                          <p className="mt-1 text-xs text-zinc-400">
                            Etat: {item.state}
                          </p>
                        </div>
                        <div className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">
                          interface
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-xl bg-zinc-900/80 p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            MAC
                          </p>
                          <p className="mt-2 break-all font-mono text-xs text-zinc-200">
                            {item.mac ?? "N/A"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-zinc-900/80 p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            IPv4
                          </p>
                          <div className="mt-2 space-y-2">
                            {item.ipv4.length > 0 ? (
                              item.ipv4.map((value) => (
                                <p key={value} className="font-mono text-xs text-zinc-200">
                                  {value}
                                </p>
                              ))
                            ) : (
                              <p className="font-mono text-xs text-zinc-500">N/A</p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl bg-zinc-900/80 p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            IPv6
                          </p>
                          <div className="mt-2 space-y-2">
                            {item.ipv6.length > 0 ? (
                              item.ipv6.map((value) => (
                                <p key={value} className="font-mono text-xs text-zinc-200">
                                  {value}
                                </p>
                              ))
                            ) : (
                              <p className="font-mono text-xs text-zinc-500">N/A</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-zinc-400">
                    Aucune information a afficher pour le moment.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
