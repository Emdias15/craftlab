import { NextRequest, NextResponse } from "next/server";
import { listProdutos, writeProduto } from "@/lib/storage";

export const dynamic = "force-dynamic";

function slugify(nome: string) {
  return nome
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const produtos = await listProdutos();
  return NextResponse.json(produtos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = slugify(body.nome);
  const existing = await listProdutos();
  if (existing.find(p => p.slug === slug)) {
    return NextResponse.json({ error: "Já existe um produto com esse nome." }, { status: 409 });
  }
  await writeProduto(slug, body);
  return NextResponse.json({ slug, ...body }, { status: 201 });
}
