import { spawn } from "node:child_process";
import { join } from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";

type ActionId = "ipAddress" | "nmapDiscovery" | "nmapQuick" | "nmapPorts";

type CommandPayload = {
  target?: string;
  portRange?: string;
};

type CommandRequest = {
  runId: string;
  actionId: ActionId;
  payload: CommandPayload;
};

const STATIC_COMMANDS = {
  ipAddress: {
    command: "ip",
    args: ["a"]
  }
} as const;

function isSafeTarget(value: string): boolean {
  return /^[a-zA-Z0-9./:_-]+$/.test(value);
}

function isSafePortRange(value: string): boolean {
  return /^\d{1,5}(-\d{1,5})?$/.test(value);
}

function resolveCommand(actionId: ActionId, payload: CommandPayload) {
  if (actionId === "ipAddress") {
    return STATIC_COMMANDS.ipAddress;
  }

  const target = payload.target?.trim();

  if (!target) {
    throw new Error("Target is required");
  }

  if (!isSafeTarget(target)) {
    throw new Error("Invalid target");
  }

  switch (actionId) {
    case "nmapDiscovery":
      return {
        command: "nmap",
        args: ["--stats-every", "2s", "-sn", target]
      };
    case "nmapQuick":
      return {
        command: "nmap",
        args: ["--stats-every", "2s", "-T4", "-F", target]
      };
    case "nmapPorts": {
      const portRange = payload.portRange?.trim();

      if (!portRange) {
        throw new Error("Port range is required");
      }

      if (!isSafePortRange(portRange)) {
        throw new Error("Invalid port range");
      }

      return {
        command: "nmap",
        args: ["--stats-every", "2s", "-sV", "-Pn", "-p", portRange, target]
      };
    }
    default:
      throw new Error("Unknown action");
  }
}

function buildCommandLine(command: string, args: readonly string[]): string {
  return [command, ...args].join(" ");
}

ipcMain.handle(
  "command:run",
  async (event, request: CommandRequest) => {
    const { runId, actionId, payload } = request;
    const action = resolveCommand(actionId, payload);
    const commandLine = buildCommandLine(action.command, action.args);

    event.sender.send("command:event", {
      runId,
      type: "start",
      command: commandLine
    });

    return await new Promise<{
      ok: boolean;
      actionId: ActionId;
      command: string;
      stdout: string;
      stderr: string;
    }>((resolve) => {
      const child = spawn(action.command, action.args, {
        stdio: ["ignore", "pipe", "pipe"]
      });

      let stdout = "";
      let stderr = "";
      let settled = false;

      const finish = (result: {
        ok: boolean;
        actionId: ActionId;
        command: string;
        stdout: string;
        stderr: string;
      }) => {
        if (settled) {
          return;
        }

        settled = true;
        event.sender.send("command:event", {
          runId,
          type: "complete",
          result
        });
        resolve(result);
      };

      child.stdout.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        stdout += text;
        event.sender.send("command:event", {
          runId,
          type: "stdout",
          chunk: text
        });
      });

      child.stderr.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        stderr += text;
        event.sender.send("command:event", {
          runId,
          type: "stderr",
          chunk: text
        });
      });

      child.on("error", (error) => {
        const message = error.message || "Command failed";
        stderr += stderr ? `\n${message}` : message;
        event.sender.send("command:event", {
          runId,
          type: "stderr",
          chunk: `${message}\n`
        });

        finish({
          ok: false,
          actionId,
          command: commandLine,
          stdout,
          stderr
        });
      });

      child.on("close", (code) => {
        finish({
          ok: code === 0,
          actionId,
          command: commandLine,
          stdout,
          stderr
        });
      });
    });
  }
);

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#09090b",
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL);
    window.webContents.openDevTools({ mode: "detach" });
    return;
  }

  window.loadFile(join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
