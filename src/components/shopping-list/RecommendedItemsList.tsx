'use client';

import type { Produce } from '@prisma/client';

interface RecommendedItemsListProps {
  items: Produce[];
  onAdd: (item: Produce) => void;
}

const formatDate = (date: Date | string | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

export default function RecommendedItemsList({ items, onAdd }: RecommendedItemsListProps) {
  if (!items.length) {
    return <p className="text-muted mb-0">No recommendations.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
      {items.map(item => (
        <li key={item.id} style={{ marginBottom: '0.75rem' }}>

          {/* NAME + BUTTON */}
          <div className="d-flex justify-content-between align-items-center">
            <strong>{item.name}</strong>

            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => onAdd(item)}
            >
              +
            </button>
          </div>

          {/* EXTRA INFO */}
          <small>
            Qty:
            {' '}
            {item.quantityValue}
            {' '}
            • Exp:
            {' '}
            {formatDate(item.expiration)}
          </small>
        </li>
      ))}
    </ul>
  );
}
