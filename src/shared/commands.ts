export type ActionId =
  | "ipAddress"
  | "nmapDiscovery"
  | "nmapQuick"
  | "nmapServices"
  | "hydra"
  | "hashcat"
  | "nmapPorts";

export type TabId = "terminal" | "summary";

export type CommandPayload = {
  hashFile?: string;
  host?: string;
  mode?: string;
  target?: string;
  portRange?: string;
  username?: string;
  wordlist?: string;
};

export type CommandRequest = {
  runId: string;
  actionId: ActionId;
  payload: CommandPayload;
};

export type CommandResult = {
  ok: boolean;
  actionId: ActionId;
  command: string;
  stdout: string;
  stderr: string;
};

export type CommandEvent = {
  runId: string;
  type: "start" | "stdout" | "stderr" | "complete";
  command?: string;
  chunk?: string;
  result?: CommandResult;
};

export type WordlistEntry = {
  label: string;
  value: string;
};

export type HashFileEntry = {
  label: string;
  value: string;
};
