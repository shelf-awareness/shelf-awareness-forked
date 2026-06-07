'use client';

import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import swal from 'sweetalert';
import { DietaryCategory } from '@prisma/client';
import '@/styles/buttons.css';

interface EditDietPrefModalProps {
  show: boolean;
  onHide: () => void;
  currentDietPref: DietaryCategory[]; 
}

export default function EditDietPrefModal({
  show,
  onHide,
  currentDietPref,
}: EditDietPrefModalProps) {
  const router = useRouter();

  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dietPref, setDietPref] = useState<DietaryCategory[]>([]);

 
  useEffect(() => {
    if (show) {
      setDietPref(currentDietPref || []);
    }
  }, [show, currentDietPref]);

  
  const handleCheckboxChange = (value: DietaryCategory) => {
    setDietPref((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErr(null);
      setIsLoading(true);

      try {
        const res = await fetch('/api/profile/update-diet', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dietPref }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to update dietary preferences');
        }

        swal('Success', 'Dietary preferences updated', 'success', {
          timer: 2000,
        });

        onHide();
        router.refresh();
      } catch (error: any) {
        setErr(error?.message ?? 'Failed to update dietary preferences');
      } finally {
        setIsLoading(false);
      }
    },
    [dietPref, onHide, router]
  );

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Edit Dietary Preferences</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {err && <Alert variant="danger">{err}</Alert>}

          <Form.Group>
            <Form.Label>Select your dietary preferences</Form.Label>

            {Object.values(DietaryCategory).map((pref) => (
              <Form.Check
                key={pref}
                type="checkbox"
                label={pref.replace('_', ' ')}
                value={pref}
                checked={dietPref.includes(pref)}
                onChange={() => handleCheckboxChange(pref)}
              />
            ))}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isLoading}>
            Cancel
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}