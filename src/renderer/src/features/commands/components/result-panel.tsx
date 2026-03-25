import type { ActionId, TabId } from "../../../../../shared/commands";
import type {
  HydraSummary as HydraSummaryData,
  InterfaceSummary,
  NmapSummary as NmapSummaryData
} from "../types";
import { HydraSummary } from "./hydra-summary";
import { NetworkSummary } from "./network-summary";
import { NmapSummary } from "./nmap-summary";
import { TerminalPanel } from "./terminal-panel";

type ResultPanelProps = {
  activeAction: ActionId;
  activeTab: TabId;
  hydraSummary: HydraSummaryData;
  liveCommand: string;
  networkSummary: InterfaceSummary[];
  nmapSummary: NmapSummaryData;
  terminalOutput: string;
};

export function ResultPanel({
  activeAction,
  activeTab,
  hydraSummary,
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

  if (activeAction === "hydra") {
    return <HydraSummary summary={hydraSummary} />;
  }

  return <NmapSummary summary={nmapSummary} />;
}
