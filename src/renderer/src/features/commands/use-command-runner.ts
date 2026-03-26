import { useEffect, useRef, useState } from "react";
import type {
  CommandEvent,
  HashFileEntry,
  CommandRequest,
  CommandResult,
  WordlistEntry
} from "../../../../shared/commands";

export function useCommandRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);
  const [terminalOutput, setTerminalOutput] = useState("Aucune commande exécutée.");
  const [liveCommand, setLiveCommand] = useState("");
  const activeRunIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!window.mida?.onCommandEvent) {
      return;
    }

    return window.mida.onCommandEvent((event: CommandEvent) => {
      if (event.runId !== activeRunIdRef.current) {
        return;
      }

      if (event.type === "start") {
        const command = event.command ?? "";
        setLiveCommand(command);
        setTerminalOutput(command ? `$ ${command}\n\n` : "");
        return;
      }

      if (event.type === "stdout" || event.type === "stderr") {
        setTerminalOutput((current) => `${current}${event.chunk ?? ""}`);
        return;
      }

      if (event.type === "complete" && event.result) {
        setResult(event.result);
        setIsRunning(false);
      }
    });
  }, []);

  async function run(request: Omit<CommandRequest, "runId">) {
    const runId = crypto.randomUUID();
    activeRunIdRef.current = runId;
    setIsRunning(true);
    setResult(null);
    setLiveCommand("");
    setTerminalOutput("");

    try {
      if (!window.mida?.runCommand) {
        const fallback: CommandResult = {
          ok: false,
          actionId: request.actionId,
          command: "preload unavailable",
          stdout: "",
          stderr: "L'API preload Electron n'est pas disponible."
        };

        setResult(fallback);
        setTerminalOutput(`$ ${fallback.command}\n\n${fallback.stderr}`);
        setIsRunning(false);
        return fallback;
      }

      return await window.mida.runCommand({
        ...request,
        runId
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inattendue pendant l'exécution.";
      const fallback: CommandResult = {
        ok: false,
        actionId: request.actionId,
        command: "command failed",
        stdout: "",
        stderr: message
      };

      setResult(fallback);
      setTerminalOutput((current) => `${current}${current ? "\n" : ""}${message}`);
      setIsRunning(false);
      return fallback;
    }
  }

  function clearTerminal() {
    setTerminalOutput("Terminal vide.");
    setLiveCommand("");
  }

  return {
    clearTerminal,
    isRunning,
    liveCommand,
    result,
    run,
    terminalOutput
  };
}

export function useWordlists() {
  const [wordlists, setWordlists] = useState<WordlistEntry[]>([]);

  useEffect(() => {
    let active = true;

    async function loadWordlists() {
      if (!window.mida?.listWordlists) {
        return;
      }

      const nextWordlists = await window.mida.listWordlists();

      if (active) {
        setWordlists(nextWordlists);
      }
    }

    void loadWordlists();

    const unsubscribe = window.mida?.onWordlistsUpdated?.((nextWordlists) => {
      if (active) {
        setWordlists(nextWordlists);
      }
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return { wordlists };
}

export function useHashFiles() {
  const [hashFiles, setHashFiles] = useState<HashFileEntry[]>([]);

  useEffect(() => {
    let active = true;

    async function loadHashFiles() {
      if (!window.mida?.listHashFiles) {
        return;
      }

      const nextHashFiles = await window.mida.listHashFiles();

      if (active) {
        setHashFiles(nextHashFiles);
      }
    }

    void loadHashFiles();

    const unsubscribe = window.mida?.onHashFilesUpdated?.((nextHashFiles) => {
      if (active) {
        setHashFiles(nextHashFiles);
      }
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return { hashFiles };
}
