'use server';

import { DietaryCategory } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { D } from 'react-router/dist/development/instrumentation-DvHY1sgY';
import { Prisma } from '@prisma/client';

// Minimal shape so TS knows about session.user.email
type SessionLike = {
  user?: { email?: string | null } | null;
} | null;

export type IngredientItemInput = {
  name: string;
  substitutes?: string[];
  quantityValue?: number | null;
  quantityUnit?: string | null;
  order?: number | null;
};

/** Type for creating/updating recipes. */
export type RecipeInput = {
  title: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  dietary?: DietaryCategory[];
  // 🔥 Only structured ingredients now
  ingredientItems?: IngredientItemInput[];
  instructions?: string;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  sourceUrl?: string;
};
type RecipeWithItems = Prisma.RecipeGetPayload<{
  include: {
    ingredientItems: true;
  };
}>;
type UsageRow = {
  recipeId: number;
  _sum: {
    count: number | null;
  };
};
type SharedRecipe = Prisma.RecipeGetPayload<{
  include: {
    ingredientItems: true;
    ratings: {
      select: { rating: true };
    };
  };
}>;

type TrendingRecipe = SharedRecipe & {
  cookCount: number;
  averageRating: number | null;
  ratingCount: number;
};

/**
 * Normalize ingredientItems:
 * - trim names/units
 * - coerce quantity to number|null
 * - drop empty names
 */
function normalizeIngredientItems(
  input: RecipeInput,
): IngredientItemInput[] {
  const rawItems = input.ingredientItems ?? [];

  return rawItems
    .map((item, index) => {
      const name = item.name.trim();
      const unit = item.quantityUnit?.trim() || null;

      let quantity: number | null = null;
      if (typeof item.quantityValue === 'number' && !Number.isNaN(item.quantityValue)) {
        quantity = item.quantityValue;
      }

      const rawSubs = (item as any).substitutes;

const substitutes: string[] = Array.isArray(rawSubs)
  ? rawSubs
  : typeof rawSubs === 'string'
    ? rawSubs.split('|') // encoded format from EditRecipeModal
    : [];

const cleanedSubs = substitutes
  .map((s) => s.trim())
  .filter(Boolean);

        return {
          name,
          substitutes,
          quantityValue: quantity,
          quantityUnit: unit,
          order: item.order ?? index,
          };
    })
    .filter((item) => item.name.length > 0);
}

/** Normalize/clean recipe scalar data (no ingredients here). */
function normalizeRecipeInput(
  input: RecipeInput,
  ownerEmail?: string | null,
) {
  const recipeData = {
    title: input.title.trim(),
    cuisine: input.cuisine.trim(),
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    dietary: (input.dietary ?? [])
      .map((s) => s.trim())
      .filter(Boolean),
    instructions: input.instructions?.trim() || null,
    servings: input.servings ?? null,
    prepMinutes: input.prepMinutes ?? null,
    cookMinutes: input.cookMinutes ?? null,
    proteinGrams: input.proteinGrams ?? null,
    carbsGrams: input.carbsGrams ?? null,
    fatGrams: input.fatGrams ?? null,
    sourceUrl: input.sourceUrl?.trim() || null,
    ...(ownerEmail ? { owner: ownerEmail } : {}),
  };

  if (!recipeData.title) throw new Error('Title required');
  if (!recipeData.cuisine) throw new Error('Cuisine required');

  // return both the scalar data and normalized items
  const ingredientItems = normalizeIngredientItems(input);

  return { recipeData, ingredientItems };
}

/** Fetch all recipes (latest first). */
export async function getRecipes() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      ingredientItems: {
        orderBy: { order: 'asc' },
      },
      ratings: {
        select: { rating: true },
      },
    },
  });

  return recipes.map((recipe: (typeof recipes)[number]) => {
    const ratingCount = recipe.ratings.length;

    const averageRating =
      ratingCount > 0
        ? recipe.ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratingCount
        : null;

    return {
      ...recipe,
      averageRating,
      ratingCount,
    };
  });
}

