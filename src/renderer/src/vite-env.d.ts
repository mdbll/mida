/// <reference types="vite/client" />

interface Window {
  mida: {
    platform: string;
    runCommand: (actionId: "ipAddress") => Promise<{
      ok: boolean;
      actionId: "ipAddress";
      command: string;
      stdout: string;
      stderr: string;
    }>;
  };
}
