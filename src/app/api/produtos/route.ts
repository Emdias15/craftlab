import { NextResponse } from "next/server";
import { getProdutos } from "@/lib/produtos";

export const dynamic = "force-dynamic";

export async function GET() {
  const produtos = await getProdutos();
  return NextResponse.json(produtos);
}
