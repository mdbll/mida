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
