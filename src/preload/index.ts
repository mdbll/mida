import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("mida", {
  platform: process.platform,
  runCommand: (actionId: "ipAddress") => ipcRenderer.invoke("command:run", actionId)
});
