import type { HashcatSummary as HashcatSummaryData } from "../types";

type HashcatSummaryProps = {
  summary: HashcatSummaryData;
};

export function HashcatSummary({ summary }: HashcatSummaryProps) {
  return (
    <div className="grid gap-3">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Fichier hash" value={summary.hashFile ?? "N/A"} />
        <MetricCard title="Mode" value={summary.mode ?? "N/A"} />
        <MetricCard title="Récupérés" value={summary.recovered ?? "N/A"} />
        <MetricCard title="Vitesse" value={summary.speed ?? "N/A"} />
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

      <section className="rounded-xl border border-white/10 bg-white/5 p-3.5">
        <h3 className="text-sm font-medium text-white">Résultats visibles</h3>
        <div className="mt-3 space-y-2">
          {summary.cracked.length > 0 ? (
            summary.cracked.map((line) => (
              <div
                key={line}
                className="rounded-lg bg-zinc-900/80 px-3 py-2 font-mono text-[11px] text-zinc-200"
              >
                {line}
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-500">
              Aucun résultat craqué visible pour le moment.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{title}</p>
      <p className="mt-1.5 break-all text-[11px] text-zinc-100">{value}</p>
    </article>
  );
}
