import { contextBridge, ipcRenderer } from "electron";
import type {
  CommandEvent,
  CommandRequest,
  WordlistEntry
} from "../shared/commands";

contextBridge.exposeInMainWorld("mida", {
  platform: process.platform,
  listWordlists: (): Promise<WordlistEntry[]> => ipcRenderer.invoke("wordlists:list"),
  onWordlistsUpdated: (callback: (wordlists: WordlistEntry[]) => void) => {
    const listener = (_event: unknown, payload: unknown) => {
      callback(payload as WordlistEntry[]);
    };

    ipcRenderer.on("wordlists:updated", listener);

    return () => {
      ipcRenderer.removeListener("wordlists:updated", listener);
    };
  },
  runCommand: (request: CommandRequest) => ipcRenderer.invoke("command:run", request),
  onCommandEvent: (callback: (event: CommandEvent) => void) => {
    const listener = (_event: unknown, payload: unknown) => {
      callback(payload as CommandEvent);
    };

    ipcRenderer.on("command:event", listener);

    return () => {
      ipcRenderer.removeListener("command:event", listener);
    };
  }
});
