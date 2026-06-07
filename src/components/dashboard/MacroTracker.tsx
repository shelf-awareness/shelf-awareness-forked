'use client';

import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { BarChartFill } from 'react-bootstrap-icons';

export interface MacroTotals {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

interface StoredData {
  dateKey: string;
  totals: MacroTotals;
}

const ZERO: MacroTotals = { protein: 0, carbs: 0, fat: 0, calories: 0 };

// Shared storage key — must match what CookRecipeButton uses.
export function storageKey(email: string) {
  return `macroTracker:${email}`;
}

// Local date string e.g. "2026-03-26" — uses local time, not UTC.
function localDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadTotals(email: string): MacroTotals {
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return ZERO;
    const parsed: StoredData = JSON.parse(raw);
    if (parsed.dateKey !== localDateKey()) return ZERO;
    return parsed.totals;
  } catch {
    return ZERO;
  }
}

export function saveTotals(email: string, totals: MacroTotals) {
  try {
    const data: StoredData = { dateKey: localDateKey(), totals };
    localStorage.setItem(storageKey(email), JSON.stringify(data));
  } catch {
    // Fail silently if localStorage is unavailable.
  }
}

interface MacroTrackerProps {
  ownerEmail: string;
  proteinGoal: number | null;
  carbsGoal: number | null;
  fatGoal: number | null;
  caloriesGoal: number | null;
}

export default function MacroTracker({
  ownerEmail,
  proteinGoal,
  carbsGoal,
  fatGoal,
  caloriesGoal,
}: MacroTrackerProps) {
  const [totals, setTotals] = useState<MacroTotals>(ZERO);
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount and whenever the window regains focus
  // (so navigating back from the recipe page reflects any cooked macros).
  useEffect(() => {
    const sync = () => setTotals(loadTotals(ownerEmail));
    sync();
    setMounted(true);
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, [ownerEmail]);

  const handleReset = () => {
    saveTotals(ownerEmail, ZERO);
    setTotals(ZERO);
  };

  // Don't render until client has mounted to avoid hydration mismatch.
  if (!mounted) return null;

  const macros = [
    { label: 'Protein',  value: totals.protein,  goal: proteinGoal,  unit: 'g'    },
    { label: 'Carbs',    value: totals.carbs,    goal: carbsGoal,    unit: 'g'    },
    { label: 'Fat',      value: totals.fat,      goal: fatGoal,      unit: 'g'    },
    { label: 'Calories', value: totals.calories, goal: caloriesGoal, unit: 'kcal' },
  ];

  return (
    <div className="d-flex justify-content-center mb-4">
      <Card className="shadow-sm border-light" style={{ width: 'fit-content' }}>
        <Card.Body className="py-2 px-3">
          <div className="d-flex gap-3 align-items-center flex-wrap">

            {/* Icon + Title + subtitle */}
            <div className="d-flex flex-column align-items-center" style={{ minWidth: '3.5rem' }}>
              <div className="d-flex align-items-center">
                <BarChartFill className="me-2 text-primary" size={16} />
                <span className="fw-semibold" style={{ fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                  Today&apos;s Macro Tracker
                </span>
              </div>
              <span className="text-muted" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                (Today&apos;s Macros) / (Goal Macros)
              </span>
            </div>

            {/* Macro values */}
            {macros.map(({ label, value, goal, unit }) => {
              const met = goal !== null && value >= goal;
              return (
                <div key={label} className="d-flex flex-column align-items-center" style={{ minWidth: '3.5rem' }}>
                  <span
                    className="fw-semibold"
                    style={{
                      fontSize: '0.88rem',
                      whiteSpace: 'nowrap',
                      color: met ? '#198754' : 'inherit',
                    }}
                  >
                    {value}{unit} / {goal !== null ? `${goal}${unit}` : '—'}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>{label}</span>
                </div>
              );
            })}

            {/* Reset button */}
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
            >
              Reset
            </button>

          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
