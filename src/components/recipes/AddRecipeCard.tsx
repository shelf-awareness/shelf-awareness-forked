'use client';

import { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import AddRecipeModal from '@/components/recipes/AddRecipeModal';

export default function AddRecipeCard() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Card className="h-100 d-flex align-items-center justify-content-center">
        <Button
          className="btn-add w-100 py-2"
          onClick={() => setShow(true)}
          >
          + Add Recipe
        </Button>
      </Card>

      <AddRecipeModal show={show} onHide={() => setShow(false)} />
    </>
  );
}
