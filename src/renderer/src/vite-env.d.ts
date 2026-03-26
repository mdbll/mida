/// <reference types="vite/client" />
import type {
  CommandEvent,
  CommandRequest,
  CommandResult,
  HashFileEntry,
  WordlistEntry
} from "../../shared/commands";

declare global {
  interface Window {
    mida: {
      platform: string;
      listHashFiles: () => Promise<HashFileEntry[]>;
      listWordlists: () => Promise<WordlistEntry[]>;
      onHashFilesUpdated: (callback: (hashFiles: HashFileEntry[]) => void) => () => void;
      onWordlistsUpdated: (callback: (wordlists: WordlistEntry[]) => void) => () => void;
      runCommand: (request: CommandRequest) => Promise<CommandResult>;
      onCommandEvent: (callback: (event: CommandEvent) => void) => () => void;
    };
  }
}

export {};
