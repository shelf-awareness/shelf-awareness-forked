/**
 * Check if a produce item is below its restock threshold.
 * @param quantity Current quantity in stock
 * @param trigger "empty" | "half" | "custom"
 * @param customThreshold Optional custom threshold (same unit as quantity)
 * @param desiredQuantity Optional maximum or full stock quantity (needed for "half")
 */
export function isBelowThreshold(
  quantity: number,
  trigger: string,
  customThreshold?: number,
  desiredQuantity?: number,
): boolean {
  switch (trigger) {
    case 'empty':
      return quantity <= 0;
    case 'half':
      if (!desiredQuantity) {
        console.warn('Desired quantity is missing for half trigger, assuming 1');
        return quantity <= 0.5;
      }
      return quantity <= desiredQuantity / 2;
    case 'custom':
      if (customThreshold === undefined) return false;
      return quantity <= customThreshold;
    default:
      return false;
  }
}
