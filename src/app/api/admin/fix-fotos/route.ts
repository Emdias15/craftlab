import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST() {
  const { data, error } = await supabase.from("produtos").select("slug, fotos");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let fixed = 0;
  for (const row of data ?? []) {
    const newFotos = (row.fotos as string[]).map((url: string) =>
      url.includes("/image/upload/f_jpg") ? url : url.replace("/image/upload/", "/image/upload/f_jpg,q_auto/")
    );
    const changed = newFotos.some((u, i) => u !== row.fotos[i]);
    if (changed) {
      await supabase.from("produtos").update({ fotos: newFotos }).eq("slug", row.slug);
      fixed++;
    }
  }

  return NextResponse.json({ ok: true, fixed });
}
