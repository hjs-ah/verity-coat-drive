# Verity Coat Drive Tracker

A single front-end dashboard for VOW Center's annual coat drive, showing coats
given by family/donor name, sourced live from Notion. Built from the iThirst
water tracker, re-themed in brownish orange.

- **Filter** by Including Ministers / Excluding Ministers / Ministers Only
- **Filter by coat size** — All / Adult / Youth / Child
- **Sort** by most coats, fewest coats, name, or drop-off date
- **Goal progress bar**, ministers vs. lay split, totals by coat size, and
  given-away vs. still-in-stock counts
- **Light/dark toggle** (defaults to light, remembers your choice)
- Espresso / rust / sand palette, sans-serif type (Manrope + Inter)

## 1. The Notion database

**Coat Drive Donations** lives under Verity Giving in VOW Center Ops:

https://app.notion.com/p/8032deb99023497790870d68431390fc

| Property           | Type   | Notes                                                                 |
|--------------------|--------|------------------------------------------------------------------------|
| `Name`             | Title  | Family or donor name                                                  |
| `Coats`            | Number | Coats given                                                           |
| `Coat Type`        | Select | `Adult`, `Youth`, or `Child`                                          |
| `Tags`             | Select | `Lay Member` / `Minister`                                             |
| `Date Given`       | Date   | Shown on the site as "Drop-off date"                                  |
| `Notes`            | Text   | Optional                                                              |
| `Entry Type`       | Select | `Donation` or `Site Text`                                             |
| `Header`           | Text   | `Site Text` row only                                                  |
| `Subheader`        | Text   | `Site Text` row only                                                  |
| `Goal`             | Number | `Site Text` row only — coat goal for the progress bar (set to 300)    |
| `Coats Given Away` | Number | `Site Text` row only — running total distributed                      |
| `Logo`             | Files  | `Site Text` row only — overrides the bundled Verity mark              |

The database ships with 3 rows titled `SAMPLE — …` so you can confirm the site
works. **Delete them once real entries are in.**

### "Minister" is the only fixed tag

The non-minister tag text is read straight from Notion, so you can rename
"Lay Member" to anything. The tag **Minister** (case-insensitive) powers the
filters and the ministers/lay split — keep that option named exactly that.

### Editing the page from Notion

The row titled **"Site Text — do not delete"** (`Entry Type` = `Site Text`)
controls the header, subheader, goal, given-away count, and logo. Edits show
up on the live site within about 60 seconds, no redeploy. Don't change its
`Entry Type` or delete it, or the site falls back to built-in defaults.

## 2. Connect Notion to this app

1. At [notion.so/my-integrations](https://www.notion.so/my-integrations) create
   an **internal integration** (e.g. "Coat Drive Dashboard"). Copy the token —
   that's `NOTION_TOKEN`.
2. Open **Coat Drive Donations** in Notion → `···` → **Connections** → add the
   integration. (Without this the API can't read the database.)
3. `NOTION_DATABASE_ID` is `8032deb99023497790870d68431390fc`.
   If you get a 404 from Notion, set `NOTION_DATA_SOURCE_ID`
   (`c3eb5e35faf24d3ea9d296c181990c48`) instead — it takes priority when set.

## 3. Local development

```bash
npm install
cp .env.example .env.local
# paste your NOTION_TOKEN into .env.local
npm run dev
```

## 4. Deploy on Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
   (Framework Preset: Next.js).
2. Add environment variables `NOTION_TOKEN` and `NOTION_DATABASE_ID`
   (and `NOTION_DATA_SOURCE_ID` if needed).
3. Deploy. New Notion entries appear within about a minute.

## Notes

- All Notion access is server-side (`app/api/donations/route.ts`); the token
  never reaches the browser.
- Notion is called via its REST API directly (no SDK), so it works with either
  a database ID or a data source ID.
