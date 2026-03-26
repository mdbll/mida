import type { HashcatSummary as HashcatSummaryData } from "../types";

type HashcatSummaryProps = {
  summary: HashcatSummaryData;
};

export function HashcatSummary({ summary }: HashcatSummaryProps) {
  return (
    <div className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Fichier hash" value={summary.hashFile ?? "N/A"} />
        <MetricCard title="Mode" value={summary.mode ?? "N/A"} />
        <MetricCard title="Récupérés" value={summary.recovered ?? "N/A"} />
        <MetricCard title="Vitesse" value={summary.speed ?? "N/A"} />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-base font-medium text-white">Points utiles</h3>
        <div className="mt-3 grid gap-2">
          {summary.interestingFacts.length > 0 ? (
            summary.interestingFacts.map((fact) => (
              <div
                key={fact}
                className="rounded-xl bg-zinc-900/80 px-4 py-3 text-sm text-zinc-300"
              >
                {fact}
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-zinc-900/80 px-4 py-3 text-sm text-zinc-500">
              Aucune synthèse disponible pour le moment.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-base font-medium text-white">Résultats visibles</h3>
        <div className="mt-3 space-y-2">
          {summary.cracked.length > 0 ? (
            summary.cracked.map((line) => (
              <div
                key={line}
                className="rounded-xl bg-zinc-900/80 px-4 py-3 font-mono text-sm text-zinc-200"
              >
                {line}
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-zinc-900/80 px-4 py-3 text-sm text-zinc-500">
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
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{title}</p>
      <p className="mt-2 break-all text-sm text-zinc-100">{value}</p>
    </article>
  );
}
