import { useMemo, useState } from "react";
import type { ActionId, TabId } from "../../shared/commands";
import { ACTIONS } from "@/features/commands/config";
import { buildPayload, parseIpAddressOutput, parseNmapOutput } from "@/features/commands/parsers";
import { ActionHeader } from "@/features/commands/components/action-header";
import { ActionSidebar } from "@/features/commands/components/action-sidebar";
import { CommandForm } from "@/features/commands/components/command-form";
import { ResultPanel } from "@/features/commands/components/result-panel";
import { ResultTabs } from "@/features/commands/components/result-tabs";
import { useCommandRunner } from "@/features/commands/use-command-runner";

export default function App() {
  const [selectedAction, setSelectedAction] = useState<ActionId>("ipAddress");
  const [activeAction, setActiveAction] = useState<ActionId>("ipAddress");
  const [activeTab, setActiveTab] = useState<TabId>("terminal");
  const [target, setTarget] = useState("192.168.1.1");
  const [selectedPortRange, setSelectedPortRange] = useState<string>("1-1000");
  const [customPortRange, setCustomPortRange] = useState("1-65535");
  const [validationError, setValidationError] = useState("");

  const { clearTerminal, isRunning, liveCommand, result, run, terminalOutput } =
    useCommandRunner();

  const currentAction = ACTIONS.find((action) => action.id === selectedAction)!;

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
    setActiveAction(selectedAction);
    setActiveTab("terminal");

    await run({
      actionId: selectedAction,
      payload: buildPayload(
        currentAction,
        target,
        selectedPortRange,
        customPortRange
      )
    });
  }

  const networkSummary = useMemo(
    () => parseIpAddressOutput(result?.actionId === "ipAddress" ? result.stdout : ""),
    [result]
  );

  const nmapSummary = useMemo(
    () => parseNmapOutput(result && result.actionId !== "ipAddress" ? result.stdout : ""),
    [result]
  );

  return (
    <main className="h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[220px_1fr]">
        <ActionSidebar
          actions={ACTIONS}
          selectedAction={selectedAction}
          onSelect={setSelectedAction}
        />

        <section className="flex h-full min-h-0 flex-col overflow-hidden">
          <ActionHeader
            action={currentAction}
            isRunning={isRunning}
            platform={window.mida?.platform ?? "unknown"}
            onRun={() => void handleRun()}
          />

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4">
              <CommandForm
                action={currentAction}
                customPortRange={customPortRange}
                selectedPortRange={selectedPortRange}
                target={target}
                validationError={validationError}
                onCustomPortRangeChange={setCustomPortRange}
                onSelectedPortRangeChange={setSelectedPortRange}
                onTargetChange={setTarget}
              />

              <ResultTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                onClear={clearTerminal}
              />

              <ResultPanel
                activeAction={activeAction}
                activeTab={activeTab}
                liveCommand={liveCommand}
                networkSummary={networkSummary}
                nmapSummary={nmapSummary}
                terminalOutput={terminalOutput}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
