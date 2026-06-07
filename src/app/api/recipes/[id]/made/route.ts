import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession();
    const email = session?.user?.email ?? null;

    if (!email) {
      return NextResponse.json(
        { error: 'You must be signed in to log recipe usage.' },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 },
      );
    }

    const { id } = await context.params;
    const recipeId = Number(id);

    if (Number.isNaN(recipeId)) {
      return NextResponse.json(
        { error: 'Invalid recipe id.' },
        { status: 400 },
      );
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found.' },
        { status: 404 },
      );
    }

    const usage = await prisma.recipeUsage.upsert({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId,
        },
      },
      update: {
        count: {
          increment: 1,
        },
        lastUsedAt: new Date(),
      },
      create: {
        userId: user.id,
        recipeId,
        count: 1,
        lastUsedAt: new Date(),
      },
      select: {
        count: true,
      },
    });

    return NextResponse.json({ count: usage.count }, { status: 200 });
  } catch (error) {
    console.error('Error logging recipe usage:', error);

    return NextResponse.json(
      { error: 'Failed to record recipe usage.' },
      { status: 500 },
    );
  }
}