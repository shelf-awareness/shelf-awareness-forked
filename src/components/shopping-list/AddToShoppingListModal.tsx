'use client';

import { Button, Col, Form, Modal, Row, InputGroup, Offcanvas } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AddShoppingListItemSchema } from '@/lib/validationSchemas';
import { addShoppingListItem } from '@/lib/dbActions';
import { QuantityUnit } from '@prisma/client';
import { ShoppingListWithProtein } from '../../types/shoppingList';

type SL = Pick<ShoppingListWithProtein, 'id' | 'name'>;

type AddItemValues = {
  name: string;
  quantityValue: number;
  quantityUnit?: QuantityUnit | null;
  customQuantityUnit?: string;
  shoppingListId: number;
  price?: number;
  proteinGrams?: number;
};

interface Props {
  show: boolean;
  onHide: () => void;
  shoppingLists: SL[];
  sidePanel: boolean;
  prefillName: string;
  onItemAdded?: (item: any) => void;
}

const AddToShoppingListModal = ({
  show,
  onHide,
  shoppingLists,
  sidePanel = false,
  prefillName,
  onItemAdded,
}: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  const owner = session?.user?.email;

  const unitOptions: QuantityUnit[] = ['G', 'OZ', 'LB', 'ML', 'CUP', 'ITEM'];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddItemValues>({
    resolver: yupResolver(AddShoppingListItemSchema),
    defaultValues: {
      name: prefillName,
      quantityValue: 0,
      quantityUnit: null,
      customQuantityUnit: '',
      price: 0,
      proteinGrams: 0,
      shoppingListId: shoppingLists[0]?.id ?? 0,
    },
  });

  const unitChoice = watch('quantityUnit') as QuantityUnit | "Other" | undefined;
  const customUnit = watch('customQuantityUnit');

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      reset({
        name: prefillName,
        quantityValue: 0,
        quantityUnit: null,
        customQuantityUnit: '',
        price: 0,
        proteinGrams: 0,
        shoppingListId: shoppingLists[0]?.id ?? 0,
      });
    }
  }, [show, prefillName, reset, shoppingLists]);

  const handleClose = () => {
    reset({
      name: prefillName,
      quantityValue: 0,
      quantityUnit: null,
      customQuantityUnit: '',
      price: 0,
      proteinGrams: 0,
      shoppingListId: shoppingLists[0]?.id ?? 0,
    });
    onHide();
  };

  const onSubmit = async (data: AddItemValues) => {
    if (!owner) {
      swal('Error', 'You must be signed in to add to your shopping list.', 'error');
      return;
    }

    try {
      const unit =
        unitChoice === 'Other'
        ? customUnit?.trim() || undefined
        : unitChoice || undefined;
      const price = Number(data.price) || 0;
      const proteinGrams = Number(data.proteinGrams) || 0;

      const newItem = await addShoppingListItem({
        name: data.name.trim(),
        quantity: Number(data.quantityValue),
        unit,
        price,
        proteinGrams,
        shoppingListId: Number(data.shoppingListId),
      });

      onItemAdded?.(newItem);
      swal('Success', 'Item added to your shopping list', 'success', { timer: 2000 });
      handleClose();
      if (!onItemAdded) router.refresh();
    } catch (err: any) {
      console.error(err);
      swal('Error', err?.message || 'Something went wrong', 'error');
    }
  };

  const formContent = (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Row className="mb-3">
        <Col xs={12} sm={6}>
          <Form.Group>
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Bananas"
              {...register('name')}
              className={`${errors.name ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.name?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={6} sm={3}>
          <Form.Group>
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              {...register('quantityValue', { valueAsNumber: true })}
              className={`${errors.quantityValue ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.quantityValue?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={6} sm={3}>
          <Form.Group>
            <Form.Label>Unit</Form.Label>
            <Form.Select {...register('quantityUnit')}>
              <option value="">Select unit…</option>
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              <option value="Other">Other</option>
            </Form.Select>

            {unitChoice === 'Other' && (
  <Form.Control
    type="text"
    placeholder="Enter custom unit"
    {...register('customQuantityUnit')}
    className="mt-2"
  />
)}
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12} sm={5}>
          <Form.Group>
            <Form.Label>Price Per Unit (optional)</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })}
                className={`${errors.price ? 'is-invalid' : ''}`}
              />
            </InputGroup>
            <div className="invalid-feedback">{errors.price?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group>
            <Form.Label>Protein (g)</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              {...register('proteinGrams', { valueAsNumber: true })}
              className={`${errors.proteinGrams ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.proteinGrams?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={12} sm={7}>
          <Form.Group>
            <Form.Label>List</Form.Label>
            <Form.Select {...register('shoppingListId', { valueAsNumber: true })}>
              <option value="">Choose a list…</option>
              {shoppingLists.map((sl) => (
                <option key={sl.id} value={sl.id}>
                  {sl.name}
                </option>
              ))}
            </Form.Select>
            <div className="invalid-feedback">{errors.shoppingListId?.message}</div>
          </Form.Group>
        </Col>
      </Row>

      <Row className="pt-3">
        <Col>
          <Button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding…' : 'Submit'}
          </Button>
        </Col>
        <Col>
          <Button
            type="button"
            onClick={() =>
              reset({
                name: prefillName,
                quantityValue: 0,
                quantityUnit: null,
                customQuantityUnit: '',
                price: 0,
                proteinGrams: 0,
                shoppingListId: shoppingLists[0]?.id ?? 0,
              })
            }
            variant="warning"
            className="btn-reset"
          >
            Reset
          </Button>
        </Col>
      </Row>
    </Form>
  );

  return !sidePanel ? (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header className="justify-content-center">
        <Modal.Title>Add Shopping List Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>{formContent}</Modal.Body>
    </Modal>
  ) : (
    <Offcanvas show={show} onHide={onHide} placement="end" backdrop={false}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Add Shopping List Item</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>{formContent}</Offcanvas.Body>
    </Offcanvas>
  );
};

export default AddToShoppingListModal;