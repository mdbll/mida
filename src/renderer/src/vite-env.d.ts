/// <reference types="vite/client" />

interface Window {
  mida: {
    platform: string;
    runCommand: (request: {
      actionId: "ipAddress" | "nmapDiscovery" | "nmapQuick" | "nmapPorts";
      payload?: {
        target?: string;
        portRange?: string;
      };
    }) => Promise<{
      ok: boolean;
      actionId: "ipAddress" | "nmapDiscovery" | "nmapQuick" | "nmapPorts";
      command: string;
      stdout: string;
      stderr: string;
    }>;
  };
}
