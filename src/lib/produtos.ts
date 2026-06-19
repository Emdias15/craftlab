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

export function getProdutos(): Produto[] {
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

export function getProdutosDestaque(): Produto[] {
  return getProdutos().filter(p => p.destaque).slice(0, 4);
}

export function getProduto(slug: string): Produto | null {
  const file = path.join(process.cwd(), "content/produtos", `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  return { slug, ...raw } as Produto;
}
