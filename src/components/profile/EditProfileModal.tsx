'use client';

import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import swal from 'sweetalert';
import '@/styles/buttons.css';

interface SavedValues {
  displayName: string;
  budget: number | null;
  proteinGoal: number | null;
  carbsGoal: number | null;
  fatGoal: number | null;
  caloriesGoal: number | null;
}

interface EditProfileModalProps {
  show: boolean;
  onHide: () => void;
  onSaved: (values: SavedValues) => void;
  email: string;
  displayName: string;
  budget: number | null;
  proteinGoal: number | null;
  carbsGoal: number | null;
  fatGoal: number | null;
  caloriesGoal: number | null;
}

function MacroField({
  id, label, unit, tooltip, value, onChange, max,
}: {
  id: string;
  label: string;
  unit: string;
  tooltip: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
}) {
  return (
    <Form.Group as={Col} xs={12} sm={6} className="mb-3">
      <Form.Label htmlFor={id}>
        {label}{' '}
        <span className="text-muted fw-normal">({unit})</span>
      </Form.Label>
      <Form.Control
        id={id}
        type="number"
        min={0}
        max={max}
        step={1}
        placeholder={`e.g. ${Math.round(max / 4)}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Form.Text className="text-muted">{tooltip}</Form.Text>
    </Form.Group>
  );
}

function toStr(v: number | null): string {
  return v !== null ? String(v) : '';
}

function toNum(s: string): number | null {
  if (s.trim() === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export default function EditProfileModal({
  show, onHide, onSaved, email, displayName: initialDisplayName,
  budget, proteinGoal, carbsGoal, fatGoal, caloriesGoal,
}: EditProfileModalProps) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [protein,   setProtein]   = useState(toStr(proteinGoal));
  const [carbs,     setCarbs]     = useState(toStr(carbsGoal));
  const [fat,       setFat]       = useState(toStr(fatGoal));
  const [calories,  setCalories]  = useState(toStr(caloriesGoal));
  const [budgetStr, setBudgetStr] = useState(toStr(budget));

  useEffect(() => {
    if (show) {
      setDisplayName(initialDisplayName);
      setProtein(toStr(proteinGoal));
      setCarbs(toStr(carbsGoal));
      setFat(toStr(fatGoal));
      setCalories(toStr(caloriesGoal));
      setBudgetStr(toStr(budget));
      setErr(null);
    }
  }, [show, initialDisplayName, proteinGoal, carbsGoal, fatGoal, caloriesGoal, budget]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErr(null);

      const checks: [string, string, number, number][] = [
        ['Protein',      protein,  0, 1000],
        ['Carbohydrates', carbs,   0, 1000],
        ['Fat',          fat,      0, 1000],
        ['Calories',     calories, 0, 10000],
      ];
      for (const [name, raw, min, max] of checks) {
        const n = toNum(raw);
        if (n !== null && (n < min || n > max)) {
          setErr(`${name} must be between ${min} and ${max}.`);
          return;
        }
      }

      setIsLoading(true);
      try {
        const newValues: SavedValues = {
          displayName:  displayName.trim(),
          proteinGoal:  toNum(protein),
          carbsGoal:    toNum(carbs),
          fatGoal:      toNum(fat),
          caloriesGoal: toNum(calories),
          budget:       budgetStr.trim() === '' ? null : Number(budgetStr),
        };

        const res = await fetch('/api/profile/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newValues),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to update profile');
        }

        onSaved(newValues);
        swal('Success', 'Your profile has been updated', 'success', { timer: 2000 });
        onHide();
        router.refresh();
      } catch (error: unknown) {
        setErr(error instanceof Error ? error.message : 'Failed to update profile');
      } finally {
        setIsLoading(false);
      }
    },
    [onHide, onSaved, router, displayName, protein, carbs, fat, calories, budgetStr],
  );

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Display Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Weekly Budget <span className="text-muted fw-normal">(USD)</span>
            </Form.Label>
            <Form.Control
              type="number"
              min={0}
              step={0.01}
              placeholder="e.g. 100"
              value={budgetStr}
              onChange={(e) => setBudgetStr(e.target.value)}
            />
          </Form.Group>

          <p className="mb-1 fw-semibold">Daily Macro Goals</p>
          <p className="text-muted small mb-3">
            Leave a field blank to clear that goal. All gram values are per day.
          </p>
          <Row>
            <MacroField
              id="protein-goal"
              label="Protein"
              unit="g"
              tooltip="0–1000 g per day"
              value={protein}
              onChange={setProtein}
              max={1000}
            />
            <MacroField
              id="carbs-goal"
              label="Carbohydrates"
              unit="g"
              tooltip="0–1000 g per day"
              value={carbs}
              onChange={setCarbs}
              max={1000}
            />
            <MacroField
              id="fat-goal"
              label="Fat"
              unit="g"
              tooltip="0–1000 g per day"
              value={fat}
              onChange={setFat}
              max={1000}
            />
            <MacroField
              id="calories-goal"
              label="Calories"
              unit="kcal"
              tooltip="0–10 000 kcal per day"
              value={calories}
              onChange={setCalories}
              max={10000}
            />
          </Row>

          <div className="d-flex justify-content-between mt-4">
            <Button type="submit" className="btn-add" disabled={isLoading}>
              {isLoading ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button variant="secondary" type="button" onClick={onHide}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
