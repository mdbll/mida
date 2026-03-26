import type { ActionId, TabId } from "../../../../../shared/commands";
import type {
  HashcatSummary as HashcatSummaryData,
  HydraSummary as HydraSummaryData,
  InterfaceSummary,
  NmapSummary as NmapSummaryData
} from "../types";
import { HashcatSummary } from "./hashcat-summary";
import { HydraSummary } from "./hydra-summary";
import { NetworkSummary } from "./network-summary";
import { NmapSummary } from "./nmap-summary";
import { TerminalPanel } from "./terminal-panel";

type ResultPanelProps = {
  activeAction: ActionId;
  activeTab: TabId;
  hashcatSummary: HashcatSummaryData;
  hydraSummary: HydraSummaryData;
  liveCommand: string;
  networkSummary: InterfaceSummary[];
  nmapSummary: NmapSummaryData;
  terminalOutput: string;
};

export function ResultPanel({
  activeAction,
  activeTab,
  hashcatSummary,
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

  if (activeAction === "hashcat") {
    return <HashcatSummary summary={hashcatSummary} />;
  }

  return <NmapSummary summary={nmapSummary} />;
}
