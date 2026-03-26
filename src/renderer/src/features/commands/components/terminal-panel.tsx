import { useEffect, useRef } from "react";

type TerminalPanelProps = {
  liveCommand: string;
  output: string;
};

export function TerminalPanel({ liveCommand, output }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }

    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [output]);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-zinc-400">
        <span>Terminal classique</span>
        <span className="truncate pl-3 text-zinc-500">
          {liveCommand || "Aucune commande en cours"}
        </span>
      </div>
      <pre
        ref={terminalRef}
        className="max-h-[60vh] min-h-[360px] overflow-auto p-4 font-mono text-sm leading-6 text-zinc-200"
      >
        {output}
      </pre>
    </div>
  );
}
