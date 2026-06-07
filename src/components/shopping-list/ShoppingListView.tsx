'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Row, Col, Form, Button, Dropdown } from 'react-bootstrap';
import { SortDown } from 'react-bootstrap-icons';
import { getBudgetByUserId } from '@/lib/dbActions';
import AddShoppingList from './AddShoppingList';
import ShoppingListCard from './ShoppingListCard';
import AddToShoppingListModal from './AddToShoppingListModal';
import RecommendedWidget from './RecommendedWidget';
import UpdateBudget from './UpdateBudget';
import RecipesModal from '../recipes/RecipesModal';

import { ShoppingListWithProtein } from '../../types/shoppingList';

type ShoppingListViewProps = {
  initialShoppingLists: ShoppingListWithProtein[];
};

type SortKey = 'totalItems' | 'totalCost' | 'totalProtein';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: { key: SortKey; dir: SortDir; label: string }[] = [
  { key: 'totalItems',   dir: 'asc',  label: 'Total Items: Low → High' },
  { key: 'totalItems',   dir: 'desc', label: 'Total Items: High → Low' },
  { key: 'totalCost',    dir: 'asc',  label: 'Estimated Cost: Low → High' },
  { key: 'totalCost',    dir: 'desc', label: 'Estimated Cost: High → Low' },
  { key: 'totalProtein', dir: 'asc',  label: 'Total Protein: Low → High' },
  { key: 'totalProtein', dir: 'desc', label: 'Total Protein: High → Low' },
];

export default function ShoppingListView({ initialShoppingLists }: ShoppingListViewProps) {
  const { data: session } = useSession();
  const [shoppingLists, setShoppingLists] = useState<ShoppingListWithProtein[]>(initialShoppingLists);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [show, setShow] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showUpdateBudget, setShowUpdateBudget] = useState(false);
  const [showRecipesModal, setShowRecipesModal] = useState(false);
  const [budget, setBudget] = useState<string>('$0.00');
  const [loadingBudget, setLoadingBudget] = useState(true);

  useEffect(() => {
    const fetchBudget = async () => {
      if (!session?.user?.id) {
        setLoadingBudget(false);
        return;
      }
      try {
        const budgetStr = await getBudgetByUserId(Number(session.user.id));
        const budgetAmount = parseFloat(budgetStr || '0');
        setBudget(`$${budgetAmount.toFixed(2)}`);
      } catch (error) {
        console.error('Error fetching budget:', error);
      } finally {
        setLoadingBudget(false);
      }
    };
    fetchBudget();
  }, [session?.user?.id]);

  const refetchBudget = async () => {
    if (!session?.user?.id) return;
    try {
      const budgetStr = await getBudgetByUserId(Number(session.user.id));
      const budgetAmount = parseFloat(budgetStr || '0');
      setBudget(`$${budgetAmount.toFixed(2)}`);
    } catch (error) {
      console.error('Error refetching budget:', error);
    }
  };

  const handleListDeleted = useCallback((id: number) => {
    setShoppingLists((prev) => prev.filter((list) => list.id !== id));
  }, []);

  const handleListCreated = useCallback((newList: ShoppingListWithProtein) => {
    setShoppingLists((prev) => [newList, ...prev]);
  }, []);

  const getListValue = (list: ShoppingListWithProtein, key: SortKey) => {
    if (key === 'totalItems') return list.items.length;
    if (key === 'totalCost') return list.items.reduce(
      (sum, item) =>
        sum + (item.price != null ? Number(item.price) : 0) * (item.quantityValue
           != null ? Number(item.quantityValue) : 0),
      0,
    );
    if (key === 'totalProtein') return list.totalProtein;
    return 0;
  };

  const searchLower = searchTerm.toLowerCase();
  const filteredLists = shoppingLists
    .filter((list) => list.name.toLowerCase().includes(searchLower))
    .slice()
    .sort((a, b) => {
      if (!sortKey) return 0;
      const diff = getListValue(a, sortKey) - getListValue(b, sortKey);
      return sortDir === 'asc' ? diff : -diff;
    });

  const activeSort = sortKey
    ? SORT_OPTIONS.find((o) => o.key === sortKey && o.dir === sortDir)
    : null;

  return (
    <>
      {/* Search bar row */}
      <Row
        className="mb-4 d-flex justify-content-center align-items-center text-center"
      >
        <Col xs={12} md={5} lg={4} className="mb-2">
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ced4da', 
            borderRadius: '0.375rem', backgroundColor: 'white', paddingRight: '0.5rem' }}>
            <Form.Control
              type="text"
              placeholder="Search shopping lists..."
              className="mobile-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', boxShadow: 'none', flex: 1 }}
            />
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                bsPrefix="p-0 border-0 bg-transparent"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: sortKey ? 'var(--light-blue, #0d6efd)' : '#6c757d',
                  boxShadow: 'none',
                }}
                title="Sort lists"
              >
                <SortDown size={18} />
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Header>Sort by</Dropdown.Header>
                {SORT_OPTIONS.map((opt) => (
                  <Dropdown.Item
                    key={`${opt.key}-${opt.dir}`}
                    active={sortKey === opt.key && sortDir === opt.dir}
                    onClick={() => { setSortKey(opt.key); setSortDir(opt.dir); }}
                  >
                    {opt.label}
                  </Dropdown.Item>
                ))}

                {sortKey && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => setSortKey(null)} className="text-muted">
                      Clear sort
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          {activeSort && (
            <div style={{ position: 'absolute', fontSize: '0.75rem', color: '#6c757d', 
            marginTop: '2px', textAlign: 'left' }}>
              Sorted by: {activeSort.label}
            </div>
          )}
        </Col>
      </Row>

