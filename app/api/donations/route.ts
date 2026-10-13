import { NextResponse } from "next/server";
import { getCoatDriveData } from "@/lib/notion";

// Revalidate at most every 60 seconds so new Notion entries — and header
// text edits — show up without needing a redeploy.
export const revalidate = 60;

export async function GET() {
  try {
    const { donations, siteText } = await getCoatDriveData();
    return NextResponse.json({ donations, siteText });
  } catch (error: any) {
    console.error("Failed to load data from Notion:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to load data." },
      { status: 500 }
    );
  }
}
