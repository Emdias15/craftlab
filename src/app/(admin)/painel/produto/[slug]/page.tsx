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

const CORES_PREDEFINIDAS = [
  { nome: "Vermelho", hex: "#e74c3c" },
  { nome: "Azul", hex: "#2E6B9E" },
  { nome: "Verde", hex: "#27ae60" },
  { nome: "Amarelo", hex: "#f1c40f" },
  { nome: "Laranja", hex: "#e67e22" },
  { nome: "Rosa", hex: "#ff69b4" },
  { nome: "Roxo", hex: "#8e44ad" },
  { nome: "Preto", hex: "#2c3e50" },
  { nome: "Branco", hex: "#ecf0f1" },
  { nome: "Cinzento", hex: "#95a5a6" },
  { nome: "Castanho", hex: "#8B6914" },
  { nome: "Multicolor", hex: "multicolor" },
];

type FormData = {
  nome: string; descricao: string; descricaoLonga: string;
  preco: number | string; categoria: string; tag: string;
  stock: number | string; destaque: boolean; disponivel: boolean; fotos: string[]; cores: string[];
};

export default function EditarProdutoPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<FormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [corCustom, setCorCustom] = useState("");

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
        disponivel: d.disponivel ?? true, fotos: d.fotos ?? [], cores: d.cores ?? [],
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

  const toggleCor = (cor: string) => {
    if (!form) return;
    const cores = form.cores.includes(cor)
      ? form.cores.filter(c => c !== cor)
      : [...form.cores, cor];
    f("cores", cores);
  };

  const adicionarCorCustom = () => {
    if (!form) return;
    const cor = corCustom.trim();
    if (!cor || form.cores.includes(cor)) return;
    f("cores", [...form.cores, cor]);
    setCorCustom("");
  };

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

          <Field label={`Cores disponíveis${form.cores.length > 0 ? ` (${form.cores.length} selecionadas)` : ""}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {CORES_PREDEFINIDAS.map(c => {
                  const ativa = form.cores.includes(c.nome);
                  return (
                    <button key={c.nome} type="button" onClick={() => toggleCor(c.nome)}
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.75rem", border: `1px solid ${ativa ? P.primary : P.sand}`, background: ativa ? P.linen : "#fff", cursor: "pointer", fontFamily: T.sans, fontSize: "0.72rem", color: ativa ? P.primary : P.muted, fontWeight: ativa ? 600 : 400, transition: "all 0.15s" }}>
                      {c.hex === "multicolor" ? (
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "linear-gradient(135deg,#e74c3c,#f1c40f,#27ae60,#2E6B9E,#8e44ad)", display: "inline-block", flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: c.hex, border: c.hex === "#ecf0f1" ? `1px solid ${P.sand}` : "none", display: "inline-block", flexShrink: 0 }} />
                      )}
                      {c.nome}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input value={corCustom} onChange={e => setCorCustom(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), adicionarCorCustom())} placeholder="Cor personalizada (ex: Azul Royal)..." style={{ ...inputStyle, flex: 1 }} />
                <button type="button" onClick={adicionarCorCustom} style={{ padding: "0 1rem", background: P.primary, color: "#fff", border: "none", fontFamily: T.sans, fontSize: "0.65rem", letterSpacing: "0.1em", cursor: "pointer", whiteSpace: "nowrap" }}>+ Adicionar</button>
              </div>
              {form.cores.filter(c => !CORES_PREDEFINIDAS.map(x => x.nome).includes(c)).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {form.cores.filter(c => !CORES_PREDEFINIDAS.map(x => x.nome).includes(c)).map(cor => (
                    <span key={cor} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.6rem", background: P.linen, border: `1px solid ${P.primary}`, fontFamily: T.sans, fontSize: "0.7rem", color: P.primary }}>
                      {cor}
                      <button type="button" onClick={() => toggleCor(cor)} style={{ background: "none", border: "none", color: P.muted, cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "0.9rem" }}>×</button>
                    </span>
                  ))}
                </div>
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
