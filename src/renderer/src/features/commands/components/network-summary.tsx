import type { InterfaceSummary } from "../types";

type NetworkSummaryProps = {
  items: InterfaceSummary[];
};

export function NetworkSummary({ items }: NetworkSummaryProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-[11px] text-zinc-400">
        Aucune information à afficher pour le moment.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <article
          key={item.name}
          className="rounded-xl border border-white/10 bg-white/5 p-3.5"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-white">{item.name}</h3>
              <p className="mt-1 text-[11px] text-zinc-400">État: {item.state}</p>
            </div>
            <div className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              interface
            </div>
          </div>

          <div className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard title="MAC" mono value={item.mac ?? "N/A"} />
            <ListCard title="IPv4" values={item.ipv4} />
            <ListCard title="IPv6" values={item.ipv6} />
          </div>
        </article>
      ))}
    </div>
  );
}

function InfoCard({
  title,
  value,
  mono = false
}: {
  title: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg bg-zinc-900/80 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{title}</p>
      <p
        className={[
          "mt-1.5 break-all text-[11px] text-zinc-200",
          mono ? "font-mono" : ""
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function ListCard({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-lg bg-zinc-900/80 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{title}</p>
      <div className="mt-2 space-y-2">
        {values.length > 0 ? (
          values.map((value) => (
            <p key={value} className="font-mono text-[11px] text-zinc-200">
              {value}
            </p>
          ))
        ) : (
          <p className="font-mono text-[11px] text-zinc-500">N/A</p>
        )}
      </div>
    </div>
  );
}
