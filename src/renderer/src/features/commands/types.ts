import type { ActionId } from "../../../../shared/commands";

export type ActionConfig = {
  id: ActionId;
  label: string;
  description: string;
  category: "system" | "scan";
  needsTarget?: boolean;
  needsPortRange?: boolean;
  helper: string;
};

export type InterfaceSummary = {
  name: string;
  state: string;
  mac: string | null;
  ipv4: string[];
  ipv6: string[];
};

export type NmapPort = {
  port: string;
  state: string;
  service: string;
  version: string;
};

export type NmapSummary = {
  target: string | null;
  hostState: string | null;
  latency: string | null;
  openPorts: NmapPort[];
  hostnames: string[];
  interestingFacts: string[];
};
