import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "content/produtos");

function slugify(nome: string) {
  return nome
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  if (!fs.existsSync(DIR)) return NextResponse.json([]);
  const produtos = fs.readdirSync(DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => {
      const raw = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf-8"));
      return { slug: f.replace(".json", ""), ...raw };
    });
  return NextResponse.json(produtos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = slugify(body.nome);
  const file = path.join(DIR, `${slug}.json`);
  if (fs.existsSync(file)) {
    return NextResponse.json({ error: "Já existe um produto com esse nome." }, { status: 409 });
  }
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  const { slug: _s, ...data } = body;
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return NextResponse.json({ slug, ...data }, { status: 201 });
}
