import type { HydraSummary as HydraSummaryData } from "../types";

type HydraSummaryProps = {
  summary: HydraSummaryData;
};

export function HydraSummary({ summary }: HydraSummaryProps) {
  return (
    <div className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Service" value={summary.service ?? "N/A"} />
        <MetricCard title="Cible" value={summary.target ?? "N/A"} />
        <MetricCard title="Identifiants" value={String(summary.credentials.length)} />
        <MetricCard title="Statut" value={summary.attemptsInfo ?? "N/A"} />
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
        <h3 className="text-base font-medium text-white">Identifiants trouvés</h3>
        <div className="mt-3 space-y-2">
          {summary.credentials.length > 0 ? (
            summary.credentials.map((credential) => (
              <div
                key={`${credential.host}-${credential.login}-${credential.password}`}
                className="grid gap-2 rounded-xl bg-zinc-900/80 px-4 py-3 md:grid-cols-[140px_160px_1fr]"
              >
                <p className="text-sm text-zinc-300">{credential.login}</p>
                <p className="font-mono text-sm text-zinc-100">
                  {credential.password}
                </p>
                <p className="text-sm text-zinc-500">
                  {credential.service} sur {credential.host}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-zinc-900/80 px-4 py-3 text-sm text-zinc-500">
              Aucun identifiant trouvé.
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
      <p className="mt-2 text-sm text-zinc-100">{value}</p>
    </article>
  );
}
