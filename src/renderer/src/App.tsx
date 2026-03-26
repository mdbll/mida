import { useMemo, useState } from "react";
import type { ActionId, TabId } from "../../shared/commands";
import { ACTIONS } from "@/features/commands/config";
import {
  buildPayload,
  parseHashcatOutput,
  parseHydraOutput,
  parseIpAddressOutput,
  parseNmapOutput
} from "@/features/commands/parsers";
import { ActionHeader } from "@/features/commands/components/action-header";
import { ActionSidebar } from "@/features/commands/components/action-sidebar";
import { CommandForm } from "@/features/commands/components/command-form";
import { ResultPanel } from "@/features/commands/components/result-panel";
import { ResultTabs } from "@/features/commands/components/result-tabs";
import {
  useCommandRunner,
  useHashFiles,
  useWordlists
} from "@/features/commands/use-command-runner";

export default function App() {
  const [selectedAction, setSelectedAction] = useState<ActionId>("ipAddress");
  const [activeAction, setActiveAction] = useState<ActionId>("ipAddress");
  const [activeTab, setActiveTab] = useState<TabId>("terminal");
  const [hashFile, setHashFile] = useState("hashes/hashes.txt");
  const [host, setHost] = useState("ssh");
  const [mode, setMode] = useState("0");
  const [target, setTarget] = useState("192.168.1.1");
  const [selectedPortRange, setSelectedPortRange] = useState<string>("1-1000");
  const [customPortRange, setCustomPortRange] = useState("1-65535");
  const [username, setUsername] = useState("admin");
  const [wordlist, setWordlist] = useState("wordlists/passwords.txt");
  const [validationError, setValidationError] = useState("");

  const { clearTerminal, isRunning, liveCommand, result, run, terminalOutput } =
    useCommandRunner();
  const { hashFiles } = useHashFiles();
  const { wordlists } = useWordlists();

  const currentAction = ACTIONS.find((action) => action.id === selectedAction)!;

  async function handleRun() {
    if (currentAction.needsTarget && !target.trim()) {
      setValidationError("Une cible IP, CIDR ou hostname est requise.");
      return;
    }

    if (currentAction.needsHashFile && !hashFile.trim()) {
      setValidationError("Un fichier hash est requis.");
      return;
    }

    if (currentAction.needsHost && !host.trim()) {
      setValidationError("Un host/service est requis.");
      return;
    }

    if (currentAction.needsMode && !mode.trim()) {
      setValidationError("Un mode hashcat est requis.");
      return;
    }

    if (currentAction.needsUsername && !username.trim()) {
      setValidationError("Un utilisateur est requis.");
      return;
    }

    if (
      currentAction.needsPortRange &&
      selectedPortRange === "custom" &&
      !customPortRange.trim()
    ) {
      setValidationError("Une plage de ports personnalisée est requise.");
      return;
    }

    if (currentAction.needsWordlist && !wordlist.trim()) {
      setValidationError("Une wordlist est requise.");
      return;
    }

    setValidationError("");
    setActiveAction(selectedAction);
    setActiveTab("terminal");

    await run({
      actionId: selectedAction,
      payload: buildPayload(
        currentAction,
        hashFile,
        host,
        mode,
        target,
        selectedPortRange,
        customPortRange,
        username,
        wordlist
      )
    });
  }

  const networkSummary = useMemo(
    () => parseIpAddressOutput(result?.actionId === "ipAddress" ? result.stdout : ""),
    [result]
  );

  const nmapSummary = useMemo(
    () =>
      parseNmapOutput(
        result &&
          result.actionId !== "ipAddress" &&
          result.actionId !== "hydra" &&
          result.actionId !== "hashcat"
          ? result.stdout
          : ""
      ),
    [result]
  );

  const hydraSummary = useMemo(
    () => parseHydraOutput(result?.actionId === "hydra" ? result.stdout : ""),
    [result]
  );

  const hashcatSummary = useMemo(
    () => parseHashcatOutput(result?.actionId === "hashcat" ? result.stdout : ""),
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
                hashFile={hashFile}
                hashFiles={hashFiles}
                host={host}
                mode={mode}
                selectedPortRange={selectedPortRange}
                target={target}
                username={username}
                validationError={validationError}
                wordlist={wordlist}
                wordlists={wordlists}
                onCustomPortRangeChange={setCustomPortRange}
                onHashFileChange={setHashFile}
                onHostChange={setHost}
                onModeChange={setMode}
                onSelectedPortRangeChange={setSelectedPortRange}
                onTargetChange={setTarget}
                onUsernameChange={setUsername}
                onWordlistChange={setWordlist}
              />

              <ResultTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                onClear={clearTerminal}
              />

              <ResultPanel
                activeAction={activeAction}
                activeTab={activeTab}
                hashcatSummary={hashcatSummary}
                hydraSummary={hydraSummary}
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
