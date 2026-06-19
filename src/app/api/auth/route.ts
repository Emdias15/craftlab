import { NextRequest, NextResponse } from "next/server";

const COOKIE  = "craftlab_admin";
const MAX_AGE = 60 * 60 * 8;

async function makeToken(password: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(password));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  const { password } = await req.json() as { password: string };

  const expected = process.env.ADMIN_PASSWORD ?? "";

  // Comparação segura — mesmo tempo independentemente da password
  const a = new TextEncoder().encode(password.padEnd(256));
  const b = new TextEncoder().encode(expected.padEnd(256));
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  const match = diff === 0 && password.length === expected.length;

  if (!match) {
    await new Promise(r => setTimeout(r, 600));
    return NextResponse.json({ error: "Password incorreta." }, { status: 401 });
  }

  const secret = process.env.ADMIN_SECRET ?? "";
  const token  = await makeToken(password, secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
