import { supabase } from "@/lib/supabase";

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
  cores: string[];
};

type Row = {
  slug: string;
  nome: string;
  descricao: string;
  descricao_longa: string | null;
  preco: number;
  categoria: string;
  tag: string | null;
  stock: number;
  destaque: boolean;
  disponivel: boolean;
  fotos: string[];
  cores: string[] | null;
};

function toproduto(row: Row): Produto {
  return {
    slug: row.slug,
    nome: row.nome,
    descricao: row.descricao,
    descricaoLonga: row.descricao_longa ?? undefined,
    preco: row.preco,
    categoria: row.categoria as Produto["categoria"],
    tag: row.tag ?? undefined,
    stock: row.stock,
    destaque: row.destaque,
    disponivel: row.disponivel,
    fotos: row.fotos,
    cores: row.cores ?? [],
  };
}

export async function getProdutos(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("disponivel", true)
    .order("nome");
  if (error) return [];
  return (data as Row[]).map(toproduto);
}

export async function getProdutosDestaque(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("disponivel", true)
    .eq("destaque", true)
    .order("nome")
    .limit(4);
  if (error) return [];
  return (data as Row[]).map(toproduto);
}

export async function getProduto(slug: string): Promise<Produto | null> {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return toproduto(data as Row);
}
