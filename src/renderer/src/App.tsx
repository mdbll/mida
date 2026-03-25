import { useEffect, useMemo, useState } from "react";
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
    label: "ip a",
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

  useEffect(() => {
    void handleRun("ipAddress");
  }, []);

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

  const terminalOutput = useMemo(() => {
    if (!result) {
      return "Aucune commande lancee.";
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
      <div className="grid min-h-screen grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 bg-zinc-950/90 px-4 py-6">
          <div className="mb-8 px-2">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              Mida
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Kali Commands
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Lance des commandes utiles avec une interface plus lisible.
            </p>
          </div>

          <nav className="space-y-2">
            {ACTIONS.map((action) => {
              const isActive = action.id === selectedAction;

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => setSelectedAction(action.id)}
                  className={[
                    "w-full rounded-2xl border p-4 text-left transition",
                    isActive
                      ? "border-amber-300/30 bg-amber-300/10"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-white">{action.label}</span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400">
                      action
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-8 py-6">
            <div>
              <p className="text-sm text-zinc-500">Action courante</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {ACTIONS.find((action) => action.id === activeAction)?.label}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-400">
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

          <div className="flex flex-1 flex-col px-8 py-6">
            <div className="mb-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("terminal")}
                className={[
                  "rounded-xl px-4 py-2 text-sm transition",
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
                  "rounded-xl px-4 py-2 text-sm transition",
                  activeTab === "summary"
                    ? "bg-white text-zinc-950"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10"
                ].join(" ")}
              >
                Resume
              </button>
            </div>

            {activeTab === "terminal" ? (
              <div className="flex-1 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
                <div className="border-b border-white/10 px-5 py-3 text-sm text-zinc-400">
                  Terminal classique
                </div>
                <pre className="h-full overflow-auto p-5 font-mono text-sm leading-7 text-zinc-200">
                  {terminalOutput}
                </pre>
              </div>
            ) : (
              <div className="grid gap-4">
                {summary.length > 0 ? (
                  summary.map((item) => (
                    <article
                      key={item.name}
                      className="rounded-3xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-medium text-white">{item.name}</h3>
                          <p className="mt-1 text-sm text-zinc-400">
                            Etat: {item.state}
                          </p>
                        </div>
                        <div className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">
                          interface
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-zinc-900/80 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            MAC
                          </p>
                          <p className="mt-2 break-all font-mono text-sm text-zinc-200">
                            {item.mac ?? "N/A"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-zinc-900/80 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            IPv4
                          </p>
                          <div className="mt-2 space-y-2">
                            {item.ipv4.length > 0 ? (
                              item.ipv4.map((value) => (
                                <p key={value} className="font-mono text-sm text-zinc-200">
                                  {value}
                                </p>
                              ))
                            ) : (
                              <p className="font-mono text-sm text-zinc-500">N/A</p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-zinc-900/80 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            IPv6
                          </p>
                          <div className="mt-2 space-y-2">
                            {item.ipv6.length > 0 ? (
                              item.ipv6.map((value) => (
                                <p key={value} className="font-mono text-sm text-zinc-200">
                                  {value}
                                </p>
                              ))
                            ) : (
                              <p className="font-mono text-sm text-zinc-500">N/A</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
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
