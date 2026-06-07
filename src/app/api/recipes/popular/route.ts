import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type RecipeWithItems = Prisma.RecipeGetPayload<{
  include: {
    ingredientItems: true;
  };
}>;
type UsageRow = Prisma.RecipeUsageGetPayload<{
  select: {
    recipeId: true;
    count: true;
  };
}>;

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession();
    const email = session?.user?.email ?? null;

    if (!email) {
      return NextResponse.json(
        { error: 'You must be signed in to view personal popular recipes.' },
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

    const allRecipes: RecipeWithItems[] = await prisma.recipe.findMany({
      include: {
        ingredientItems: true,
      },
    });
    

    const usageRows: UsageRow[] = await prisma.recipeUsage.findMany({
      where: {
        userId: user.id,
      },
      select: {
        recipeId: true,
        count: true,
      },
    });

    const usageMap = new Map<number, number>(
      usageRows.map((usage) => [usage.recipeId, usage.count]),
    );

    const result = allRecipes
      .map((recipe) => ({
        ...recipe,
        cookCount: usageMap.get(recipe.id) ?? 0,
      }))
      .sort((a, b) => {
        if (b.cookCount !== a.cookCount) {
          return b.cookCount - a.cookCount;
        }

        return a.title.localeCompare(b.title);
      });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching personal popular recipes:', error);

    return NextResponse.json(
      { error: 'Failed to fetch personal popular recipes.' },
      { status: 500 },
    );
  }
}