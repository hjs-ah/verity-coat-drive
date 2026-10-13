interface CoatStatProps {
  total: number;
  layCoats: number;
  ministerCoats: number;
  layLabel: string;
  goal: number;
  coatsGivenAway: number;
  byType: { Adult: number; Youth: number; Child: number };
}

export default function CoatStat({
  total,
  layCoats,
  ministerCoats,
  layLabel,
  goal,
  coatsGivenAway,
  byType,
}: CoatStatProps) {
  const layShare = total > 0 ? (layCoats / total) * 100 : 50;
  const ministerShare = total > 0 ? (ministerCoats / total) * 100 : 50;
  const goalPercent = goal > 0 ? Math.round((total / goal) * 100) : 0;
  const goalProgressWidth = Math.min(100, goalPercent);
  const goalReached = total >= goal;
  const inStock = Math.max(0, total - coatsGivenAway);

  return (
    <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm dark:border-sand-700 dark:bg-sand-800 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-sand-400 dark:text-sand-500">
            Total coats given to date
          </span>
          <span className="font-display text-5xl font-extrabold tabular-nums text-ink-900 dark:text-sand-50 sm:text-6xl">
            {total.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-sand-400 dark:text-sand-500">
            {goalReached ? "Goal reached" : "Goal"}
          </span>
          <span className="font-display text-2xl font-bold tabular-nums text-rust-600 dark:text-rust-300">
            {goalPercent}%{" "}
            <span className="text-sm font-medium text-sand-400 dark:text-sand-500">
              of {goal.toLocaleString()}
            </span>
          </span>
        </div>
      </div>

      {/* Goal progress */}
      <div className="mt-5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand-100 dark:bg-sand-900/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-coat-light to-rust-500 transition-[width] duration-700 ease-out"
            style={{ width: `${goalProgressWidth}%` }}
          />
        </div>
      </div>

      {/* Signature element: a stitched seam, split by who gave */}
      <div className="mt-6">
        <div className="relative h-5 w-full overflow-hidden rounded-full bg-sand-100 dark:bg-sand-900/60">
          <div
            className="absolute inset-y-0 left-0 flex h-full transition-[width] duration-700 ease-out"
            style={{ width: total > 0 ? "100%" : "0%" }}
          >
            <div
              className="relative h-full overflow-hidden bg-coat transition-[width] duration-700 ease-out"
              style={{ width: `${layShare}%` }}
            >
              <StitchTexture />
            </div>
            <div
              className="relative h-full overflow-hidden bg-coat-dark transition-[width] duration-700 ease-out"
              style={{ width: `${ministerShare}%` }}
            >
              <StitchTexture />
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-sand-500 dark:text-sand-400">
          <LegendDot color="bg-coat" label={layLabel} value={layCoats} />
          <LegendDot color="bg-coat-dark" label="Ministers" value={ministerCoats} />
        </div>
      </div>

      {/* By coat size */}
      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-sand-100 pt-5 dark:border-sand-700/60">
        <TypeTile label="Adult" value={byType.Adult} />
        <TypeTile label="Youth" value={byType.Youth} />
        <TypeTile label="Child" value={byType.Child} />
      </div>

      {/* Given away vs. still in stock */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-sand-50 px-4 py-3 dark:bg-sand-900/40">
          <span className="block text-xs font-medium text-sand-500 dark:text-sand-400">
            Coats given away
          </span>
          <span className="font-display text-xl font-bold tabular-nums text-ink-900 dark:text-sand-50">
            {coatsGivenAway.toLocaleString()}
          </span>
        </div>
        <div className="rounded-2xl bg-sand-50 px-4 py-3 dark:bg-sand-900/40">
          <span className="block text-xs font-medium text-sand-500 dark:text-sand-400">
            Still in stock
          </span>
          <span className="font-display text-xl font-bold tabular-nums text-ink-900 dark:text-sand-50">
            {inStock.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function TypeTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-rust-50 px-4 py-3 dark:bg-rust-900/20">
      <span className="block text-xs font-medium text-rust-700 dark:text-rust-300">
        {label}
      </span>
      <span className="font-display text-xl font-bold tabular-nums text-ink-900 dark:text-sand-50">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function StitchTexture() {
  // Dashed "stitch" line that drifts slowly along the bar, like a seam.
  return (
    <svg
      className="absolute inset-0 h-full w-[calc(100%+24px)] animate-stitch opacity-60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="50%"
        x2="100%"
        y2="50%"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="2"
        strokeDasharray="8 6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LegendDot({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="font-medium text-sand-600 dark:text-sand-300">{label}</span>
      <span className="tabular-nums">{value.toLocaleString()}</span>
    </span>
  );
}