/** Fetch a single recipe by numeric ID. */
export async function getRecipeById(id: number) {
  if (!Number.isFinite(id)) return null;
  return prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredientItems: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

export async function getSubstitutions(owner: string) {
  return prisma.ingredientSubstitution.findMany({
    where: {
      OR: [{ owner }, { owner: null }],
    },
    select: { fromName: true, toName: true },
  });
}

/** Create a new recipe (any logged-in user can create). */
export async function createRecipe(input: RecipeInput) {
  const session = (await getServerSession()) as SessionLike;
  const email = session?.user?.email ?? null;
  if (!email) throw new Error('Unauthorized');

  const { recipeData, ingredientItems } = normalizeRecipeInput(
    input,
    email,
  );

const recipe = await prisma.recipe.create({
  data: {
    ...recipeData,
    ingredientItems:
      ingredientItems.length > 0
        ? {
            create: ingredientItems.map((item) => ({
            name: item.name,
            substitutes: Array.isArray(item.substitutes)
         ? (item.substitutes.join('|') || null)
         : (item.substitutes ?? null),
            quantityValue: item.quantityValue ?? null,
            quantityUnit: item.quantityUnit ?? null,
            order: item.order ?? 0,
          })),
          }
        : undefined,
  },
});


const subRows = ingredientItems.flatMap((item) => {
  const fromName = item.name.trim();
  const subs = item.substitutes ?? [];

  return subs.map((toName) => ({
    fromName,
    toName: toName.trim(),
    owner: email,
  }));
});

if (subRows.length > 0) {
  await prisma.ingredientSubstitution.createMany({
    data: subRows,
    skipDuplicates: true,
  });
}

return recipe;
}

/** Update an existing recipe (owner or admin@foo.com only). */
export async function updateRecipe(id: number, input: RecipeInput) {
  const session = (await getServerSession()) as SessionLike;
  const email = session?.user?.email ?? null;
  if (!email) throw new Error('Unauthorized');

  if (!Number.isFinite(id)) throw new Error('Invalid recipe id');

  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { owner: true },
  });

  if (!existing) throw new Error('Recipe not found');

  const ownerField = existing.owner as string | string[] | null;

  let owners: string[] = [];
  if (Array.isArray(ownerField)) {
    owners = ownerField;
  } else if (typeof ownerField === 'string') {
    owners = [ownerField];
  }

  const isAdmin = email === 'admin@foo.com';
  const isOwner = owners.includes(email);

  if (!isAdmin && !isOwner) {
    throw new Error('Not authorized to edit this recipe');
  }

  const { recipeData, ingredientItems } = normalizeRecipeInput(
    input,
    /* ownerEmail */ undefined,
  );

  // If ingredientItems is empty, we leave existing ingredient rows as-is.
  // If ingredientItems has items, we replace them completely.
  if (ingredientItems.length === 0) {
    return prisma.recipe.update({
      where: { id },
      data: recipeData,
    });
  }

  return prisma.recipe.update({
    where: { id },
    data: {
      ...recipeData,
      ingredientItems: {
        deleteMany: {}, // delete all existing rows for this recipe
        create: ingredientItems.map((item) => ({
          name: item.name,
          substitutes: Array.isArray(item.substitutes)
        ? (item.substitutes.join('|') || null)
        : (item.substitutes ?? null),
          quantityValue: item.quantityValue ?? null,
          quantityUnit: item.quantityUnit ?? null,
          order: item.order ?? 0,
        })),
      },
    },
  });
}
export async function getTrendingRecipes() {
  const sharedRecipes = await prisma.recipe.findMany({
  where: {
    owner: 'admin@foo.com',
  },
  include: {
    ingredientItems: true,
    ratings: {
      select: { rating: true },
    },
  },
});

  const sharedRecipeIds = sharedRecipes.map((recipe: SharedRecipe) => recipe.id);

  if (sharedRecipeIds.length === 0) {
    return [];
  }

  const usageRows: UsageRow[] = await prisma.recipeUsage.groupBy({
    by: ['recipeId'],
    where: {
      recipeId: {
        in: sharedRecipeIds,
      },
    },
    _sum: {
      count: true,
    },
    orderBy: {
      _sum: {
        count: 'desc',
      },
    },
    take: 3,
  });

  const usageMap = new Map<number, number>(
    usageRows.map((row) => [row.recipeId, row._sum.count ?? 0]),
  );

  const trendingRecipes = sharedRecipes
  .filter((recipe: SharedRecipe) => usageMap.has(recipe.id))
  .map((recipe: SharedRecipe) => {
    const ratingCount = recipe.ratings.length;

    const averageRating =
      ratingCount > 0
        ? recipe.ratings.reduce(
            (sum: number, r: { rating: number }) => sum + r.rating,
            0
          ) / ratingCount
        : null;

    return {
      ...recipe,
      cookCount: usageMap.get(recipe.id) ?? 0,
      averageRating,
      ratingCount,
    };
  })
  .sort((a: TrendingRecipe, b: TrendingRecipe) => (b.cookCount ?? 0) - (a.cookCount ?? 0));

  return trendingRecipes;
}
