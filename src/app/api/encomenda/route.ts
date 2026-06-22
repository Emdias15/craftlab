import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const numero = process.env.WHATSAPP_NUMBER;
  if (!numero) {
    return NextResponse.json({ error: "WhatsApp não configurado" }, { status: 500 });
  }

  const body = await req.json();
  const { nome, email, telefone, morada, notas, itens } = body as {
    nome: string;
    email: string;
    telefone: string;
    morada: string;
    notas: string;
    itens: Array<{ nome: string; qty: number; preco: number }>;
  };

  const linhasItens = itens
    .map(i => `  • ${i.nome} x${i.qty} — ${(i.preco * i.qty).toFixed(2).replace(".", ",")} €`)
    .join("\n");

  const total = itens.reduce((s, i) => s + i.preco * i.qty, 0);

  const msg = [
    "* Nova Encomenda - CraftLab.ed *",
    "",
    `👤 *Nome:* ${nome}`,
    `📧 *Email:* ${email}`,
    `📞 *Telefone:* ${telefone || "—"}`,
    `🏠 *Morada:* ${morada || "—"}`,
    "",
    "🛒 *Produtos:*",
    linhasItens,
    "",
    `💰 *Total:* ${total.toFixed(2).replace(".", ",")} €`,
    "",
    notas ? `📝 *Notas:* ${notas}` : "",
    "",
    "Responde aqui para confirmar ou recusar a encomenda.",
  ]
    .filter(l => l !== undefined)
    .join("\n");

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;

  return NextResponse.json({ url });
}
