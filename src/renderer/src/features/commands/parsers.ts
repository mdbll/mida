import type { CommandPayload, CommandResult } from "../../../../shared/commands";
import type { ActionConfig, InterfaceSummary, NmapSummary } from "./types";

export function parseIpAddressOutput(output: string): InterfaceSummary[] {
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

export function parseNmapOutput(output: string): NmapSummary {
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

export function buildPayload(
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

export function getTerminalOutput(result: CommandResult | null): string {
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
}
