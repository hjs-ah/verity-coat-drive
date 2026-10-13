"use client";

import { useEffect, useMemo, useState } from "react";
import type { Donation, MemberTag, SiteText, CoatType } from "@/lib/notion";
import { DEFAULT_SITE_TEXT } from "@/lib/notion";
import CoatStat from "./components/CoatStat";
import ThemeToggle from "./components/ThemeToggle";
import BrandMark from "./components/BrandMark";

type FilterMode = "all" | "excluding" | "only";
type SortMode = "name" | "coats-desc" | "coats-asc" | "newest" | "oldest";
type TypeFilter = "all" | "Adult" | "Youth" | "Child";

const FILTERS: { id: FilterMode; label: string }[] = [
  { id: "all", label: "Including Ministers" },
  { id: "excluding", label: "Excluding Ministers" },
  { id: "only", label: "Ministers Only" },
];

const SORTS: { id: SortMode; label: string }[] = [
  { id: "coats-desc", label: "Most coats" },
  { id: "coats-asc", label: "Fewest coats" },
  { id: "name", label: "Name (A–Z)" },
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
];

const TYPE_FILTERS: { id: TypeFilter; label: string }[] = [
  { id: "all", label: "All sizes" },
  { id: "Adult", label: "Adult" },
  { id: "Youth", label: "Youth" },
  { id: "Child", label: "Child" },
];

export default function Home() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [siteText, setSiteText] = useState<SiteText>(DEFAULT_SITE_TEXT);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortMode>("coats-desc");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/donations");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setErrorMessage(data.error ?? "Something went wrong loading donations.");
          setStatus("error");
          return;
        }
        setDonations(data.donations ?? []);
        if (data.siteText) setSiteText(data.siteText);
        setStatus("ready");
      } catch (err: any) {
        if (cancelled) return;
        setErrorMessage(err?.message ?? "Could not reach the server.");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = donations;
    if (filter === "excluding") list = list.filter((d) => !d.isMinister);
    if (filter === "only") list = list.filter((d) => d.isMinister);
    if (typeFilter !== "all") list = list.filter((d) => d.coatType === typeFilter);

    return [...list].sort((a, b) => {
      switch (sort) {
        case "coats-desc":
          return b.coats - a.coats;
        case "coats-asc":
          return a.coats - b.coats;
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return (b.dateGiven ?? "").localeCompare(a.dateGiven ?? "");
        case "oldest":
          return (a.dateGiven ?? "").localeCompare(b.dateGiven ?? "");
        default:
          return 0;
      }
    });
  }, [donations, filter, typeFilter, sort]);

  const totals = useMemo(() => {
    const nonMinisters = donations.filter((d) => !d.isMinister);
    const layCoats = nonMinisters.reduce((sum, d) => sum + d.coats, 0);
    const ministerCoats = donations
      .filter((d) => d.isMinister)
      .reduce((sum, d) => sum + d.coats, 0);
    const allTimeTotal = layCoats + ministerCoats;
    const byType = { Adult: 0, Youth: 0, Child: 0 };
    for (const d of donations) {
      if (d.coatType) byType[d.coatType] += d.coats;
    }
    // Reflects whatever tag text is actually used in Notion (e.g. "Lay
    // Member", "Member") instead of a hardcoded label.
    const layLabel = nonMinisters[0]?.tag ?? "Members";
    return {
      entryCount: filtered.length,
      layCoats,
      ministerCoats,
      allTimeTotal,
      layLabel,
      byType,
    };
  }, [filtered, donations]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        <header className="flex items-start justify-between gap-4">
          <div className="animate-rise">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-rust-500 dark:text-rust-300">
              VOW Center · Annual Coat Drive
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-sand-50 sm:text-4xl">
              {siteText.header}
            </h1>
            <p className="mt-2 max-w-lg text-sm text-sand-600 dark:text-sand-400">
              {siteText.subheader}
            </p>
          </div>
          <ThemeToggle />
        </header>

        <section className="mt-8 animate-rise [animation-delay:80ms]">
          <CoatStat
            total={totals.allTimeTotal}
            layCoats={totals.layCoats}
            ministerCoats={totals.ministerCoats}
            layLabel={totals.layLabel}
            goal={siteText.goal}
            coatsGivenAway={siteText.coatsGivenAway}
            byType={totals.byType}
          />
        </section>

        <section className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div
              role="tablist"
              aria-label="Filter by tag"
              className="inline-flex flex-wrap rounded-lg border border-sand-200 bg-white p-1 text-sm dark:border-sand-700 dark:bg-sand-800"
            >
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-md px-4 py-1.5 font-medium transition-colors ${
                    filter === f.id
                      ? "bg-rust-500 text-white shadow-sm"
                      : "text-sand-600 hover:text-ink-900 dark:text-sand-300 dark:hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div
              role="tablist"
              aria-label="Filter by coat size"
              className="inline-flex flex-wrap rounded-lg border border-sand-200 bg-white p-1 text-sm dark:border-sand-700 dark:bg-sand-800"
            >
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={typeFilter === f.id}
                  onClick={() => setTypeFilter(f.id)}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    typeFilter === f.id
                      ? "bg-ink-800 text-white shadow-sm dark:bg-sand-600"
                      : "text-sand-600 hover:text-ink-900 dark:text-sand-300 dark:hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-sand-600 dark:text-sand-300">
            <span className="font-medium">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="rounded-lg border border-sand-200 bg-white px-3 py-1.5 text-sm text-ink-900 shadow-sm focus:border-rust-400 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-100"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="mt-6">
          {status === "loading" && <ListSkeleton />}

          {status === "error" && (
            <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center dark:border-sand-700 dark:bg-sand-800">
              <p className="font-display font-semibold text-ink-900 dark:text-sand-50">
                Couldn&apos;t load donations
              </p>
              <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">
                {errorMessage}
              </p>
            </div>
          )}

          {status === "ready" && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-sand-300 bg-white/60 p-10 text-center dark:border-sand-700 dark:bg-sand-800/40">
              <p className="font-display font-semibold text-ink-900 dark:text-sand-50">
                No entries yet
              </p>
              <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">
                Add a row to the Coat Drive Donations database in Notion and it
                will show up here.
              </p>
            </div>
          )}

          {status === "ready" && filtered.length > 0 && (
            <DonationTable donations={filtered} />
          )}
        </section>

        <p className="mt-10 text-center text-xs text-sand-400 dark:text-sand-500">
          {totals.entryCount} {totals.entryCount === 1 ? "entry" : "entries"}{" "}
          shown · Data synced from DB
        </p>

        <BrandMark logoUrl={siteText.logoUrl} />

        <MandateVerse />
      </div>
    </main>
  );
}

