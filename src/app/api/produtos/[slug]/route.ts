import { NextRequest, NextResponse } from "next/server";
import { getProduto } from "@/lib/produtos";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const produto = await getProduto(params.slug);
  if (!produto) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(produto);
}
