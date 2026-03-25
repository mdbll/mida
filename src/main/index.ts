import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { app, BrowserWindow, ipcMain } from "electron";

const execFileAsync = promisify(execFile);

const COMMANDS = {
  ipAddress: {
    label: "IP Address",
    command: "ip",
    args: ["a"]
  }
} as const;

ipcMain.handle("command:run", async (_event, actionId: keyof typeof COMMANDS) => {
  const action = COMMANDS[actionId];

  if (!action) {
    throw new Error("Unknown action");
  }

  try {
    const { stdout, stderr } = await execFileAsync(action.command, action.args, {
      timeout: 15_000,
      maxBuffer: 1024 * 1024
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
});

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
