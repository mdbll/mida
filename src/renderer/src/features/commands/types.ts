import type { ActionId } from "../../../../shared/commands";

export type ActionConfig = {
  id: ActionId;
  label: string;
  description: string;
  category: "system" | "scan" | "bruteforce";
  needsHashFile?: boolean;
  needsHost?: boolean;
  needsMode?: boolean;
  needsTarget?: boolean;
  needsPortRange?: boolean;
  needsUsername?: boolean;
  needsWordlist?: boolean;
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

export type HydraSummary = {
  target: string | null;
  service: string | null;
  attemptsInfo: string | null;
  credentials: Array<{
    host: string;
    login: string;
    password: string;
    service: string;
  }>;
  interestingFacts: string[];
};

export type HashcatSummary = {
  hashFile: string | null;
  mode: string | null;
  recovered: string | null;
  progress: string | null;
  speed: string | null;
  cracked: string[];
  interestingFacts: string[];
};
