import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

const dir = path.join(process.cwd(), "content/produtos");

async function main() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
  for (const file of files) {
    const slug = file.replace(".json", "");
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    const row = {
      slug,
      nome: raw.nome,
      descricao: raw.descricao,
      descricao_longa: raw.descricaoLonga ?? null,
      preco: raw.preco,
      categoria: raw.categoria,
      tag: raw.tag ?? null,
      stock: raw.stock,
      destaque: raw.destaque,
      disponivel: raw.disponivel,
      fotos: raw.fotos,
    };
    const { error } = await supabase.from("produtos").upsert(row, { onConflict: "slug" });
    if (error) {
      console.error(`❌ ${slug}:`, error.message);
    } else {
      console.log(`✅ ${slug}`);
    }
  }
}

main().catch(console.error);
