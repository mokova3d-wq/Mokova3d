import { NextResponse } from "next/server";
import { getPages, getPageBySlug, upsertPage, deletePage, getPageRevisions } from "@/lib/api-db";
import { isAuthorizedAdmin } from "@/lib/auth-check";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const all = searchParams.get("all") === "true";

  if (slug) {
    const page = getPageBySlug(slug);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    const revisions = getPageRevisions(slug);
    return NextResponse.json({ page, revisions }, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  }

  const pages = getPages(!all);
  return NextResponse.json(pages, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

export async function POST(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.slug || !body.title) {
      return NextResponse.json({ error: "Slug and Title are required" }, { status: 400 });
    }

    upsertPage(body, "admin", body.revision_note || "Updated via Admin CMS");
    return NextResponse.json({ success: true, message: "Page and revision saved" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    }

    deletePage(slug);
    return NextResponse.json({ success: true, message: "Page deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}