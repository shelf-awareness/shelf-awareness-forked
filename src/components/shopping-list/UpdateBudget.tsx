'use client';

import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { UpdateBudgetSchema } from '@/lib/validationSchemas';
import { updateBudget } from '@/lib/dbActions';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  show: boolean;
  onHide: () => void;
  userID: number;
  onBudgetUpdated?: () => void;
}

type FormValues = {
  budget: number;
};

export default function UpdateBudget({ show, onHide, userID, onBudgetUpdated }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(UpdateBudgetSchema),
    defaultValues: {
      budget: 0,
    },
  });

  useEffect(() => {
    if (!show) reset();
  }, [show, reset]);
  const router = useRouter();
  const onSubmit = async (data: FormValues) => {
    try {
      await updateBudget(userID, data.budget);
      swal('Success', 'Budget updated!', 'success', { timer: 2000 });
      
      // Call the callback to refetch the budget before closing
      if (onBudgetUpdated) {
        await onBudgetUpdated();
      }
      
      reset();
      onHide();
    } catch (err: any) {
      console.error(err);
      swal('Error', err?.message || 'Failed to update budget', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Budget</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form className="mobile-section" noValidate onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Budget</Form.Label>
            <Form.Control
              type="text"
              placeholder="ex. $20"
              {...register('budget')}
              className={`${errors.budget ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.budget?.message}</div>
          </Form.Group>
          
          <Row className="pt-3 mobile grid">
            <Col>
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: 'var(--fern-green)' }}
                className="btn-submit mobile-card"
              >
                {isSubmitting ? 'Updating…' : 'Update'}
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