{/* Buttons */}
{/* Buttons */}
<div
  style={{
    position: 'relative',
    width: '100vw',
    left: '50%',
    transform: 'translateX(-50%)',
    minHeight: '50px',
    marginBottom: '1.5rem',
  }}
>
  <Row className="justify-content-center flex-wrap gap-2 m-0">
    <Col xs="auto" className="mb-2">
      <Button
        onClick={() => setShow(true)}
        style={{
          backgroundColor: 'var(--light-blue)',
          height: '34px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
        }}
        className="btn-submit"
      >
        + Add Item to List
      </Button>
      <AddToShoppingListModal
        show={show}
        onHide={() => setShow(false)}
        shoppingLists={shoppingLists}
        sidePanel={false}
        prefillName=""
        onItemAdded={(newItem) => {
          setShoppingLists((prev) =>
            prev.map((list) => {
              if (list.id !== newItem.shoppingListId) return list;
              const exists = list.items.find((i) => i.id === newItem.id);
              const updatedItems = exists
                ? list.items.map((i) => (
                  i.id === newItem.id
                    ? {
                        ...i,
                        quantityValue: newItem.quantityValue,
                        quantityUnit: newItem.quantityUnit,
                        price: newItem.price,
                        proteinGrams: newItem.proteinGrams,
                      }
                    : i
                ))
                : [...list.items, newItem];
              const totalProtein = updatedItems.reduce(
                (sum, i) => sum + (i.proteinGrams ?? 0) * i.quantityValue,
                0,
              );
              return { ...list, items: updatedItems, totalProtein };
            }),
          );
        }}
      />
    </Col>

    <Col xs="auto" className="mb-2">
      <Button
        onClick={() => setShowCreateList(true)}
        style={{
          backgroundColor: 'var(--light-blue)',
          height: '34px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
        }}
        className="btn-submit"
      >
        + New List
      </Button>
      <AddShoppingList
        show={showCreateList}
        onHide={() => setShowCreateList(false)}
        owner={session?.user?.email ?? ''}
        onListCreated={handleListCreated}
      />
    </Col>

    <Col xs="auto" className="mb-2">
      <Button
        onClick={() => setShowRecipesModal(true)}
        style={{
          backgroundColor: 'var(--light-blue)',
          height: '34px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
        }}
        className="btn-submit"
      >
        + Create From Recipe
      </Button>
    </Col>

    <RecipesModal
      show={showRecipesModal}
      onHide={() => setShowRecipesModal(false)}
      onListCreated={handleListCreated}
    />
  </Row>

  <div
    className="d-flex align-items-center gap-4"
    style={{
      position: 'absolute',
      right: '80px',
      top: '50%',
      transform: 'translateY(-50%)',
    }}
  >
    <div className="mb-2">
      <Button
        onClick={() => setShowUpdateBudget(true)}
        style={{
          backgroundColor: 'var(--light-blue)',
          height: '34px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
        }}
        className="btn-submit"
      >
        Set Budget
      </Button>
      <UpdateBudget
        show={showUpdateBudget}
        onHide={() => setShowUpdateBudget(false)}
        userID={Number(session?.user?.id ?? 0)}
        onBudgetUpdated={refetchBudget}
      />
    </div>

    <div className="mb-2">
      <div
        style={{
          backgroundColor: 'var(--light-blue)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          minWidth: '120px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '12px', opacity: 0.9 }}>Budget</div>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
          {loadingBudget ? 'Loading...' : budget}
        </div>
      </div>
    </div>
  </div>
</div>

      {/* MAIN LAYOUT: Lists left, Recommended right */}
      <Row className="d-flex flex-column flex-md-row">
        {/* LEFT SIDE — Shopping Lists */}
        <Col xs={12} md={8}>
          {filteredLists.length === 0 ? (
            <Row>
              <Col className="text-center">
                <p className="text-muted">No shopping lists found. Create one to get started!</p>
              </Col>
            </Row>
          ) : (
            <Row className="g-2 g-md-3">
              {filteredLists.map((list) => (
                <Col key={list.id} md={6} className="mb-2 mb-md-4">
                  <ShoppingListCard shoppingList={list} onListDeleted={handleListDeleted} />
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {/* RIGHT SIDE — Recommended Items */}
        <Col xs={12} md={4} className="mt-4 mt-md-0">
          {session?.user?.email && (
            <RecommendedWidget
              owner={session?.user?.email ?? ''}
              shoppingLists={shoppingLists}
            />
          )}
        </Col>
      </Row>
    </>
  );
}