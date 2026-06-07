'use client';

import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { AddShoppingListSchema } from '@/lib/validationSchemas';
import { addShoppingList } from '@/lib/dbActions';
import { useEffect } from 'react';

interface Props {
  show: boolean;
  onHide: () => void;
  owner: string;
  onListCreated?: (list: any) => void;
}

type FormValues = {
  name: string;
  owner: string;
};

export default function AddShoppingList({ show, onHide, owner, onListCreated }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(AddShoppingListSchema),
    defaultValues: {
      name: '',
      owner,
    },
  });

  useEffect(() => {
    if (!show) reset({ name: '', owner });
    else setValue('owner', owner);
  }, [show, reset, setValue, owner]);

  const onSubmit = async (data: FormValues) => {
    try {
      const newList = await addShoppingList({
        name: data.name.trim(),
        owner: data.owner,
      });

      onListCreated?.({ ...newList, totalProtein: 0 });
      swal('Success', 'Shopping list created!', 'success', { timer: 2000 });
      onHide();
    } catch (err: any) {
      console.error(err);
      swal('Error', err?.message || 'Failed to create shopping list', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Shopping List</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form className="mobile-section" noValidate onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>List Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="ex. Weekly Groceries"
              {...register('name')}
              className={`${errors.name ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.name?.message}</div>
          </Form.Group>

          {/* OWNER HIDDEN */}
          <input type="hidden" {...register('owner')} />

          <Row className="pt-3 mobile grid">
            <Col>
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: 'var(--fern-green)' }}
                className="btn-submit mobile-card"
              >
                {isSubmitting ? 'Creating…' : 'Create'}
              </Button>
            </Col>
            <Col>
              <Button
                type="button"
                onClick={() => reset()}
                variant="warning"
                className="btn-reset mobile-card"
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
}