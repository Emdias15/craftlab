import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.SUPABASE_URL ?? "NOT SET";
  const keySet = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { data, error } = await supabase.from("produtos").select("slug").limit(1);
  return NextResponse.json({
    url: url.split("/rest")[0],
    key_set: keySet,
    db_ok: !error,
    db_error: error?.message ?? null,
    rows_found: data?.length ?? 0,
  });
}
