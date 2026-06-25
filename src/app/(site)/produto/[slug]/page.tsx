"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
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

export default function ProdutoPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { addItem, setOpen } = useCart();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [adicionado, setAdicionado] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch(`/api/produtos/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setProduto(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "100svh", paddingTop: 96, background: P.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: T.sans, fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: P.muted }}>
          A carregar...
        </p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div style={{ minHeight: "100svh", paddingTop: 96, background: P.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
        <p style={{ fontFamily: T.serif, fontStyle: "italic", fontSize: "2.5rem", color: P.earth }}>Produto não encontrado.</p>
        <Link href="/loja" style={{ fontFamily: T.sans, fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: P.primary, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ArrowLeft size={14} /> Voltar à loja
        </Link>
      </div>
    );
  }

  const fotos = produto.fotos?.length ? produto.fotos : [];
  const fotoAtual = fotos[fotoIdx] ?? "";
  const esgotado = produto.stock === 0;
  const ultimas = produto.stock > 0 && produto.stock <= 3;

  const handleAdicionar = () => {
    addItem({ id: produto.slug, nome: produto.nome, preco: produto.preco, foto: fotoAtual }, qty);
    setAdicionado(true);
    setOpen(true);
    setTimeout(() => setAdicionado(false), 2000);
  };

  return (
    <div style={{ width: "100%", background: P.bg, paddingTop: 96 }}>

      {/* breadcrumb */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <button onClick={() => router.back()}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer", fontFamily: T.sans, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: P.muted, padding: 0 }}>
          <ArrowLeft size={13} /> Voltar
        </button>
      </div>

      {/* main grid */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2.5rem 1.5rem 7rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "start" }}>

        {/* ── GALERIA ─────────────────────────────── */}
        <div>
          {/* foto principal */}
          <div style={{ position: "relative", aspectRatio: "3/4", background: P.cream, overflow: "hidden", marginBottom: "1rem" }}>
            {fotoAtual ? (
              <img src={fotoAtual} alt={produto.nome}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: esgotado ? "grayscale(1) opacity(0.6)" : "none" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: T.sans, fontSize: "0.65rem", color: P.muted, letterSpacing: "0.15em" }}>Sem foto</span>
              </div>
            )}

            {/* badge */}
            {esgotado && (
              <span style={{ position: "absolute", top: 16, left: 16, background: P.earth, color: P.sand, fontFamily: T.sans, fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", padding: "0.35rem 0.875rem" }}>
                Esgotado
              </span>
            )}
            {!esgotado && produto.tag && (
              <span style={{ position: "absolute", top: 16, left: 16, background: P.primary, color: "#fff", fontFamily: T.sans, fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", padding: "0.35rem 0.875rem" }}>
                {produto.tag}
              </span>
            )}
            {ultimas && (
              <span style={{ position: "absolute", bottom: 16, left: 16, background: "#c0392b", color: "#fff", fontFamily: T.sans, fontSize: "0.52rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.3rem 0.7rem" }}>
                Últimas {produto.stock}!
              </span>
            )}

            {/* setas (só se >1 foto) */}
            {fotos.length > 1 && (
              <>
                <button onClick={() => setFotoIdx(i => (i - 1 + fotos.length) % fotos.length)}
                  style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(10,30,50,0.55)", border: "none", color: "#fff", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setFotoIdx(i => (i + 1) % fotos.length)}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(10,30,50,0.55)", border: "none", color: "#fff", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* thumbnails */}
          {fotos.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {fotos.map((f, i) => (
                <button key={i} onClick={() => setFotoIdx(i)}
                  style={{ width: 64, height: 64, padding: 0, border: i === fotoIdx ? `2px solid ${P.primary}` : `2px solid transparent`, cursor: "pointer", overflow: "hidden", background: P.cream, flexShrink: 0 }}>
                  <img src={f} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── DETALHES ────────────────────────────── */}
        <div style={{ paddingTop: "0.5rem" }}>

          {/* categoria */}
          <p style={{ fontFamily: T.sans, fontSize: "0.58rem", letterSpacing: "0.3em", textTransform: "uppercase", color: P.rope, marginBottom: "0.75rem" }}>
            {produto.categoria.replace("-", " ")}
          </p>

          {/* nome */}
          <h1 style={{ fontFamily: T.serif, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(2rem,4vw,3rem)", color: P.earth, lineHeight: 1.1, marginBottom: "0.5rem" }}>
            {produto.nome}
          </h1>

          {/* descrição curta */}
          <p style={{ fontFamily: T.sans, fontWeight: 300, fontSize: "0.9rem", color: P.muted, marginBottom: "2rem", lineHeight: 1.6 }}>
            {produto.descricao}
          </p>

          {/* preço */}
          <p style={{ fontFamily: T.sans, fontSize: "1.75rem", fontWeight: 500, color: esgotado ? P.muted : P.primary, marginBottom: "2rem" }}>
            {produto.preco.toFixed(2).replace(".", ",")} €
          </p>

          {/* quantidade */}
          {!esgotado && (
            <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "1rem", width: "fit-content" }}>
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: 44, height: 44, background: P.linen, border: `1px solid ${P.sand}80`, borderRight: "none", color: P.earth, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                −
              </button>
              <div style={{ width: 52, height: 44, background: "#fff", border: `1px solid ${P.sand}80`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.sans, fontSize: "0.9rem", fontWeight: 500, color: P.earth }}>
                {qty}
              </div>
              <button
                onClick={() => setQty(q => Math.min(produto.stock, q + 1))}
                style={{ width: 44, height: 44, background: P.linen, border: `1px solid ${P.sand}80`, borderLeft: "none", color: P.earth, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                +
              </button>
            </div>
          )}

          {/* botão */}
          {esgotado ? (
            <div style={{ background: P.linen, border: `1px solid ${P.sand}60`, padding: "1rem 1.5rem", display: "inline-block" }}>
              <p style={{ fontFamily: T.sans, fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: P.muted }}>
                Produto esgotado — em breve de volta
              </p>
            </div>
          ) : (
            <button onClick={handleAdicionar}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: adicionado ? "#27ae60" : P.earth, color: P.warmWhite, border: "none", padding: "1rem 2rem", fontFamily: T.sans, fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", transition: "background 0.3s", width: "100%", justifyContent: "center", maxWidth: 360 }}>
              <ShoppingBag size={15} />
              {adicionado ? "Adicionado!" : "Adicionar ao carrinho"}
            </button>
          )}

          {/* divider */}
          <div style={{ borderTop: `1px solid ${P.sand}50`, margin: "2.5rem 0" }} />

          {/* descrição longa */}
          {produto.descricaoLonga && (
            <div>
              <p style={{ fontFamily: T.sans, fontSize: "0.58rem", letterSpacing: "0.25em", textTransform: "uppercase", color: P.rope, marginBottom: "0.75rem" }}>
                Detalhes
              </p>
              <p style={{ fontFamily: T.sans, fontWeight: 300, fontSize: "0.88rem", color: P.earth, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {produto.descricaoLonga}
              </p>
            </div>
          )}

          {/* stock info */}
          {!esgotado && (
            <p style={{ fontFamily: T.sans, fontSize: "0.6rem", color: ultimas ? "#c0392b" : P.muted, marginTop: "1.5rem", letterSpacing: "0.1em" }}>
              {ultimas ? `Apenas ${produto.stock} em stock` : `${produto.stock} em stock`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
