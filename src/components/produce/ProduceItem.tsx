/* eslint-disable react/jsx-one-expression-per-line */
import swal from 'sweetalert';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import { ProduceRelations } from '@/types/ProduceRelations';
import EditProduceModal from './EditProduceModal';
import '../../styles/buttons.css';
import DeleteProduceModal from './DeleteProduceModal';

/* eslint-disable react/require-default-props */
const ProduceItem = ({
  id,
  name,
  quantityValue,
  quantityUnit,
  type,
  location,
  storage,
  expiration,
  owner,
  image,
  restockThreshold = 1,
  proteinGrams = null,
  actionMode,
}: ProduceRelations & { restockThreshold?: number; actionMode: 'none' | 'edit' | 'delete' }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addingToList, setAddingToList] = useState(false);

  const safeRestock = restockThreshold ?? 1;

  const handleAddToShoppingList = async () => {
    if (addingToList) return;
    try {
      setAddingToList(true);

      const res = await fetch('/api/shopping-list-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          name,
          quantityValue: Number(quantityValue),
          quantityUnit: quantityUnit ?? '',
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || 'Failed');
      }

      swal('Added', `${name} added to your shopping list`, 'success', { timer: 2000 });
    } catch (e) {
      swal('Error', 'Failed to add item to shopping list', 'error');
    } finally {
      setAddingToList(false);
    }
  };

  return (
    <>
      <tr>
        <td>{name}</td>
        <td>{type}</td>
        <td>
          {(typeof storage === 'object' ? storage?.name : storage) || 'N/A'} at{' '}
          {(typeof location === 'object' ? location?.name : location) || 'N/A'}
        </td>
        <td>
          {quantityValue?.toString()}
          {quantityUnit ? ` ${quantityUnit}` : ''}
        </td>
        <td>{safeRestock}</td>
        <td>{expiration ? new Date(expiration).toISOString().split('T')[0] : 'N/A'}</td>

        {/* ONLY SHOW WHEN EDIT MODE */}
        {actionMode === 'edit' && (
          <td>
            <Button size="sm" className="btn-edit" onClick={() => setShowEditModal(true)}>
              <PencilSquare color="white" size={18} />
            </Button>
          </td>
        )}

        {/* ONLY SHOW WHEN DELETE MODE */}
        {actionMode === 'delete' && (
          <td>
            <Button variant="danger" size="sm" className="btn-delete" onClick={() => setShowDeleteModal(true)}>
              <Trash color="white" size={18} />
            </Button>
          </td>
        )}

        <td>
          <Button
            variant="success"
            size="sm"
            className="btn-submit"
            onClick={handleAddToShoppingList}
            disabled={addingToList}
          >
            {addingToList ? 'Adding…' : 'Add'}
          </Button>
        </td>
      </tr>

      <EditProduceModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        produce={{
          id,
          name,
          quantityValue,
          quantityUnit,
          type,
          location,
          storage,
          expiration,
          owner,
          image,
          restockThreshold: safeRestock,
          proteinGrams,
        }}
      />

      <DeleteProduceModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        produce={{
          id,
          name,
          quantityValue,
          quantityUnit,
          type,
          location,
          storage,
          expiration,
          owner,
          image,
          restockThreshold: safeRestock,
          proteinGrams,
        }}
      />
    </>
  );
};

export default ProduceItem;