function MandateVerse() {
  return (
    <section className="mx-auto mt-10 max-w-xl text-center">
      <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-sand-400 dark:text-sand-500">
        Our Mandate — Matthew 25:31–40 (KJV)
      </p>
      <blockquote className="mt-3 text-sm italic leading-relaxed text-sand-500 dark:text-sand-400">
        &ldquo;For I was an hungred, and ye gave me meat: I was thirsty, and
        ye gave me drink: I was a stranger, and ye took me in: Naked, and ye
        clothed me: I was sick, and ye visited me: I was in prison, and ye
        came unto me.&rdquo;
        <span className="mt-2 block not-italic text-xs text-sand-400 dark:text-sand-500">
          &ldquo;Inasmuch as ye have done it unto one of the least of these my
          brethren, ye have done it unto me.&rdquo; — v.40
        </span>
      </blockquote>
    </section>
  );
}

function DonationTable({ donations }: { donations: Donation[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm dark:border-sand-700 dark:bg-sand-800">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-sand-200 bg-sand-50 text-xs uppercase tracking-wide text-sand-500 dark:border-sand-700 dark:bg-sand-900/40 dark:text-sand-400">
            <th className="px-5 py-3 font-semibold">Name</th>
            <th className="px-5 py-3 font-semibold">Tag</th>
            <th className="hidden px-5 py-3 font-semibold sm:table-cell">Size</th>
            <th className="px-5 py-3 text-right font-semibold">Coats</th>
            <th className="hidden px-5 py-3 font-semibold sm:table-cell">
              Drop-off date
            </th>
          </tr>
        </thead>
        <tbody>
          {donations.map((d, i) => (
            <tr
              key={d.id}
              className={`border-b border-sand-100 last:border-0 dark:border-sand-700/60 ${
                i % 2 === 1 ? "bg-sand-50/60 dark:bg-sand-900/20" : ""
              }`}
            >
              <td className="px-5 py-3 font-medium text-ink-900 dark:text-sand-100">
                {d.name}
              </td>
              <td className="px-5 py-3">
                <TagPill tag={d.tag} isMinister={d.isMinister} />
              </td>
              <td className="hidden px-5 py-3 sm:table-cell">
                <SizePill type={d.coatType} />
              </td>
              <td className="px-5 py-3 text-right font-display font-bold text-rust-600 dark:text-rust-300">
                {d.coats}
              </td>
              <td className="hidden px-5 py-3 text-sand-500 dark:text-sand-400 sm:table-cell">
                {formatDate(d.dateGiven)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TagPill({ tag, isMinister }: { tag: MemberTag; isMinister: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isMinister
          ? "bg-rust-100 text-rust-700 dark:bg-rust-900/60 dark:text-rust-200"
          : "bg-sand-100 text-sand-600 dark:bg-sand-700 dark:text-sand-300"
      }`}
    >
      {tag}
    </span>
  );
}

function SizePill({ type }: { type: CoatType }) {
  if (!type) return <span className="text-sand-400 dark:text-sand-500">—</span>;
  return (
    <span className="inline-flex items-center rounded-full border border-sand-200 px-2.5 py-0.5 text-xs font-medium text-sand-600 dark:border-sand-600 dark:text-sand-300">
      {type}
    </span>
  );
}

function ListSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white dark:border-sand-700 dark:bg-sand-800">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-sand-100 px-5 py-4 last:border-0 dark:border-sand-700/60"
        >
          <div className="h-3 w-32 animate-pulse rounded bg-sand-200 dark:bg-sand-700" />
          <div className="h-3 w-16 animate-pulse rounded-full bg-sand-200 dark:bg-sand-700" />
          <div className="ml-auto h-3 w-8 animate-pulse rounded bg-sand-200 dark:bg-sand-700" />
        </div>
      ))}
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  // Date-only values (YYYY-MM-DD) parse as UTC; format in UTC so the day
  // doesn't shift backwards for viewers west of Greenwich.
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: iso.length <= 10 ? "UTC" : undefined,
  });
}
