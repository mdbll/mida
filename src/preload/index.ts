import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("mida", {
  platform: process.platform
});
