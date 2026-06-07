export function convertUnits(
  quantity: number,
  fromUnit: string | null,
  toUnit: string | null
): number {
  if (!fromUnit || !toUnit || fromUnit === toUnit) return quantity;

  const mass = new Set(['kg', 'g', 'lb', 'oz']);
  const volume = new Set(['ml', 'l', 'cup', 'tbsp', 'tsp']);
  const count = new Set(['pcs', 'piece']);
  const other = new Set(['Other']);

  const sameCategory =
    (mass.has(fromUnit) && mass.has(toUnit)) ||
    (volume.has(fromUnit) && volume.has(toUnit)) ||
    (count.has(fromUnit) && count.has(toUnit)) ||
    (other.has(fromUnit) && other.has(toUnit));

  // If units are incompatible, just return the original quantity
  if (!sameCategory) {
    console.warn(`Incompatible units: ${fromUnit} -> ${toUnit}. Returning original quantity.`);
    return quantity;
  }

  // Mass conversions
  if (fromUnit === 'kg') {
    if (toUnit === 'g') return quantity * 1000;
    if (toUnit === 'lb') return quantity * 2.20462262185;
    if (toUnit === 'oz') return quantity * 35.27396195;
  }
  if (fromUnit === 'g') {
    if (toUnit === 'kg') return quantity / 1000;
    if (toUnit === 'lb') return quantity / 453.59237;
    if (toUnit === 'oz') return quantity / 28.349523125;
  }
  if (fromUnit === 'lb') {
    if (toUnit === 'kg') return quantity / 2.20462262185;
    if (toUnit === 'g') return quantity * 453.59237;
    if (toUnit === 'oz') return quantity * 16;
  }
  if (fromUnit === 'oz') {
    if (toUnit === 'kg') return quantity / 35.27396195;
    if (toUnit === 'g') return quantity * 28.349523125;
    if (toUnit === 'lb') return quantity / 16;
  }

  // Volume conversions
  if (fromUnit === 'ml' && toUnit === 'l') return quantity / 1000;
  if (fromUnit === 'l' && toUnit === 'ml') return quantity * 1000;

  // Countable or other units — no conversion
  if (fromUnit === 'pcs' || fromUnit === 'piece' || fromUnit === 'Other') {
    return quantity;
  }

  console.warn(`Conversion not implemented: ${fromUnit} -> ${toUnit}. Returning original quantity.`);
  return quantity;
}
