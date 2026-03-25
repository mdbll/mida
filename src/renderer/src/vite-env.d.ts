/// <reference types="vite/client" />
import type { CommandEvent, CommandRequest, CommandResult } from "../../shared/commands";

declare global {
  interface Window {
    mida: {
      platform: string;
      runCommand: (request: CommandRequest) => Promise<CommandResult>;
      onCommandEvent: (callback: (event: CommandEvent) => void) => () => void;
    };
  }
}

export {};
