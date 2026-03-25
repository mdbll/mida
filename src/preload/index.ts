import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("mida", {
  platform: process.platform,
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
  }) => ipcRenderer.invoke("command:run", request),
  onCommandEvent: (
    callback: (event: {
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
    }) => void
  ) => {
    const listener = (_event: unknown, payload: unknown) => {
      callback(payload as Parameters<typeof callback>[0]);
    };

    ipcRenderer.on("command:event", listener);

    return () => {
      ipcRenderer.removeListener("command:event", listener);
    };
  }
});
