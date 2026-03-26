/// <reference types="vite/client" />
import type { CommandEvent, CommandRequest, CommandResult } from "../../shared/commands";
import type { WordlistEntry } from "../../shared/commands";

declare global {
  interface Window {
    mida: {
      platform: string;
      listWordlists: () => Promise<WordlistEntry[]>;
      onWordlistsUpdated: (callback: (wordlists: WordlistEntry[]) => void) => () => void;
      runCommand: (request: CommandRequest) => Promise<CommandResult>;
      onCommandEvent: (callback: (event: CommandEvent) => void) => () => void;
    };
  }
}

export {};
