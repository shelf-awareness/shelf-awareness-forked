/**
 * Utilities for matching pantry expiration data with recipes.
 * Implements issue-166: Match recipes with pantry items that are expiring soon.
 */

export const EXPIRING_SOON_DAYS = 7;

/**
 * Returns a Set of lowercased ingredient names that are expiring within
 * `daysThreshold` days.
 */
export function getExpiringItemNames(
  produce: { name: string; expiration?: string | Date | null }[],
  daysThreshold = EXPIRING_SOON_DAYS,
): Set<string> {
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() + daysThreshold);

  const expiringNames = new Set<string>();
  for (const item of produce) {
    if (item.expiration) {
      const expDate = new Date(item.expiration);
      if (expDate <= threshold) {
        expiringNames.add(item.name.toLowerCase());
      }
    }
  }
  return expiringNames;
}

/**
 * Returns recipes that include at least one ingredient matching an expiring
 * pantry item. Deduplicates by recipe id.
 */
export function matchRecipesWithExpiringPantry(
  recipes: any[],
  expiringNames: Set<string>,
): any[] {
  if (expiringNames.size === 0) return [];

  const seen = new Set<number>();
  const result: any[] = [];

  for (const recipe of recipes) {
    if (seen.has(recipe.id)) continue;
    const items: { name: string }[] = recipe.ingredientItems ?? [];
    const hasExpiring = items.some((i) =>
      expiringNames.has(i.name.toLowerCase()),
    );
    if (hasExpiring) {
      seen.add(recipe.id);
      result.push(recipe);
    }
  }

  return result;
}
