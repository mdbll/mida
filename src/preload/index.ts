import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("mida", {
  platform: process.platform,
  runCommand: (request: {
    actionId: "ipAddress" | "nmapDiscovery" | "nmapQuick" | "nmapPorts";
    payload?: {
      target?: string;
      portRange?: string;
    };
  }) => ipcRenderer.invoke("command:run", request)
});
