"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Produto } from "@/lib/produtos";

const P = {
  primary:   "#2E6B9E",
  bg:        "#EEF5FB",
  linen:     "#E0EDF7",
  cream:     "#D0E5F5",
  earth:     "#0D253F",
  muted:     "#5E8DAA",
  rope:      "#7FADC8",
  sand:      "#A8CBE0",
  dark:      "#0A1E32",
  warmWhite: "#F0F7FD",
};
const T = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans:  "'Jost', system-ui, sans-serif",
};
const categorias = [
  { id: "todos",        label: "Todos" },
  { id: "anilhas",     label: "Anilhas Escutistas" },
  { id: "porta-chaves",label: "Porta-chaves" },
  { id: "combos",      label: "Combos & Packs" },
];

const COR_HEX: Record<string, string> = {
  Vermelho: "#e74c3c", Azul: "#2E6B9E", Verde: "#27ae60",
  Amarelo: "#f1c40f", Laranja: "#e67e22", Rosa: "#ff69b4",
  Roxo: "#8e44ad", Preto: "#2c3e50", Branco: "#ecf0f1",
  Cinzento: "#95a5a6", Castanho: "#8B6914", Multicolor: "multicolor",
};

export default function LojaPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [catAtiva, setCatAtiva] = useState("todos");
  const [corAtiva, setCorAtiva] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetch("/api/produtos")
      .then(r => r.json())
      .then(data => { setProdutos(data); setLoading(false); })
      .catch(() => { setLoading(false); setErro(true); });
  }, []);

  const coresDisponiveis = Array.from(
    new Set(produtos.flatMap(p => p.cores ?? []))
  ).sort();

  const filtrados = produtos
    .filter(p => catAtiva === "todos" || p.categoria === catAtiva)
    .filter(p => !corAtiva || (p.cores ?? []).includes(corAtiva));

  const fotoUrl = (p: Produto) =>
    p.fotos?.[0]?.startsWith("http") ? p.fotos[0] : p.fotos?.[0] ?? "";

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>

      {/* ── HEADER ─────────────────────────────────── */}
      <section style={{ paddingTop: 96, background: P.dark, minHeight: 280, display: "flex", alignItems: "center", position: "relative" }}>
        <img
          src="https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=1920&auto=format&fit=crop"
          alt="Loja"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.15) saturate(0.4)" }}
        />
        <div style={{ position: "relative", zIndex: 5, maxWidth: 1280, margin: "0 auto", padding: "3.5rem 1.5rem" }}>
          <div className="ornament-line" style={{ color: `${P.rope}70`, marginBottom: "1.5rem", maxWidth: 180 }}>Coleção</div>
          <h1 style={{ fontFamily: T.serif, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(2.8rem,5vw,4.5rem)", color: P.warmWhite, lineHeight: 1.1 }}>
            A Nossa Loja.
          </h1>
        </div>
      </section>

      {/* ── FILTROS ────────────────────────────────── */}
      <div style={{ background: P.linen, borderBottom: `1px solid ${P.sand}60`, position: "sticky", top: 96, zIndex: 30 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "flex", overflowX: "auto" }}>
          {categorias.map(c => (
            <button key={c.id} onClick={() => setCatAtiva(c.id)}
              style={{
                fontFamily: T.sans, fontSize: "0.62rem", fontWeight: 500,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: catAtiva === c.id ? P.primary : P.muted,
                background: "none", border: "none",
                borderBottom: catAtiva === c.id ? `2px solid ${P.primary}` : "2px solid transparent",
                padding: "1.25rem 1.75rem", cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}>
              {c.label}
            </button>
          ))}
        </div>
        {coresDisponiveis.length > 0 && (
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0.65rem 1.5rem", borderTop: `1px solid ${P.sand}40`, display: "flex", alignItems: "center", gap: "0.5rem", overflowX: "auto" }}>
            <span style={{ fontFamily: T.sans, fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: P.muted, whiteSpace: "nowrap", marginRight: "0.25rem" }}>Cor:</span>
            <button onClick={() => setCorAtiva(null)}
              style={{ fontFamily: T.sans, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.3rem 0.75rem", border: `1px solid ${!corAtiva ? P.primary : P.sand}`, background: !corAtiva ? P.primary : "transparent", color: !corAtiva ? "#fff" : P.muted, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
              Todas
            </button>
            {coresDisponiveis.map(cor => {
              const hex = COR_HEX[cor];
              const ativa = corAtiva === cor;
              return (
                <button key={cor} onClick={() => setCorAtiva(ativa ? null : cor)}
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: T.sans, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.3rem 0.75rem", border: `1px solid ${ativa ? P.primary : P.sand}`, background: ativa ? P.linen : "transparent", color: ativa ? P.primary : P.muted, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
                  {hex === "multicolor" ? (
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg,#e74c3c,#f1c40f,#27ae60,#2E6B9E,#8e44ad)", display: "inline-block", flexShrink: 0 }} />
                  ) : hex ? (
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: hex, border: hex === "#ecf0f1" ? `1px solid ${P.sand}` : "none", display: "inline-block", flexShrink: 0 }} />
                  ) : null}
                  {cor}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── PRODUTOS ───────────────────────────────── */}
      <section style={{ background: P.bg, padding: "5rem 0 7rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>

          {loading ? (
            <div style={{ textAlign: "center", padding: "5rem 0" }}>
              <p style={{ fontFamily: T.sans, fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: P.muted }}>
                A carregar produtos...
              </p>
            </div>
          ) : erro ? (
            <div style={{ textAlign: "center", padding: "5rem 0" }}>
              <p style={{ fontFamily: T.serif, fontStyle: "italic", fontSize: "2rem", color: P.earth, marginBottom: "0.75rem" }}>
                Não foi possível carregar os produtos.
              </p>
              <button onClick={() => { setErro(false); setLoading(true); fetch("/api/produtos").then(r => r.json()).then(data => { setProdutos(data); setLoading(false); }).catch(() => { setLoading(false); setErro(true); }); }} style={{ fontFamily: T.sans, fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: P.primary, background: "none", border: `1px solid ${P.primary}`, padding: "0.6rem 1.5rem", cursor: "pointer" }}>
                Tentar novamente
              </button>
            </div>
          ) : filtrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 0" }}>
              <p style={{ fontFamily: T.serif, fontStyle: "italic", fontSize: "2rem", color: P.earth, marginBottom: "0.75rem" }}>
                Sem produtos nesta categoria.
              </p>
              <p style={{ fontFamily: T.sans, fontWeight: 300, fontSize: "0.85rem", color: P.muted }}>
                Adiciona produtos no painel em <code>/keystatic</code>.
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: T.sans, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: P.muted, marginBottom: "2.5rem" }}>
                {filtrados.length} {filtrados.length === 1 ? "produto" : "produtos"}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "2rem" }}>
                {filtrados.map(p => {
                  const foto = fotoUrl(p);
                  const esgotado = p.stock === 0;
                  const ultimas = p.stock > 0 && p.stock <= 3;
                  return (
                    <div key={p.slug} className="product-card">
                      <Link href={`/produto/${p.slug}`} style={{ display: "block", textDecoration: "none" }}>
                        <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", background: P.cream, marginBottom: "1.1rem" }}>
                          {foto && (
                            <img src={foto} alt={p.nome}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: esgotado ? "grayscale(1) opacity(0.55)" : "none", transition: "filter 0.3s" }}
                            />
                          )}
                          {esgotado ? (
                            <span style={{ position: "absolute", top: 12, left: 12, background: P.earth, color: P.sand, fontFamily: T.sans, fontSize: "0.52rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", padding: "0.3rem 0.75rem" }}>
                              Esgotado
                            </span>
                          ) : p.tag ? (
                            <span style={{ position: "absolute", top: 12, left: 12, background: P.primary, color: "#fff", fontFamily: T.sans, fontSize: "0.52rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", padding: "0.3rem 0.75rem" }}>
                              {p.tag}
                            </span>
                          ) : null}
                          {ultimas && (
                            <span style={{ position: "absolute", bottom: 12, left: 12, background: "#c0392b", color: "#fff", fontFamily: T.sans, fontSize: "0.5rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.25rem 0.6rem" }}>
                              Últimas {p.stock}!
                            </span>
                          )}
                        </div>
                      </Link>
                      <p style={{ fontFamily: T.sans, fontSize: "0.88rem", fontWeight: 500, color: esgotado ? P.muted : P.earth }}>{p.nome}</p>
                      <p style={{ fontFamily: T.sans, fontSize: "0.75rem", color: P.rope, marginTop: "0.2rem", fontWeight: 300, fontStyle: "italic" }}>{p.descricao}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.75rem" }}>
                        <p style={{ fontFamily: T.sans, fontSize: "0.88rem", color: esgotado ? P.muted : P.primary, fontWeight: 500 }}>
                          {p.preco.toFixed(2).replace(".", ",")} €
                        </p>
                        {esgotado ? (
                          <span style={{ fontFamily: T.sans, fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: P.muted }}>Esgotado</span>
                        ) : (
                          <button
                            onClick={() => addItem({ id: p.slug, nome: p.nome, preco: p.preco, foto })}
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: P.earth, color: P.warmWhite, border: "none", padding: "0.5rem 0.875rem", fontFamily: T.sans, fontSize: "0.55rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}
                          >
                            <ShoppingBag size={12} /> Adicionar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── PERSONALIZAÇÃO BANNER ──────────────────── */}
      <section style={{ background: P.primary, padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "2rem" }}>
          <div>
            <p style={{ fontFamily: T.sans, fontSize: "0.58rem", letterSpacing: "0.3em", textTransform: "uppercase", color: `${P.warmWhite}66`, marginBottom: "0.75rem" }}>Exclusivo</p>
            <h2 style={{ fontFamily: T.serif, fontStyle: "italic", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 400, color: P.warmWhite, lineHeight: 1.15 }}>
              Não encontraste o que procuras?
            </h2>
            <p style={{ fontFamily: T.sans, fontWeight: 300, color: `${P.warmWhite}80`, fontSize: "0.88rem", marginTop: "0.75rem" }}>
              Fazemos peças personalizadas — cores, tamanhos e símbolos do teu grupo.
            </p>
          </div>
          <Link href="/contacto" style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "0.5rem", background: P.warmWhite, color: P.primary, padding: "0.9rem 2rem", fontFamily: T.sans, fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none" }}>
            Falar Connosco <ArrowRight size={13} />
          </Link>
        </div>
      </section>

    </div>
  );
}
