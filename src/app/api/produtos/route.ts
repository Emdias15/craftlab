import { NextResponse } from "next/server";
import { getProdutos } from "@/lib/produtos";

export const dynamic = "force-dynamic";

export function GET() {
  const produtos = getProdutos();
  return NextResponse.json(produtos);
}
