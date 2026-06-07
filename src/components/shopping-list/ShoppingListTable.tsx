'use client';

import { Table } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';

type ShoppingListItem = {
  id: number;
  quantity: number;
  price: number | null;
  produce: {
    name: string;
    unit: string;
  } | null;
};

export default function ShoppingListTable({ items }: { items: ShoppingListItem[] }) {
  if (!items || items.length === 0) {
    return <p>Your shopping list is empty.</p>;
  }

  const formatMoney = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);

  const total = items.reduce(
    (sum, it) => sum + (it.price ? it.price * it.quantity : 0),
    0,
  );

  return (
    <>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Price</th>
            <th>Subtotal</th>
            <th>Edit</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const name = it.produce?.name ?? 'Unknown';
            const unit = it.produce?.unit ?? '';
            const price = it.price ?? 0;
            const subtotal = price * it.quantity;

            return (
              <tr key={it.id}>
                <td>{name}</td>
                <td>{it.quantity}</td>
                <td>{unit}</td>
                <td>{price ? formatMoney(price) : '—'}</td>
                <td>{subtotal ? formatMoney(subtotal) : '—'}</td>
                <td><button type="button">Edit</button></td>
                <td><button type="button"><Trash /></button></td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="d-flex justify-content-end mt-2">
        <strong>
          Total:
          {formatMoney(total)}
        </strong>
      </div>
    </>
  );
}
