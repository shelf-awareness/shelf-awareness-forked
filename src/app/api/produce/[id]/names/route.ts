import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");

  if (!owner) {
    return NextResponse.json({ error: "Missing owner" }, { status: 400 });
  }

  const produce = await prisma.produce.findMany({
    where: { owner },
  });

  return NextResponse.json(produce);
}
