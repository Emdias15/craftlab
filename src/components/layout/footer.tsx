"use client";

import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const P = {
  primary:   "#2E6B9E",
  dark:      "#0A1E32",
  earth:     "#0D253F",
  warmWhite: "#F0F7FD",
  sand:      "#A8CBE0",
  muted:     "#5E8DAA",
  rope:      "#7FADC8",
};
const T = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans:  "'Jost', system-ui, sans-serif",
};

export function Footer() {
  return (
    <footer style={{ background: P.dark, color: P.sand, paddingTop: "5rem", paddingBottom: "2.5rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "3rem", paddingBottom: "4rem", borderBottom: `1px solid ${P.muted}25` }}>

          {/* Brand */}
          <div style={{ gridColumn: "span 2" }}>
            <p style={{ fontFamily: T.serif, fontSize: "3rem", fontStyle: "italic", color: P.warmWhite, lineHeight: 1, marginBottom: "0.25rem" }}>
              CraftLab<span style={{ color: P.primary }}>.</span>ed
            </p>
            <p style={{ fontFamily: T.sans, fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", color: `${P.sand}40`, marginBottom: "1.5rem" }}>
              Arte em Corda · Portugal
            </p>
            <p style={{ fontFamily: T.sans, fontWeight: 300, fontSize: "0.88rem", color: `${P.sand}65`, maxWidth: 260, lineHeight: 1.8, marginBottom: "1.5rem" }}>
              Peças artesanais em macramé e corda natural, feitas com intenção e cuidado.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={13} style={{ color: P.rope }} />
                <span style={{ fontFamily: T.sans, fontSize: "0.75rem", color: `${P.sand}50` }}>Portugal, com envio nacional</span>
              </div>
              <a href="mailto:hello@craftlab.ed" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                <Mail size={13} style={{ color: P.rope }} />
                <span style={{ fontFamily: T.sans, fontSize: "0.75rem", color: `${P.sand}50` }}>hello@craftlab.ed</span>
              </a>
            </div>
          </div>

          {/* Loja */}
          <div>
            <p style={{ fontFamily: T.sans, fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", color: P.rope, marginBottom: "1.25rem" }}>Loja</p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {["Todos os Produtos", "Cestos", "Decoração", "Porta-vasos", "Bolsas"].map(l => (
                <li key={l}><Link href="/loja" style={{ fontFamily: T.sans, fontSize: "0.82rem", fontWeight: 300, color: `${P.sand}50`, textDecoration: "none" }}>{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p style={{ fontFamily: T.sans, fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", color: P.rope, marginBottom: "1.25rem" }}>Informação</p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[{l:"Sobre Nós",h:"/sobre"},{l:"O Processo",h:"/sobre"},{l:"Contacto",h:"/contacto"},{l:"Envios",h:"/envios"},{l:"Termos",h:"/termos"}].map(({l,h}) => (
                <li key={l}><Link href={h} style={{ fontFamily: T.sans, fontSize: "0.82rem", fontWeight: 300, color: `${P.sand}50`, textDecoration: "none" }}>{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Redes */}
          <div>
            <p style={{ fontFamily: T.sans, fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", color: P.rope, marginBottom: "1.25rem" }}>Redes</p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[{l:"Instagram",h:"#"},{l:"Pinterest",h:"#"},{l:"TikTok",h:"#"}].map(({l,h}) => (
                <li key={l}><a href={h} style={{ fontFamily: T.sans, fontSize: "0.82rem", fontWeight: 300, color: `${P.sand}50`, textDecoration: "none" }}>{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ paddingTop: "2rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
          <p style={{ fontFamily: T.sans, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: `${P.sand}25` }}>
            &copy; {new Date().getFullYear()} CraftLab.ed — Todos os direitos reservados
          </p>
          <p style={{ fontFamily: T.sans, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: `${P.sand}25` }}>
            Feito com ♥ em Portugal
          </p>
        </div>
      </div>
    </footer>
  );
}
