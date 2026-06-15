"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";

const P = {
  primary:   "#2E6B9E",
  primaryH:  "#1E5480",
  earth:     "#0D253F",
  dark:      "#0A1E32",
  bg:        "#EEF5FB",
  warmWhite: "#F0F7FD",
  sand:      "#A8CBE0",
  muted:     "#5E8DAA",
  rope:      "#7FADC8",
};
const T = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans:  "'Jost', system-ui, sans-serif",
};

const links = [
  { href: "/loja",     label: "Loja" },
  { href: "/sobre",    label: "O Processo" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 80,
        background: scrolled ? "rgba(238,245,251,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${P.sand}60` : "none",
        transition: "all 0.4s ease",
        display: "flex", alignItems: "center",
      }}>
        <div style={{ maxWidth: 1280, width: "100%", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>

          {/* Left nav */}
          <nav style={{ display: "flex", gap: "2.5rem" }}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} style={{ fontFamily: T.sans, fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: scrolled ? P.earth : "rgba(240,247,253,0.85)", textDecoration: "none", transition: "color 0.2s" }}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Link href="/" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1, textDecoration: "none" }}>
            <span style={{ fontFamily: T.serif, fontSize: "2rem", fontWeight: 400, letterSpacing: "-0.01em", color: scrolled ? P.earth : P.warmWhite, transition: "color 0.3s" }}>
              CraftLab<span style={{ color: P.primary }}>.</span>ed
            </span>
            <span style={{ fontFamily: T.sans, fontSize: "0.48rem", letterSpacing: "0.3em", textTransform: "uppercase", color: scrolled ? P.muted : "rgba(240,247,253,0.45)", marginTop: 2, transition: "color 0.3s" }}>
              Arte em Corda
            </span>
          </Link>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/loja" style={{ position: "relative", color: scrolled ? P.earth : P.warmWhite, transition: "color 0.3s", textDecoration: "none" }} aria-label="Carrinho">
              <ShoppingBag size={19} />
              <span style={{ position: "absolute", top: -8, right: -8, width: 16, height: 16, background: P.primary, color: "#fff", borderRadius: "50%", fontSize: "0.55rem", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.sans, fontWeight: 600 }}>0</span>
            </Link>
            <button onClick={() => setOpen(v => !v)} style={{ padding: 4, background: "none", border: "none", cursor: "pointer", color: scrolled ? P.earth : P.warmWhite, transition: "color 0.3s" }} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 40,
        background: P.bg,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2.5rem",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
            style={{ fontFamily: T.serif, fontSize: "3rem", fontStyle: "italic", color: P.earth, textDecoration: "none" }}>
            {l.label}
          </Link>
        ))}
        <p style={{ fontFamily: T.sans, fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: P.muted, position: "absolute", bottom: "2.5rem" }}>
          CraftLab.ed
        </p>
      </div>
    </>
  );
}
