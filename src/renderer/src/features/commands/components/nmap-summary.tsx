import type { NmapSummary as NmapSummaryData } from "../types";

type NmapSummaryProps = {
  summary: NmapSummaryData;
};

export function NmapSummary({ summary }: NmapSummaryProps) {
  return (
    <div className="grid gap-3">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Cible" value={summary.target ?? "N/A"} />
        <MetricCard title="État" value={summary.hostState ?? "Inconnu"} />
        <MetricCard title="Latence" value={summary.latency ?? "N/A"} />
        <MetricCard title="Ports ouverts" value={String(summary.openPorts.length)} />
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-3.5">
        <h3 className="text-sm font-medium text-white">Points utiles</h3>
        <div className="mt-3 grid gap-2">
          {summary.interestingFacts.length > 0 ? (
            summary.interestingFacts.map((fact) => (
              <div
                key={fact}
                className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-300"
              >
                {fact}
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-500">
              Aucune synthèse disponible pour le moment.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-xl border border-white/10 bg-white/5 p-3.5">
          <h3 className="text-sm font-medium text-white">Ports et services</h3>
          <div className="mt-3 space-y-2">
            {summary.openPorts.length > 0 ? (
              summary.openPorts.map((port) => (
                <div
                  key={`${port.port}-${port.service}`}
                  className="grid gap-2 rounded-lg bg-zinc-900/80 px-3 py-2 md:grid-cols-[100px_90px_120px_1fr]"
                >
                  <p className="font-mono text-[11px] text-zinc-100">{port.port}</p>
                  <p className="text-[11px] text-zinc-300">{port.state}</p>
                  <p className="text-[11px] text-zinc-300">{port.service}</p>
                  <p className="text-[11px] text-zinc-500">
                    {port.version || "Version non détectée"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-500">
                Aucun port ouvert détecté ou aucune sortie encore disponible.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/5 p-3.5">
          <h3 className="text-sm font-medium text-white">Hôtes vus</h3>
          <div className="mt-3 space-y-2">
            {summary.hostnames.length > 0 ? (
              summary.hostnames.map((host) => (
                <div
                  key={host}
                  className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-300"
                >
                  {host}
                </div>
              ))
            ) : (
              <div className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-500">
                Aucun hôte listé.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{title}</p>
      <p className="mt-1.5 text-[11px] text-zinc-100">{value}</p>
    </article>
  );
}
