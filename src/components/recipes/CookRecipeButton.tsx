'use client';

import { useState } from 'react';
import { Button } from 'react-bootstrap';
import swal from 'sweetalert';
import { loadTotals, saveTotals } from '@/components/dashboard/MacroTracker';

interface CookRecipeButtonProps {
  owner: string | null;
  title: string;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatGrams: number | null;
}

export default function CookRecipeButton({
  owner,
  title,
  proteinGrams,
  carbsGrams,
  fatGrams,
}: CookRecipeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCook = async () => {
    if (!owner || loading) return;
    setLoading(true);

    try {
      // Load today's stored totals and add whatever non-null macro values exist.
      const current = loadTotals(owner);
      const p = proteinGrams ?? 0;
      const c = carbsGrams   ?? 0;
      const f = fatGrams     ?? 0;
      const updated = {
        protein:  current.protein  + p,
        carbs:    current.carbs    + c,
        fat:      current.fat      + f,
        // Calories derived from macros: 4 kcal/g protein, 4 kcal/g carbs, 9 kcal/g fat.
        calories: current.calories + Math.round(4 * p + 4 * c + 9 * f),
      };
      saveTotals(owner, updated);

      const addedLines = [
        p > 0 && `Protein: +${p}g`,
        c > 0 && `Carbs: +${c}g`,
        f > 0 && `Fat: +${f}g`,
        (p > 0 || c > 0 || f > 0) && `Calories: +${Math.round(4 * p + 4 * c + 9 * f)}kcal`,
      ]
        .filter(Boolean)
        .join('\n');

      const message = addedLines
        ? `Added to your daily macros:\n${addedLines}`
        : 'No macro data available for this recipe.';

      await swal('Recipe Cooked!', message, 'success', { timer: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="lg"
        className="w-100 d-flex align-items-center justify-content-center gap-2"
        style={{
          fontWeight: 600,
          padding: '0.75rem 1.5rem',
          fontSize: '1.05rem',
          whiteSpace: 'normal',
          backgroundColor: 'var(--fern-green, #4a7c59)',
          border: 'none',
        }}
        onClick={handleCook}
        disabled={!owner || loading}
      >
        {loading ? '…' : 'Cook Recipe'}
      </Button>

      {!owner && (
        <small className="text-muted d-block text-center mt-2">
          Sign in to log macros
        </small>
      )}
    </>
  );
}
