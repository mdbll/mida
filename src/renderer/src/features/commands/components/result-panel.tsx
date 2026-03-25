import type { ActionId, TabId } from "../../../../../shared/commands";
import type { InterfaceSummary, NmapSummary as NmapSummaryData } from "../types";
import { NetworkSummary } from "./network-summary";
import { NmapSummary } from "./nmap-summary";
import { TerminalPanel } from "./terminal-panel";

type ResultPanelProps = {
  activeAction: ActionId;
  activeTab: TabId;
  liveCommand: string;
  networkSummary: InterfaceSummary[];
  nmapSummary: NmapSummaryData;
  terminalOutput: string;
};

export function ResultPanel({
  activeAction,
  activeTab,
  liveCommand,
  networkSummary,
  nmapSummary,
  terminalOutput
}: ResultPanelProps) {
  if (activeTab === "terminal") {
    return <TerminalPanel liveCommand={liveCommand} output={terminalOutput} />;
  }

  if (activeAction === "ipAddress") {
    return <NetworkSummary items={networkSummary} />;
  }

  return <NmapSummary summary={nmapSummary} />;
}
