'use client'; 

import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { QuantityUnit } from '@prisma/client';
import { InputGroup } from 'react-bootstrap';

type SavedItem = {
  id: number;
  name: string;
  quantityValue: number;
  quantityUnit?: QuantityUnit | null;
  price?: number | null;
  proteinGrams?: number | null;
  restockTrigger?: string | null;
  customThreshold?: number | null;
};

type EditModalProps = {
  show: boolean;
  onHide: () => void;
  item: SavedItem;
  onItemSaved?: (updated: SavedItem) => void;
};

export default function EditShoppingListItemModal({
  show,
  onHide,
  item,
  onItemSaved,
}: EditModalProps) {
  const [form, setForm] = useState({
    name: item.name,
    quantity: item.quantityValue?.toString() ?? '',
    quantityUnit: item.quantityUnit ?? '',
    price: item.price !== null && item.price !== undefined
  ? Number(item.price).toFixed(2)
  : '',
    proteinGrams: item.proteinGrams ?? '',
    restockTrigger: item.restockTrigger ?? 'empty',
    customThreshold: item.customThreshold ?? '',
  });
  
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const updated: SavedItem = {
      id: item.id,
      name: form.name,
      quantityValue: Number(form.quantity),
      quantityUnit: (form.quantityUnit as QuantityUnit) || null,
      price: form.price ? Number(form.price) : null,
      proteinGrams: form.proteinGrams ? Number(form.proteinGrams) : null,
      restockTrigger: form.restockTrigger || null,
      customThreshold:
        form.restockTrigger === 'custom' ? Number(form.customThreshold) : null,
    };

    await fetch(`/api/shopping-list-item/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });

    onItemSaved?.(updated);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered fullscreen="sm-down">
      <Modal.Header closeButton>
        <Modal.Title>Edit Item</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={form.name} onChange={handleChange} />
          </Form.Group>

          <Row className="mt-3">
            <Col xs={12} md={6}>
              <Form.Label>Quantity</Form.Label>
              <Form.Control name="quantity" type="number" value={form.quantity} onChange={handleChange} />
            </Col>
            <Col xs={12} md={6}>
              <Form.Select name="quantityUnit" value={form.quantityUnit } onChange={handleChange}>
                <option value="">No unit</option>
                <option value="G">Grams</option>
                <option value="OZ">Ounces</option>
                <option value="LB">Pounds</option>
                <option value="ML">Milliliters</option>
                <option value="CUP">Cups</option>
                <option value="ITEM">Item</option>
              </Form.Select>
            </Col>
          </Row>

          <Form.Group className="mt-3">
            <Form.Label>Price</Form.Label>
            <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
              <Form.Control name="price" type="number" step="0.01" value={form.price} onChange={handleChange}/>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Protein (grams)</Form.Label>
            <Form.Control name="proteinGrams" type="number" step="0.1" min="0" value={form.proteinGrams} 
            onChange={handleChange} placeholder="0" />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Restock When</Form.Label>
            <Form.Select name="restockTrigger" value={form.restockTrigger} onChange={handleChange}>
              <option value="empty">When empty</option>
              <option value="half">When half gone</option>
              <option value="custom">Custom % left</option>
            </Form.Select>
            {form.restockTrigger === 'custom' && (
              <Form.Control className="mt-2" name="customThreshold" type="number" placeholder="% left" 
              value={form.customThreshold} onChange={handleChange} />
            )}
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button style={{ backgroundColor: 'var(--fern-green)' }} onClick={handleSave}>Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
}