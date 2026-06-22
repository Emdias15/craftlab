import { NextRequest, NextResponse } from "next/server";

const REPO   = process.env.GITHUB_REPO   ?? "";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";
const TOKEN  = process.env.GITHUB_TOKEN  ?? "";
const isVercel = process.env.VERCEL === "1";

import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Nenhum ficheiro enviado." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Gerar nome seguro para o ficheiro
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const slug = file.name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = `produto-${Date.now()}-${slug}`;
  const filePath = `public/produtos/${filename}`;

  if (!isVercel) {
    // Guardar localmente
    const localPath = path.join(process.cwd(), filePath);
    fs.writeFileSync(localPath, buffer);
    return NextResponse.json({ url: `/produtos/${filename}` });
  }

  // Upload para GitHub
  const content = buffer.toString("base64");
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `upload: ${filename}`,
        content,
        branch: BRANCH,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json({ error: err.message ?? "Erro ao fazer upload" }, { status: 500 });
  }

  return NextResponse.json({ url: `/produtos/${filename}` });
}
