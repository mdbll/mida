import type { ActionId, CommandPayload } from "../shared/commands";

type ResolvedCommand = {
  command: string;
  args: readonly string[];
};

const STATIC_COMMANDS = {
  ipAddress: {
    command: "ip",
    args: ["a"]
  }
} as const;

function isSafeTarget(value: string): boolean {
  return /^[a-zA-Z0-9./:_-]+$/.test(value);
}

function isSafePortRange(value: string): boolean {
  return /^\d{1,5}(-\d{1,5})?$/.test(value);
}

function isSafeHydraHost(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*$/.test(value);
}

function isSafeUsername(value: string): boolean {
  return /^[a-zA-Z0-9._@-]+$/.test(value);
}

function isSafeWordlist(value: string): boolean {
  return /^[a-zA-Z0-9._/-]+$/.test(value);
}

export function resolveCommand(
  actionId: ActionId,
  payload: CommandPayload
): ResolvedCommand {
  if (actionId === "ipAddress") {
    return STATIC_COMMANDS.ipAddress;
  }

  const target = payload.target?.trim();

  if (!target) {
    throw new Error("Target is required");
  }

  if (!isSafeTarget(target)) {
    throw new Error("Invalid target");
  }

  switch (actionId) {
    case "nmapDiscovery":
      return {
        command: "nmap",
        args: ["--stats-every", "2s", "-sn", target]
      };
    case "nmapQuick":
      return {
        command: "nmap",
        args: ["--stats-every", "2s", "-T4", "-F", target]
      };
    case "nmapServices":
      return {
        command: "nmap",
        args: ["--stats-every", "2s", "-sV", "-Pn", target]
      };
    case "hydra": {
      const host = payload.host?.trim();
      const username = payload.username?.trim();
      const wordlist = payload.wordlist?.trim();

      if (!host) {
        throw new Error("Host is required");
      }

      if (!isSafeHydraHost(host)) {
        throw new Error("Invalid host");
      }

      if (!username) {
        throw new Error("Username is required");
      }

      if (!isSafeUsername(username)) {
        throw new Error("Invalid username");
      }

      if (!wordlist) {
        throw new Error("Wordlist is required");
      }

      if (!isSafeWordlist(wordlist)) {
        throw new Error("Invalid wordlist");
      }

      return {
        command: "hydra",
        args: ["-l", username, "-P", wordlist, `${host}://${target}`]
      };
    }
    case "nmapPorts": {
      const portRange = payload.portRange?.trim();

      if (!portRange) {
        throw new Error("Port range is required");
      }

      if (!isSafePortRange(portRange)) {
        throw new Error("Invalid port range");
      }

      return {
        command: "nmap",
        args: ["--stats-every", "2s", "-sV", "-Pn", "-p", portRange, target]
      };
    }
    default:
      throw new Error("Unknown action");
  }
}

export function buildCommandLine(command: string, args: readonly string[]): string {
  return [command, ...args].join(" ");
}
