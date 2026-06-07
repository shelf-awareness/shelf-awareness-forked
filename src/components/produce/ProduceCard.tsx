/* eslint-disable react/jsx-one-expression-per-line */

'use client';

import { Card, ListGroup, Image, Button } from 'react-bootstrap/';
import Link from 'next/link';
import type { ProduceRelations } from '@/types/ProduceRelations';
import { useState } from 'react';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import EditProduceModal from './EditProduceModal';
import DeleteProduceModal from './DeleteProduceModal';

type Props = { produce: ProduceRelations };

const formatDate = (d?: Date | string | null) => {
  if (!d) return 'Not Available';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return 'Not Available';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function ProduceCard({ produce }: Props) {
  const imageSrc = produce.image || '/no-image.png';
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <Card className="min-vh-75 min-vw-75 mb-3 image-shadow">
      <Card.Header>
        <Link href={`/produce/${produce.id}`} className="link-dark">
          <Card.Title className="mb-1">{produce.name}</Card.Title>
        </Link>
        <Card.Subtitle className="text-muted">{produce.type || 'Type Not Available'}</Card.Subtitle>
      </Card.Header>

      <Card.Body>
        <Image
          src={imageSrc}
          alt={produce.name || 'No image'}
          height="200px"
          width="100%"
          className="mb-2 cardimage"
          style={{ objectFit: 'cover' }}
        />

        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Location: </strong>
            {produce.storage?.name || 'Not Available'} at {produce.location?.name || 'Not Available'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Quantity:</strong> 
            {typeof produce.quantityValue === 'number' ? produce.quantityValue : 'Not Available'}
            {produce.quantityUnit ? ` ${produce.quantityUnit}` : ''}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Expiration:</strong> {formatDate(produce.expiration)}
          </ListGroup.Item>
        </ListGroup>
        <Card.Footer className="d-flex mb-0">
          <Button className="me-2 btn-edit" onClick={() => setShowEditModal(true)}>
            <PencilSquare color="white" size={18} />
          </Button>
          <Button
            variant="danger"
            className="btn-delete"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash color="white" size={18} />
          </Button>
        </Card.Footer>
      </Card.Body>

      {/* Modal component for editing produce item */}
      <EditProduceModal show={showEditModal} onHide={() => setShowEditModal(false)} produce={produce} />

      {/* Modal component for deleting produce item */}
      <DeleteProduceModal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} produce={produce} />
    </Card>
  );
}
