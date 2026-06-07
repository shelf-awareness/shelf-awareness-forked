'use client';

import React from 'react';
import { Form, Button, ButtonGroup } from 'react-bootstrap';
import { BsList, BsGrid } from 'react-icons/bs';
import type { SortType } from './ProduceListWithGrouping';
import { PencilSquare, Trash } from 'react-bootstrap-icons';

type Props = {
  search: string;
  setSearch: (v: string) => void;
  sort: SortType;
  setSort: (v: SortType) => void;
  groupByStorage: boolean;
  setGroupByStorage: (v: boolean) => void;
  view: 'table' | 'cards';
  setView: (v: 'table' | 'cards') => void;
  clear: () => void;
  actionMode: 'none' | 'edit' | 'delete';
  setActionMode: (v: 'none' | 'edit' | 'delete') => void;
};

const SearchBarControls: React.FC<Props> = ({
  search,
  setSearch,
  sort,
  setSort,
  groupByStorage,
  setGroupByStorage,
  view,
  setView,
  clear,
  actionMode,
  setActionMode,
}) => (
  <div className="mt-2 mt-md-4 mb-4">
    <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center">
      
      <Form.Control
        type="text"
        placeholder="Search by name, type, or storage…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        style={{ minWidth: '280px', maxWidth: '300px' }}
      />

      <Form.Select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortType)}
        style={{ minWidth: '180px', maxWidth: '200px' }}
      >
        <option value="">Sort by…</option>
        <option value="name-asc">Name (A–Z)</option>
        <option value="type-asc">Type (A–Z)</option>
        <option value="expiration-soon">Expiration (Soonest)</option>
        <option value="qty-desc">Quantity (High → Low)</option>
        <option value="qty-asc">Quantity (Low → High)</option>
      </Form.Select>

      <Form.Check
        type="switch"
        id="group-by-storage"
        label="Group by storage"
        checked={groupByStorage}
        onChange={(e) => setGroupByStorage(e.currentTarget.checked)}
      />

      <ButtonGroup aria-label="View mode">
        <Button
          className={view === 'table' ? 'btn-view-active' : 'btn-view-inactive'}
          onClick={() => setView('table')}
          title="Table View"
        >
          <BsList size={20} />
        </Button>
        <Button
          className={view === 'cards' ? 'btn-view-active' : 'btn-view-inactive'}
          onClick={() => setView('cards')}
          title="Card View"
        >
          <BsGrid size={20} />
        </Button>
      </ButtonGroup>

      {/* Clear button */}
      <Button className="btn-clear" onClick={clear}>
        Clear
      </Button>


{view === 'table' && (
  <>
    {/* Edit button */}
    <Button
      variant="primary"
      className="d-flex align-items-center gap-2 text-white"
      style={{
        backgroundColor: actionMode === 'edit' ? '#0b5ed7' : '#0d6efd',
        borderColor: actionMode === 'edit' ? '#0a58ca' : '#0d6efd',
      }}
      onClick={() => setActionMode(actionMode === 'edit' ? 'none' : 'edit')}
    >
      <PencilSquare size={16} color="white" />
      Edit
    </Button>

    {/* Delete button */}
    <Button
      variant="danger"
      className="d-flex align-items-center gap-2 text-white"
      style={{
        backgroundColor: actionMode === 'delete' ? '#bb2d3b' : '#dc3545',
        borderColor: actionMode === 'delete' ? '#b02a37' : '#dc3545',
      }}
      onClick={() => setActionMode(actionMode === 'delete' ? 'none' : 'delete')}
    >
      <Trash size={16} color="white" />
      Delete
    </Button>
  </>
)}

    </div>
  </div>
);

export default SearchBarControls;