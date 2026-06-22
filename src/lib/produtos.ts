import fs from "fs";
import path from "path";

export type Produto = {
  slug: string;
  nome: string;
  descricao: string;
  descricaoLonga?: string;
  preco: number;
  categoria: "anilhas" | "porta-chaves" | "combos";
  tag?: string;
  stock: number;
  destaque: boolean;
  disponivel: boolean;
  fotos: string[];
};

const isVercel = process.env.VERCEL === "1";
const REPO   = process.env.GITHUB_REPO   ?? "";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";
const TOKEN  = process.env.GITHUB_TOKEN  ?? "";

function ghHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function ghUrl(filePath: string) {
  return `https://api.github.com/repos/${REPO}/contents/${filePath}`;
}

export async function getProdutos(): Promise<Produto[]> {
  if (!isVercel) {
    const dir = path.join(process.cwd(), "content/produtos");
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter(f => f.endsWith(".json"))
      .map(f => {
        const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
        return { slug: f.replace(".json", ""), ...raw } as Produto;
      })
      .filter(p => p.disponivel);
  }

  const res = await fetch(ghUrl("content/produtos"), { headers: ghHeaders(), cache: "no-store" });
  if (!res.ok) return [];
  const files: { name: string }[] = await res.json();
  const results = await Promise.all(
    files.filter(f => f.name.endsWith(".json")).map(async f => {
      const r = await fetch(ghUrl(`content/produtos/${f.name}`), { headers: ghHeaders(), cache: "no-store" });
      const d = await r.json();
      const content = JSON.parse(Buffer.from(d.content, "base64").toString("utf-8"));
      return { slug: f.name.replace(".json", ""), ...content } as Produto;
    })
  );
  return results.filter(p => p.disponivel);
}

export async function getProdutosDestaque(): Promise<Produto[]> {
  const produtos = await getProdutos();
  return produtos.filter(p => p.destaque).slice(0, 4);
}

export async function getProduto(slug: string): Promise<Produto | null> {
  if (!isVercel) {
    const file = path.join(process.cwd(), "content/produtos", `${slug}.json`);
    if (!fs.existsSync(file)) return null;
    const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
    return { slug, ...raw } as Produto;
  }

  const res = await fetch(ghUrl(`content/produtos/${slug}.json`), { headers: ghHeaders(), cache: "no-store" });
  if (!res.ok) return null;
  const d = await res.json();
  const content = JSON.parse(Buffer.from(d.content, "base64").toString("utf-8"));
  return { slug, ...content } as Produto;
}
