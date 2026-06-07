import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// SAVE a recipe
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const recipeIdRaw = body?.recipeId;
    const owner = body?.owner as string | undefined;

    const recipeId = Number(recipeIdRaw);

    if (!owner || !recipeId || Number.isNaN(recipeId)) {
      return NextResponse.json(
        { error: "Missing recipeId or owner" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: owner },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    // ✅ ACTUALLY SAVE IT (idempotent)
    await prisma.savedRecipe.upsert({
      where: {
        userId_recipeId: { userId: user.id, recipeId },
      },
      update: {}, // already saved
      create: {
        userId: user.id,
        recipeId,
      },
    });

    // Return updated saved recipes list (so your UI can refresh easily)
    const saved = await prisma.savedRecipe.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        recipe: {
          include: { ingredientItems: true },
        },
      },
    });

    return NextResponse.json(saved.map((s: { recipe: any }) => s.recipe), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to save recipe" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

// LIST saved recipes
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");

    if (!owner) {
      return NextResponse.json(
        { error: "Missing owner" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: owner },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
    }

    const saved = await prisma.savedRecipe.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        recipe: {
          include: { ingredientItems: true }, // ✅ so ingredients show
        },
      },
    });

    return NextResponse.json(saved.map((s: { recipe: any }) => s.recipe), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load saved recipes" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

// REMOVE a saved recipe
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const recipeId = Number(searchParams.get("recipeId"));

    if (!owner || !recipeId || Number.isNaN(recipeId)) {
      return NextResponse.json(
        { error: "Missing owner or recipeId" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: owner },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    await prisma.savedRecipe.delete({
      where: { userId_recipeId: { userId: user.id, recipeId } },
    });

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to remove saved recipe" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
