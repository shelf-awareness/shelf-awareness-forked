'use client';

import React, { useState, useCallback } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import '../../styles/buttons.css';

export type MissingItem = {
  name: string;
  quantity?: number | null;
  unit?: string | null;
};

type Props = {
  // now expects full ingredient items, not just strings
  missingItems: MissingItem[];
};

// Move these outside the component
const mainNameOf = (name: string) => name.split('/')[0].trim();

const keyFor = (item: MissingItem) => mainNameOf(item.name).toLowerCase();

const formatItemLabel = (item: MissingItem) => {
  const parts: string[] = [];
  if (item.quantity != null) {
    parts.push(
      Number.isInteger(item.quantity)
        ? String(item.quantity)
        : String(item.quantity),
    );
  }
  if (item.unit) {
    parts.push(item.unit);
  }
  parts.push(mainNameOf(item.name));
  return parts.join(' ');
};

export default function AddToShoppingList({ missingItems }: Props) {
  // keyed by item name (lowercased)
  const [adding, setAdding] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [addingAll, setAddingAll] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  

  const addOne = useCallback(async (item: MissingItem) => {
    const key = keyFor(item);
    setAdding((s) => ({ ...s, [key]: true }));
    setMessage(null);

    try {
      const res = await fetch('/api/shopping-list-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mainNameOf(item.name),
          quantity: item.quantity ?? null,
          unit: item.unit ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to add');

      setAdded((s) => ({ ...s, [key]: true }));
      setMessage(`Added "${formatItemLabel(item)}" to your shopping list.`);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? 'Failed to add item');
    } finally {
      setAdding((s) => ({ ...s, [key]: false }));
    }
  }, []);

  const addAll = useCallback(async () => {
    const itemsToAdd = missingItems.filter((i) => !added[keyFor(i)]);

    if (!itemsToAdd.length) {
      setMessage('All missing items are already added.');
      return;
    }

    setAddingAll(true);
    setMessage(null);

    try {
      const res = await fetch('/api/shopping-list-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToAdd.map((i) => ({
            name: mainNameOf(i.name),
            quantity: i.quantity ?? null,
            unit: i.unit ?? null,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to add');

      const createdNames: string[] = (data.created ?? []).map(
        (c: any) => c.name as string,
      );

      const updates: Record<string, boolean> = {};
      createdNames.forEach((n) => {
        updates[n.toLowerCase()] = true;
      });

      setAdded((s) => ({ ...s, ...updates }));
      setMessage(`Added ${createdNames.length} item(s) to your shopping list.`);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? 'Failed to add items');
    } finally {
      setAddingAll(false);
    }
  }, [missingItems, added]);

  const renderButtonLabel = (item: MissingItem) => {
    const key = keyFor(item);
    if (adding[key]) return <Spinner animation="border" size="sm" />;
    if (added[key]) return 'Added ✓';
    return `Add ${formatItemLabel(item)}`;
  };

  if (!missingItems?.length) return null;

  return (
    <div className="mt-3">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <Button
          variant="outline-success"
          onClick={addAll}
          disabled={addingAll}
          title="Add every missing ingredient to your shopping list"
        >
          {addingAll ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Adding...
            </>
          ) : (
            'Add all missing items'
          )}
        </Button>

        <small className="text-muted">or add items individually:</small>
      </div>

      <div className="d-flex flex-wrap gap-2">
        {missingItems.map((item) => {
          const key = keyFor(item);
          return (
            <div key={key} className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: '150px' }}>
              <Button
                size="sm"
                className={`w-100 ${added[key] ? 'btn-success' : 'dish-btn-secondary'}`}
                variant={added[key] ? 'success' : ' dish-btn-secondary'}
                onClick={() => addOne(item)}
                disabled={adding[key] || !!added[key]}
                title={
                  added[key]
                    ? 'Already added'
                    : `Add ${formatItemLabel(item)} to shopping list`
                }
              >
                {renderButtonLabel(item)}
              </Button>
            </div>
          );
        })}
      </div>

      {message && (
        <div className="mt-2">
          <small className="text-muted">{message}</small>
        </div>
      )}
    </div>
  );
}
