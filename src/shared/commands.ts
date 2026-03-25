export type ActionId =
  | "ipAddress"
  | "nmapDiscovery"
  | "nmapQuick"
  | "nmapServices"
  | "nmapPorts";

export type TabId = "terminal" | "summary";

export type CommandPayload = {
  target?: string;
  portRange?: string;
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
