// Notion access for the Verity Coat Drive tracker.
//
// Uses Notion's REST API directly (no SDK) so it works whether the database
// is addressed by its database ID or by its data source (collection) ID —
// Notion's newer API versions require the latter for some workspaces.
//
//   NOTION_TOKEN            required — internal integration token
//   NOTION_DATABASE_ID      required unless NOTION_DATA_SOURCE_ID is set
//   NOTION_DATA_SOURCE_ID   optional — if set, takes priority

// The non-Minister tag text is whatever is typed in Notion (e.g. "Lay
// Member", "Member", "Volunteer") — the app doesn't hardcode it. "Minister"
// is the one fixed value the filters and totals key off of.
export type MemberTag = string;
export type CoatType = "Adult" | "Youth" | "Child" | null;

export interface Donation {
  id: string;
  name: string;
  coats: number;
  coatType: CoatType;
  tag: MemberTag;
  isMinister: boolean;
  dateGiven: string | null;
  notes: string;
}

export interface SiteText {
  header: string;
  subheader: string;
  goal: number;
  coatsGivenAway: number;
  logoUrl: string | null;
}

export const DEFAULT_SITE_TEXT: SiteText = {
  header: "Coats Given",
  subheader:
    "Every coat logged here keeps a neighbor warm this winter through the Verity annual coat drive. Filter by who gave, sort by what matters, and watch the total rise.",
  goal: 300,
  coatsGivenAway: 0,
  logoUrl: null,
};

const COAT_TYPES = ["Adult", "Youth", "Child"] as const;

function plain(rich: any): string {
  return Array.isArray(rich) ? rich.map((t: any) => t.plain_text).join("") : "";
}

async function queryPage(cursor: string | undefined) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      "NOTION_TOKEN is not set. Add it to your environment variables (see README)."
    );
  }
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!dataSourceId && !databaseId) {
    throw new Error(
      "NOTION_DATABASE_ID is not set. Add it to your environment variables (see README)."
    );
  }

  const url = dataSourceId
    ? `https://api.notion.com/v1/data_sources/${dataSourceId}/query`
    : `https://api.notion.com/v1/databases/${databaseId}/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": dataSourceId ? "2025-09-03" : "2022-06-28",
    },
    body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.message ?? "";
    } catch {
      /* ignore */
    }
    throw new Error(
      `Notion responded ${res.status}${detail ? `: ${detail}` : ""}. If this is a 404, make sure the database is shared with your integration, and try NOTION_DATA_SOURCE_ID instead of NOTION_DATABASE_ID.`
    );
  }
  return res.json();
}

/**
 * Pulls every row from the Coat Drive Donations database and splits it into
 * donation entries and the editable site text.
 *
 * Expected Notion schema:
 *   - Name             (title)
 *   - Coats            (number)
 *   - Coat Type        (select: "Adult" | "Youth" | "Child")
 *   - Tags             (select: "Lay Member" | "Minister")
 *   - Date Given       (date)         — shown as "Drop-off date"
 *   - Notes            (rich text)
 *   - Entry Type       (select: "Donation" | "Site Text")
 *   - Header           (rich text)  — Site Text row only
 *   - Subheader        (rich text)  — Site Text row only
 *   - Goal             (number)     — Site Text row only
 *   - Coats Given Away (number)     — Site Text row only
 *   - Logo             (files)      — Site Text row only
 */
export async function getCoatDriveData(): Promise<{
  donations: Donation[];
  siteText: SiteText;
}> {
  const donations: Donation[] = [];
  let siteText: SiteText = DEFAULT_SITE_TEXT;
  let cursor: string | undefined = undefined;

  do {
    const response: any = await queryPage(cursor);

    for (const page of response.results ?? []) {
      if (!page?.properties) continue;
      const props = page.properties as Record<string, any>;
      const entryType = props?.["Entry Type"]?.select?.name ?? "Donation";

      if (entryType === "Site Text") {
        const header = plain(props?.Header?.rich_text);
        const subheader = plain(props?.Subheader?.rich_text);
        const goal = props?.Goal?.number;
        const given = props?.["Coats Given Away"]?.number;
        const logoFile = props?.Logo?.files?.[0];
        const logoUrl: string | null =
          logoFile?.type === "external"
            ? logoFile.external?.url ?? null
            : logoFile?.file?.url ?? null;
        siteText = {
          header: header.trim() ? header : DEFAULT_SITE_TEXT.header,
          subheader: subheader.trim() ? subheader : DEFAULT_SITE_TEXT.subheader,
          goal: typeof goal === "number" && goal > 0 ? goal : DEFAULT_SITE_TEXT.goal,
          coatsGivenAway:
            typeof given === "number" && given >= 0
              ? given
              : DEFAULT_SITE_TEXT.coatsGivenAway,
          logoUrl,
        };
        continue;
      }

      const name = plain(props?.Name?.title) || "Untitled";
      const coats = typeof props?.Coats?.number === "number" ? props.Coats.number : 0;
      const rawType = props?.["Coat Type"]?.select?.name;
      const coatType: CoatType = (COAT_TYPES as readonly string[]).includes(rawType)
        ? rawType
        : null;
      const tag: MemberTag = props?.Tags?.select?.name ?? "Member";
      const isMinister = tag.toLowerCase() === "minister";
      const dateGiven = props?.["Date Given"]?.date?.start ?? null;
      const notes = plain(props?.Notes?.rich_text);

      donations.push({
        id: page.id,
        name,
        coats,
        coatType,
        tag,
        isMinister,
        dateGiven,
        notes,
      });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return { donations, siteText };
}
