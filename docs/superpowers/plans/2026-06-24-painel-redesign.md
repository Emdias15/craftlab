# Painel Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar o painel de administração com visual premium, suporte a múltiplas fotos, filtros, stock inline e páginas dedicadas de criação/edição em vez de modal.

**Architecture:** 3 páginas React client-side: lista principal (`/painel`), formulário de criar (`/painel/produto/novo`) e formulário de editar (`/painel/produto/[slug]`). Todas usam os mesmos API routes existentes. Sem novas dependências.

**Tech Stack:** Next.js 14, TypeScript, React hooks, inline styles (padrão existente no projecto), Cloudinary (upload via `/api/admin/upload`), Supabase via API routes existentes.

## Global Constraints

- Next.js 14, TypeScript strict — `npx tsc --noEmit` deve passar sem erros
- Paleta: primary `#2E6B9E`, earth `#0D253F`, muted `#5E8DAA`, sand `#A8CBE0`, dark `#0A1E32`, bg `#EEF5FB`, linen `#E0EDF7`, warm `#F0F7FD`, red `#c0392b`, green `#27ae60`
- Tipografia: serif `'Cormorant Garamond', Georgia, serif` · sans `'Jost', system-ui, sans-serif`
- Inline styles (sem Tailwind, sem CSS modules) — seguir padrão do projecto
- Máximo de 6 fotos por produto
- Toast no canto superior direito, desaparece após 4 segundos
- Middleware já protege `/painel/:path*` — sem alterações
- Não adicionar dependências ao `package.json`

---

## File Map

| Ficheiro | Acção |
|---|---|
| `src/app/(admin)/painel/page.tsx` | Reescrever — lista, dashboard, filtros, stock inline |
| `src/app/(admin)/painel/produto/novo/page.tsx` | Criar — formulário de criar |
| `src/app/(admin)/painel/produto/[slug]/page.tsx` | Criar — formulário de editar/apagar |

---

## Task 1: Lista de produtos — reescrever `/painel/page.tsx`

**Files:**
- Modify: `src/app/(admin)/painel/page.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/produtos`, `PUT /api/admin/produtos/[slug]`, `DELETE /api/admin/produtos/[slug]`, `DELETE /api/auth`
- Produces: página lista acessível em `/painel`

- [ ] **Step 1: Substituir o conteúdo de `src/app/(admin)/painel/page.tsx`**

```tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const P = {
  primary: "#2E6B9E", earth: "#0D253F", muted: "#5E8DAA", sand: "#A8CBE0",
  dark: "#0A1E32", bg: "#EEF5FB", linen: "#E0EDF7", warm: "#F0F7FD",
  red: "#c0392b", green: "#27ae60",
};
const T = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Jost', system-ui, sans-serif",
};

type Produto = {
  slug: string; nome: string; descricao: string; preco: number;
  categoria: string; tag?: string; stock: number;
  destaque: boolean; disponivel: boolean; fotos: string[];
};

export default function PainelPage() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [dispFilter, setDispFilter] = useState<"todos" | "disponivel" | "esgotado">("todos");
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockVal, setStockVal] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const carregar = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/produtos?t=${Date.now()}`);
      if (!r.ok) throw new Error("Sessão expirada");
      setProdutos(await r.json());
    } catch (e) {
      flash((e as Error).message, false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const filtered = useMemo(() => produtos.filter(p => {
    if (query && !p.nome.toLowerCase().includes(query.toLowerCase())) return false;
    if (categoria !== "todos" && p.categoria !== categoria) return false;
    if (dispFilter === "disponivel" && (!p.disponivel || p.stock === 0)) return false;
    if (dispFilter === "esgotado" && p.stock > 0) return false;
    return true;
  }), [produtos, query, categoria, dispFilter]);

  const stats = useMemo(() => ({
    total: produtos.length,
    emStock: produtos.filter(p => p.stock > 0).length,
    esgotados: produtos.filter(p => p.stock === 0).length,
  }), [produtos]);

  const salvarStock = async (slug: string) => {
    const produto = produtos.find(p => p.slug === slug);
    if (!produto) return;
    const novoStock = parseInt(stockVal) || 0;
    try {
      const r = await fetch(`/api/admin/produtos/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...produto, stock: novoStock }),
      });
      if (!r.ok) throw new Error("Erro ao guardar stock");
      setProdutos(prev => prev.map(p => p.slug === slug ? { ...p, stock: novoStock } : p));
      flash("Stock actualizado!");
    } catch (e) {
      flash((e as Error).message, false);
    } finally {
      setEditingStock(null);
    }
  };

  const apagar = async (slug: string) => {
    try {
      await fetch(`/api/admin/produtos/${slug}`, { method: "DELETE" });
      setProdutos(prev => prev.filter(p => p.slug !== slug));
      flash("Produto apagado.");
    } catch {
      flash("Erro ao apagar produto.", false);
    } finally {
      setConfirmDelete(null);
    }
  };

  const sair = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin-login");
  };

  const stockColor = (s: number) => s === 0 ? P.red : s <= 3 ? "#e67e22" : P.green;

  return (
    <div style={{ minHeight: "100svh", background: P.bg, fontFamily: T.sans }}>

      {toast && (
        <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 200, background: toast.ok ? P.green : P.red, color: "#fff", padding: "0.75rem 1.25rem", borderRadius: 6, fontFamily: T.sans, fontSize: "0.75rem", letterSpacing: "0.08em", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ background: P.dark, padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img src="/logo.png" alt="CraftLab.ed" style={{ height: 36, width: 36, objectFit: "contain" }} />
          <span style={{ fontFamily: T.serif, fontStyle: "italic", fontSize: "1.1rem", color: "#fff" }}>Painel de Gestão</span>
        </div>
        <button onClick={sair} style={{ fontFamily: T.sans, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: `${P.sand}80`, background: "none", border: "none", cursor: "pointer" }}>
          Sair
        </button>
      </div>

      <div style={{ background: P.earth, padding: "1rem 1.25rem", display: "flex", gap: "2rem" }}>
        {[
          { label: "Produtos", value: stats.total },
          { label: "Em stock", value: stats.emStock },
          { label: "Esgotados", value: stats.esgotados },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: T.serif, fontSize: "1.8rem", color: "#fff", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: T.sans, fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: `${P.sand}80`, marginTop: "0.2rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.25rem 1rem" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Pesquisar produtos..." style={{ flex: 1, padding: "0.65rem 0.875rem", border: `1px solid ${P.sand}80`, background: "#fff", fontFamily: T.sans, fontSize: "0.82rem", color: P.earth, outline: "none", boxSizing: "border-box" as const }} />
            <button onClick={() => router.push("/painel/produto/novo")} style={{ background: P.primary, color: "#fff", border: "none", padding: "0.6rem 1.1rem", fontFamily: T.sans, fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>
              + Novo
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ flex: 1, padding: "0.65rem 0.875rem", border: `1px solid ${P.sand}80`, background: "#fff", fontFamily: T.sans, fontSize: "0.82rem", color: P.earth, outline: "none" }}>
              <option value="todos">Todas as categorias</option>
              <option value="anilhas">Anilhas</option>
              <option value="porta-chaves">Porta-chaves</option>
              <option value="combos">Combos & Packs</option>
            </select>
            <select value={dispFilter} onChange={e => setDispFilter(e.target.value as "todos" | "disponivel" | "esgotado")} style={{ flex: 1, padding: "0.65rem 0.875rem", border: `1px solid ${P.sand}80`, background: "#fff", fontFamily: T.sans, fontSize: "0.82rem", color: P.earth, outline: "none" }}>
              <option value="todos">Todos</option>
              <option value="disponivel">Disponíveis</option>
              <option value="esgotado">Esgotados</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: P.muted, padding: "3rem 0", fontSize: "0.75rem" }}>A carregar...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: P.muted, padding: "3rem 0", fontSize: "0.75rem" }}>
            {produtos.length === 0 ? "Nenhum produto ainda." : "Nenhum produto corresponde ao filtro."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {filtered.map(p => (
              <div key={p.slug} style={{ background: "#fff", border: `1px solid ${P.sand}50`, padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 52, height: 52, background: P.linen, flexShrink: 0, overflow: "hidden" }}>
                  {p.fotos?.[0] && <img src={p.fotos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: "0.88rem", color: P.earth, marginBottom: "0.15rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nome}</p>
                  <p style={{ fontSize: "0.7rem", color: P.muted }}>{p.preco.toFixed(2).replace(".", ",")} € · {p.categoria}</p>
                </div>
                {editingStock === p.slug ? (
                  <input
                    type="number" min={0} value={stockVal}
                    onChange={e => setStockVal(e.target.value)}
                    onBlur={() => salvarStock(p.slug)}
                    onKeyDown={e => { if (e.key === "Enter") salvarStock(p.slug); if (e.key === "Escape") setEditingStock(null); }}
                    autoFocus
                    style={{ width: 60, padding: "0.3rem 0.4rem", border: `1px solid ${P.primary}`, background: P.warm, fontFamily: T.sans, fontSize: "0.78rem", color: P.earth, textAlign: "center", outline: "none" }}
                  />
                ) : (
                  <button onClick={() => { setEditingStock(p.slug); setStockVal(String(p.stock)); }} style={{ flexShrink: 0, background: stockColor(p.stock) + "18", border: `1px solid ${stockColor(p.stock)}50`, color: stockColor(p.stock), borderRadius: 4, padding: "0.28rem 0.55rem", fontFamily: T.sans, fontSize: "0.65rem", fontWeight: 600, cursor: "pointer", minWidth: 52, textAlign: "center" }}>
                    {p.stock === 0 ? "Esgotado" : `${p.stock}`}
                  </button>
                )}
                <button onClick={() => router.push(`/painel/produto/${p.slug}`)} style={{ flexShrink: 0, background: P.linen, border: `1px solid ${P.sand}60`, color: P.earth, padding: "0.4rem 0.75rem", fontFamily: T.sans, fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
                  Editar
                </button>
                {confirmDelete === p.slug ? (
                  <button onClick={() => apagar(p.slug)} style={{ flexShrink: 0, background: P.red, border: "none", color: "#fff", padding: "0.4rem 0.6rem", fontFamily: T.sans, fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                    Confirmar
                  </button>
                ) : (
                  <button onClick={() => setConfirmDelete(p.slug)} style={{ flexShrink: 0, background: "none", border: `1px solid ${P.red}40`, color: P.red, padding: "0.4rem 0.6rem", fontFamily: T.sans, fontSize: "0.58rem", cursor: "pointer" }}>
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

  ```bash
  cd /Users/edias/craftlab && npx tsc --noEmit
  ```

  Resultado esperado: sem erros

- [ ] **Step 3: Commit**

  ```bash
  git add src/app/\(admin\)/painel/page.tsx
  git commit -m "feat: redesign painel lista com dashboard, filtros e stock inline"
  ```

---

## Task 2: Formulário de criar — `/painel/produto/novo/page.tsx`

**Files:**
- Create: `src/app/(admin)/painel/produto/novo/page.tsx`

**Interfaces:**
- Consumes: `POST /api/admin/produtos`, `POST /api/admin/upload`
- Produces: página de criação acessível em `/painel/produto/novo`

- [ ] **Step 1: Criar `src/app/(admin)/painel/produto/novo/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const P = {
  primary: "#2E6B9E", earth: "#0D253F", muted: "#5E8DAA", sand: "#A8CBE0",
  dark: "#0A1E32", bg: "#EEF5FB", linen: "#E0EDF7", warm: "#F0F7FD",
  red: "#c0392b", green: "#27ae60",
};
const T = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Jost', system-ui, sans-serif",
};

const EMPTY = {
  nome: "", descricao: "", descricaoLonga: "",
  preco: "" as unknown as number, categoria: "anilhas", tag: "",
  stock: "" as unknown as number, destaque: false, disponivel: true,
  fotos: [] as string[],
};

export default function NovoProdutoPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const f = (field: keyof typeof EMPTY, val: unknown) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const uploadFoto = async (file: File) => {
    if (form.fotos.length >= 6) { flash("Máximo de 6 fotos.", false); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      f("fotos", [...form.fotos, data.url]);
      flash("Foto carregada!");
    } else {
      flash(data.error ?? "Erro ao carregar foto", false);
    }
    setUploading(false);
  };

  const removerFoto = (url: string) =>
    f("fotos", form.fotos.filter(u => u !== url));

  const salvar = async () => {
    if (!form.nome || !form.descricao) return;
    setSaving(true);
    const dados = {
      ...form,
      preco: parseFloat(form.preco as unknown as string) || 0,
      stock: parseInt(form.stock as unknown as string) || 0,
    };
    const res = await fetch("/api/admin/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      flash(d.error ?? "Erro ao criar produto", false);
      setSaving(false);
      return;
    }
    router.push("/painel");
  };

  const stockColor = (s: string | number) => {
    const n = typeof s === "string" ? parseInt(s) || 0 : s;
    return n === 0 ? P.red : n <= 3 ? "#e67e22" : P.green;
  };

  return (
    <div style={{ minHeight: "100svh", background: P.bg, fontFamily: T.sans }}>

      {toast && (
        <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 200, background: toast.ok ? P.green : P.red, color: "#fff", padding: "0.75rem 1.25rem", borderRadius: 6, fontFamily: T.sans, fontSize: "0.75rem", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ background: P.dark, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={() => router.push("/painel")} style={{ background: "none", border: "none", color: `${P.sand}80`, cursor: "pointer", fontFamily: T.sans, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>← Painel</button>
        <span style={{ fontFamily: T.serif, fontStyle: "italic", fontSize: "1.1rem", color: "#fff" }}>Novo produto</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          <Field label="Nome do produto *">
            <input value={form.nome} onChange={e => f("nome", e.target.value)} style={inputStyle} placeholder="Ex: Anilha Escutista Clássica" />
          </Field>

          <Field label="Descrição curta *">
            <input value={form.descricao} onChange={e => f("descricao", e.target.value)} style={inputStyle} placeholder="Ex: Em corda de algodão trançada à mão" />
          </Field>

          <Field label="Descrição detalhada">
            <textarea value={form.descricaoLonga} onChange={e => f("descricaoLonga", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Detalhes do produto..." />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Preço (€) *">
              <input type="number" min={0} step={0.01} value={form.preco} onChange={e => f("preco", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Stock *">
              <input type="number" min={0} step={1} value={form.stock} onChange={e => f("stock", e.target.value)} style={{ ...inputStyle, color: stockColor(form.stock) }} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Categoria">
              <select value={form.categoria} onChange={e => f("categoria", e.target.value)} style={inputStyle}>
                <option value="anilhas">Anilhas</option>
                <option value="porta-chaves">Porta-chaves</option>
                <option value="combos">Combos & Packs</option>
              </select>
            </Field>
            <Field label="Etiqueta">
              <select value={form.tag} onChange={e => f("tag", e.target.value)} style={inputStyle}>
                <option value="">Nenhuma</option>
                <option value="Best seller">Best Seller</option>
                <option value="Novo">Novo</option>
                <option value="Oferta">Oferta</option>
              </select>
            </Field>
          </div>

          <Field label={`Fotos (${form.fotos.length}/6)`}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {form.fotos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  {form.fotos.map(url => (
                    <div key={url} style={{ position: "relative", aspectRatio: "1", background: P.linen, overflow: "hidden" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={() => removerFoto(url)} style={{ position: "absolute", top: 4, right: 4, background: P.red, color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              {form.fotos.length < 6 && (
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem", background: uploading ? P.muted : P.linen, border: `2px dashed ${P.sand}`, cursor: uploading ? "wait" : "pointer", fontFamily: T.sans, fontSize: "0.72rem", fontWeight: 500, color: P.primary, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const file = e.target.files?.[0]; if (file) uploadFoto(file); }} />
                  {uploading ? "A carregar..." : "📷  Adicionar foto"}
                </label>
              )}
            </div>
          </Field>

          <div style={{ display: "flex", gap: "1.25rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.8rem", color: P.earth }}>
              <input type="checkbox" checked={form.disponivel} onChange={e => f("disponivel", e.target.checked)} style={{ width: 18, height: 18, accentColor: P.primary }} />
              Disponível
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.8rem", color: P.earth }}>
              <input type="checkbox" checked={form.destaque} onChange={e => f("destaque", e.target.checked)} style={{ width: 18, height: 18, accentColor: P.primary }} />
              Em destaque
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button onClick={() => router.push("/painel")} style={{ flex: 1, padding: "0.9rem", background: P.linen, border: `1px solid ${P.sand}60`, color: P.earth, fontFamily: T.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={salvar} disabled={saving || !form.nome || !form.descricao} style={{ flex: 2, padding: "0.9rem", background: saving ? P.muted : P.primary, color: "#fff", border: "none", fontFamily: T.sans, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: saving ? "wait" : "pointer" }}>
              {saving ? "A criar..." : "Criar produto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: T.sans, fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: P.muted, marginBottom: "0.4rem" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.75rem 0.875rem",
  border: `1px solid ${P.sand}80`, background: "#fff",
  fontFamily: T.sans, fontSize: "0.9rem", color: P.earth,
  outline: "none", boxSizing: "border-box", borderRadius: 0, WebkitAppearance: "none",
};
```

- [ ] **Step 2: Criar o directório e confirmar**

  ```bash
  ls /Users/edias/craftlab/src/app/\(admin\)/painel/produto/novo/
  ```

  Resultado esperado: `page.tsx`

- [ ] **Step 3: Verificar TypeScript**

  ```bash
  cd /Users/edias/craftlab && npx tsc --noEmit
  ```

  Resultado esperado: sem erros

- [ ] **Step 4: Commit**

  ```bash
  git add src/app/\(admin\)/painel/produto/novo/page.tsx
  git commit -m "feat: add painel criar produto page com multiplas fotos"
  ```

---

## Task 3: Formulário de editar — `/painel/produto/[slug]/page.tsx`

**Files:**
- Create: `src/app/(admin)/painel/produto/[slug]/page.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/produtos/[slug]`, `PUT /api/admin/produtos/[slug]`, `DELETE /api/admin/produtos/[slug]`, `POST /api/admin/upload`
- Produces: página de edição acessível em `/painel/produto/[slug]`

- [ ] **Step 1: Criar `src/app/(admin)/painel/produto/[slug]/page.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const P = {
  primary: "#2E6B9E", earth: "#0D253F", muted: "#5E8DAA", sand: "#A8CBE0",
  dark: "#0A1E32", bg: "#EEF5FB", linen: "#E0EDF7", warm: "#F0F7FD",
  red: "#c0392b", green: "#27ae60",
};
const T = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Jost', system-ui, sans-serif",
};

type FormData = {
  nome: string; descricao: string; descricaoLonga: string;
  preco: number | string; categoria: string; tag: string;
  stock: number | string; destaque: boolean; disponivel: boolean; fotos: string[];
};

export default function EditarProdutoPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<FormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch(`/api/admin/produtos/${params.slug}`)
      .then(r => r.json())
      .then(d => setForm({
        nome: d.nome ?? "", descricao: d.descricao ?? "",
        descricaoLonga: d.descricaoLonga ?? "", preco: d.preco ?? 0,
        categoria: d.categoria ?? "anilhas", tag: d.tag ?? "",
        stock: d.stock ?? 0, destaque: d.destaque ?? false,
        disponivel: d.disponivel ?? true, fotos: d.fotos ?? [],
      }))
      .catch(() => flash("Erro ao carregar produto", false));
  }, [params.slug]);

  const f = (field: keyof FormData, val: unknown) =>
    setForm(prev => prev ? { ...prev, [field]: val } : prev);

  const uploadFoto = async (file: File) => {
    if (!form || form.fotos.length >= 6) { flash("Máximo de 6 fotos.", false); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      f("fotos", [...form.fotos, data.url]);
      flash("Foto carregada!");
    } else {
      flash(data.error ?? "Erro ao carregar foto", false);
    }
    setUploading(false);
  };

  const removerFoto = (url: string) =>
    f("fotos", form!.fotos.filter(u => u !== url));

  const salvar = async () => {
    if (!form || !form.nome || !form.descricao) return;
    setSaving(true);
    const dados = {
      ...form,
      preco: parseFloat(form.preco as string) || 0,
      stock: parseInt(form.stock as string) || 0,
    };
    const res = await fetch(`/api/admin/produtos/${params.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      flash(d.error ?? "Erro ao guardar", false);
      setSaving(false);
      return;
    }
    router.push("/painel");
  };

  const apagar = async () => {
    await fetch(`/api/admin/produtos/${params.slug}`, { method: "DELETE" });
    router.push("/painel");
  };

  const stockColor = (s: number | string) => {
    const n = typeof s === "string" ? parseInt(s) || 0 : s;
    return n === 0 ? P.red : n <= 3 ? "#e67e22" : P.green;
  };

  if (!form) return (
    <div style={{ minHeight: "100svh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: T.sans, color: P.muted, fontSize: "0.8rem" }}>A carregar...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100svh", background: P.bg, fontFamily: T.sans }}>

      {toast && (
        <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 200, background: toast.ok ? P.green : P.red, color: "#fff", padding: "0.75rem 1.25rem", borderRadius: 6, fontFamily: T.sans, fontSize: "0.75rem", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ background: P.dark, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={() => router.push("/painel")} style={{ background: "none", border: "none", color: `${P.sand}80`, cursor: "pointer", fontFamily: T.sans, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>← Painel</button>
        <span style={{ fontFamily: T.serif, fontStyle: "italic", fontSize: "1.1rem", color: "#fff" }}>Editar produto</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          <Field label="Nome do produto *">
            <input value={form.nome} onChange={e => f("nome", e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Descrição curta *">
            <input value={form.descricao} onChange={e => f("descricao", e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Descrição detalhada">
            <textarea value={form.descricaoLonga} onChange={e => f("descricaoLonga", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Preço (€) *">
              <input type="number" min={0} step={0.01} value={form.preco} onChange={e => f("preco", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Stock *">
              <input type="number" min={0} step={1} value={form.stock} onChange={e => f("stock", e.target.value)} style={{ ...inputStyle, color: stockColor(form.stock) }} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Categoria">
              <select value={form.categoria} onChange={e => f("categoria", e.target.value)} style={inputStyle}>
                <option value="anilhas">Anilhas</option>
                <option value="porta-chaves">Porta-chaves</option>
                <option value="combos">Combos & Packs</option>
              </select>
            </Field>
            <Field label="Etiqueta">
              <select value={form.tag} onChange={e => f("tag", e.target.value)} style={inputStyle}>
                <option value="">Nenhuma</option>
                <option value="Best seller">Best Seller</option>
                <option value="Novo">Novo</option>
                <option value="Oferta">Oferta</option>
              </select>
            </Field>
          </div>

          <Field label={`Fotos (${form.fotos.length}/6)`}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {form.fotos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  {form.fotos.map(url => (
                    <div key={url} style={{ position: "relative", aspectRatio: "1", background: P.linen, overflow: "hidden" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={() => removerFoto(url)} style={{ position: "absolute", top: 4, right: 4, background: P.red, color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              {form.fotos.length < 6 && (
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem", background: uploading ? P.muted : P.linen, border: `2px dashed ${P.sand}`, cursor: uploading ? "wait" : "pointer", fontFamily: T.sans, fontSize: "0.72rem", fontWeight: 500, color: P.primary, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const file = e.target.files?.[0]; if (file) uploadFoto(file); }} />
                  {uploading ? "A carregar..." : "📷  Adicionar foto"}
                </label>
              )}
            </div>
          </Field>

          <div style={{ display: "flex", gap: "1.25rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.8rem", color: P.earth }}>
              <input type="checkbox" checked={form.disponivel} onChange={e => f("disponivel", e.target.checked)} style={{ width: 18, height: 18, accentColor: P.primary }} />
              Disponível
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.8rem", color: P.earth }}>
              <input type="checkbox" checked={form.destaque} onChange={e => f("destaque", e.target.checked)} style={{ width: 18, height: 18, accentColor: P.primary }} />
              Em destaque
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button onClick={() => router.push("/painel")} style={{ flex: 1, padding: "0.9rem", background: P.linen, border: `1px solid ${P.sand}60`, color: P.earth, fontFamily: T.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={salvar} disabled={saving || !form.nome || !form.descricao} style={{ flex: 2, padding: "0.9rem", background: saving ? P.muted : P.primary, color: "#fff", border: "none", fontFamily: T.sans, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: saving ? "wait" : "pointer" }}>
              {saving ? "A guardar..." : "Guardar alterações"}
            </button>
          </div>

          <div style={{ borderTop: `1px solid ${P.sand}40`, paddingTop: "1rem" }}>
            {confirmDelete ? (
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: "0.75rem", background: P.linen, border: `1px solid ${P.sand}60`, color: P.earth, fontFamily: T.sans, fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={apagar} style={{ flex: 1, padding: "0.75rem", background: P.red, color: "#fff", border: "none", fontFamily: T.sans, fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
                  Confirmar apagar
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{ width: "100%", padding: "0.65rem", background: "none", border: `1px solid ${P.red}40`, color: P.red, fontFamily: T.sans, fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
                Apagar produto
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: T.sans, fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: P.muted, marginBottom: "0.4rem" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.75rem 0.875rem",
  border: `1px solid ${P.sand}80`, background: "#fff",
  fontFamily: T.sans, fontSize: "0.9rem", color: P.earth,
  outline: "none", boxSizing: "border-box", borderRadius: 0, WebkitAppearance: "none",
};
```

- [ ] **Step 2: Verificar TypeScript**

  ```bash
  cd /Users/edias/craftlab && npx tsc --noEmit
  ```

  Resultado esperado: sem erros

- [ ] **Step 3: Build final**

  ```bash
  cd /Users/edias/craftlab && npm run build 2>&1 | tail -20
  ```

  Resultado esperado: build limpo com as rotas `/painel/produto/novo` e `/painel/produto/[slug]` listadas

- [ ] **Step 4: Commit e push**

  ```bash
  git add src/app/\(admin\)/painel/produto/
  git commit -m "feat: add painel editar produto page com multiplas fotos e delete"
  git push
  ```
