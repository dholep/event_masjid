import { NextResponse } from "next/server";
import { getActiveEventConfig } from "@/lib/participants";

export async function GET() {
  const config = await getActiveEventConfig();
  return NextResponse.json(config);
}
