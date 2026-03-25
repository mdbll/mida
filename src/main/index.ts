import { spawn } from "node:child_process";
import { join } from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";
import type { CommandRequest, CommandResult } from "../shared/commands";
import { buildCommandLine, resolveCommand } from "./commands";

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

    return await new Promise<CommandResult>((resolve) => {
      const child = spawn(action.command, action.args, {
        stdio: ["ignore", "pipe", "pipe"]
      });

      let stdout = "";
      let stderr = "";
      let settled = false;

      const finish = (result: CommandResult) => {
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
