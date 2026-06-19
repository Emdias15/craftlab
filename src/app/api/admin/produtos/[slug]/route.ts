import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "content/produtos");

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const file = path.join(DIR, `${params.slug}.json`);
  if (!fs.existsSync(file)) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  return NextResponse.json({ slug: params.slug, ...raw });
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const file = path.join(DIR, `${params.slug}.json`);
  if (!fs.existsSync(file)) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const body = await req.json();
  const { slug: _s, ...data } = body;
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return NextResponse.json({ slug: params.slug, ...data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  const file = path.join(DIR, `${params.slug}.json`);
  if (!fs.existsSync(file)) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  fs.unlinkSync(file);
  return NextResponse.json({ ok: true });
}
