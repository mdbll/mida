import type { CommandPayload, CommandResult } from "../../../../shared/commands";
import type {
  ActionConfig,
  HashcatSummary,
  HydraSummary,
  InterfaceSummary,
  NmapSummary
} from "./types";

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
    interestingFacts.push(`${hostsUpMatch[1]} hôte(s) actif(s) détecté(s).`);
  }

  if (openPorts.length > 0) {
    interestingFacts.push(`${openPorts.length} port(s) ouvert(s) détecté(s).`);
  }

  if (output.includes("Not shown:")) {
    interestingFacts.push("Des ports supplémentaires ont été filtrés ou fermés.");
  }

  if (output.includes("Service Info:")) {
    interestingFacts.push("Des informations de service supplémentaires ont été détectées.");
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
  hashFile: string,
  host: string,
  mode: string,
  target: string,
  selectedPortRange: string,
  customPortRange: string,
  username: string,
  wordlist: string
): CommandPayload {
  if (action.id === "ipAddress") {
    return {};
  }

  const payload: CommandPayload = {
    target: target.trim()
  };

  if (action.needsHashFile) {
    payload.hashFile = hashFile.trim();
  }

  if (action.needsHost) {
    payload.host = host.trim();
  }

  if (action.needsMode) {
    payload.mode = mode.trim();
  }

  if (action.needsUsername) {
    payload.username = username.trim();
  }

  if (action.needsPortRange) {
    payload.portRange =
      selectedPortRange === "custom" ? customPortRange.trim() : selectedPortRange;
  }

  if (action.needsWordlist) {
    payload.wordlist = wordlist.trim();
  }

  return payload;
}

export function parseHashcatOutput(output: string): HashcatSummary {
  const mode = output.match(/Hash\.Mode\.*:\s*(.+)/)?.[1]?.trim() ?? null;
  const hashFile = output.match(/Input\.File\.*:\s*(.+)/)?.[1]?.trim() ?? null;
  const recovered = output.match(/Recovered\.*:\s*(.+)/)?.[1]?.trim() ?? null;
  const progress = output.match(/Progress\.*:\s*(.+)/)?.[1]?.trim() ?? null;
  const speed = output.match(/Speed\.\#\d+\.*:\s*(.+)/)?.[1]?.trim() ?? null;
  const cracked = output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.includes(":") && !line.startsWith("Hash.") && !line.startsWith("Speed."));

  const interestingFacts: string[] = [];

  if (recovered) {
    interestingFacts.push(`Récupération: ${recovered}`);
  }

  if (progress) {
    interestingFacts.push(`Progression: ${progress}`);
  }

  if (speed) {
    interestingFacts.push(`Vitesse: ${speed}`);
  }

  if (cracked.length > 0) {
    interestingFacts.push(`${cracked.length} ligne(s) potentiellement craquée(s).`);
  }

  return {
    hashFile,
    mode,
    recovered,
    progress,
    speed,
    cracked,
    interestingFacts
  };
}

export function parseHydraOutput(output: string): HydraSummary {
  const credentials = [
    ...output.matchAll(
      /\[(\d+)\]\[(.+?)\]\s+host:\s+(.+?)\s+login:\s+(.+?)\s+password:\s+(.+)/g
    )
  ].map((match) => ({
    service: match[2].trim(),
    host: match[3].trim(),
    login: match[4].trim(),
    password: match[5].trim()
  }));

  const service = credentials[0]?.service ?? output.match(/\[\d+\]\[(.+?)\]/)?.[1] ?? null;
  const target = credentials[0]?.host ?? output.match(/host:\s+([^\s]+)/)?.[1] ?? null;
  const attemptsInfo = output.match(/\[STATUS\]\s+(.+)/)?.[1]?.trim() ?? null;
  const interestingFacts: string[] = [];

  if (credentials.length > 0) {
    interestingFacts.push(`${credentials.length} identifiant(s) valide(s) trouvé(s).`);
  }

  if (attemptsInfo) {
    interestingFacts.push(attemptsInfo);
  }

  if (output.includes("[ERROR]")) {
    interestingFacts.push("Hydra a retourné au moins une erreur.");
  }

  return {
    target,
    service,
    attemptsInfo,
    credentials,
    interestingFacts
  };
}

export function getTerminalOutput(result: CommandResult | null): string {
  if (!result) {
    return "Aucune commande exécutée.";
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
