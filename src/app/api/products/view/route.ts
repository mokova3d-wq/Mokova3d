import { NextResponse } from "next/server";
import { recordProductView } from "@/lib/api-db";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (id) {
      recordProductView(id);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}