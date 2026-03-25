/// <reference types="vite/client" />

interface Window {
  mida: {
    platform: string;
    runCommand: (request: {
      runId: string;
      actionId:
        | "ipAddress"
        | "nmapDiscovery"
        | "nmapQuick"
        | "nmapServices"
        | "nmapPorts";
      payload?: {
        target?: string;
        portRange?: string;
      };
    }) => Promise<{
      ok: boolean;
      actionId:
        | "ipAddress"
        | "nmapDiscovery"
        | "nmapQuick"
        | "nmapServices"
        | "nmapPorts";
      command: string;
      stdout: string;
      stderr: string;
    }>;
    onCommandEvent: (callback: (event: {
      runId: string;
      type: "start" | "stdout" | "stderr" | "complete";
      command?: string;
      chunk?: string;
      result?: {
        ok: boolean;
        actionId:
          | "ipAddress"
          | "nmapDiscovery"
          | "nmapQuick"
          | "nmapServices"
          | "nmapPorts";
        command: string;
        stdout: string;
        stderr: string;
      };
    }) => void) => () => void;
  };
}
