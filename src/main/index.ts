import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { app, BrowserWindow, ipcMain } from "electron";

const execFileAsync = promisify(execFile);

type ActionId = "ipAddress" | "nmapDiscovery" | "nmapQuick" | "nmapPorts";

type CommandPayload = {
  target?: string;
  portRange?: string;
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
        args: ["-sn", target]
      };
    case "nmapQuick":
      return {
        command: "nmap",
        args: ["-T4", "-F", target]
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
        args: ["-sV", "-Pn", "-p", portRange, target]
      };
    }
    default:
      throw new Error("Unknown action");
  }
}

ipcMain.handle(
  "command:run",
  async (_event, request: { actionId: ActionId; payload: CommandPayload }) => {
    const { actionId, payload } = request;
    const action = resolveCommand(actionId, payload);

    try {
      const { stdout, stderr } = await execFileAsync(action.command, action.args, {
        timeout: 60_000,
        maxBuffer: 2 * 1024 * 1024
      });

      return {
        ok: true,
        actionId,
        command: `${action.command} ${action.args.join(" ")}`,
        stdout,
        stderr
      };
    } catch (error) {
      const details = error as NodeJS.ErrnoException & {
        stdout?: string;
        stderr?: string;
      };

      return {
        ok: false,
        actionId,
        command: `${action.command} ${action.args.join(" ")}`,
        stdout: details.stdout ?? "",
        stderr: details.stderr || details.message || "Command failed"
      };
    }
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
