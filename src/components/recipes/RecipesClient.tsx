'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Row, Col, Button, Form, Dropdown, Container, Badge } from 'react-bootstrap';
import AddRecipeModal from '@/components/recipes/AddRecipeModal';
import { useSession } from 'next-auth/react';
import * as Icon from  'react-bootstrap-icons';
import RecipeCard from './RecipeCard';
import '../../styles/buttons.css';
import { getExpiringItemNames, matchRecipesWithExpiringPantry } from '@/lib/pantryUtils';

type Props = {
  recipes: any[];
  produce: any[];
  canAdd: boolean;
  currentUserEmail: string | null;
  isAdmin: boolean;
};

export default function RecipesClient({
  recipes,
  produce,
  canAdd: serverCanAdd,
  currentUserEmail: serverEmail,
  isAdmin: serverIsAdmin,
}: Props) {
  const { data: session } = useSession();
  
  const currentUserEmail = (session?.user?.email ?? serverEmail) || null;
  const isAdmin = serverIsAdmin || currentUserEmail === 'admin@foo.com';
  const canAdd = serverCanAdd || !!currentUserEmail;

  const [sort, setSort] = useState<'newest' | 'popular' | 'quickest' | 'az'>('newest');
  const [popularRecipes, setPopularRecipes] = useState<any[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [showCanMake, setShowCanMake] = useState(false);
  const [showWithinBudget, setShowWithinBudget] = useState(false);
  const [showExpiringFilter, setShowExpiringFilter] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Compute names of pantry items expiring within 7 days (issue-166)
  const expiringNames = useMemo(() => getExpiringItemNames(produce), [produce]);

  const pantryNames = useMemo(
    () => new Set(produce.map((p) => p.name.toLowerCase())),
    [produce],
  );
  const dietaryOptions = [
  'VEGAN',
  'VEGETARIAN',
  'KETO',
  'GLUTEN_FREE',
  'HIGH_PROTEIN',
  'LOW_CARB',
];

const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

const toggleDietary = (tag: string) => {
  setSelectedDietary((prev) =>
    prev.includes(tag)
      ? prev.filter((t) => t !== tag)
      : [...prev, tag]
  );
};
  // const pantryItems = useMemo(() => { return new Set(produce) }, [produce]);
  // Edited to pass pantryItems as an array instead of a Set, since it is defined as an array in the RecipeCardProps
  const pantryItems = useMemo(() => produce, [produce]);


  /* TODO: Add "within budget" filter state and logic. 
  Need to figure out estimated costs and calculating cost per unit before doing so.
  */
 
  const canMakeFiltered = useMemo(() => {
    if (!showCanMake) return recipes;

    return recipes.filter((r) => {
      const items = r.ingredientItems ?? [];
      if (items.length === 0) return false;

      return items.every((i: any) => pantryNames.has(i.name.toLowerCase()));
    });
  }, [recipes, showCanMake, pantryNames]);

  // issue-165 / issue-166: filter to recipes that use at least one expiring ingredient
  const expiringFiltered = useMemo(() => {
    if (!showExpiringFilter) return canMakeFiltered;
    return matchRecipesWithExpiringPantry(canMakeFiltered, expiringNames);
  }, [canMakeFiltered, showExpiringFilter, expiringNames]);

  const dietaryFiltered = useMemo(() => {
  if (selectedDietary.length === 0) return expiringFiltered;

  return expiringFiltered.filter((r) => {
    const recipeDietary = Array.isArray(r.dietary)
      ? r.dietary
      : r.dietary
      ? [r.dietary]
      : [];
    const normalizedRecipeDietary = recipeDietary.map((d: string) =>
      d.toUpperCase()
    );
    return selectedDietary.every((tag) =>
      normalizedRecipeDietary.includes(tag.toUpperCase())
    );
  });
}, [expiringFiltered, selectedDietary]);
  const filteredRecipes = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return dietaryFiltered;

    return dietaryFiltered.filter((r) => {
      const titleMatch = r.title.toLowerCase().includes(query);
      const cuisineMatch = r.cuisine.toLowerCase().includes(query);
      const dietaryMatch = (r.dietary ?? []).some((tag: string) => tag.toLowerCase().includes(query));
      const ingredientMatch = (r.ingredientItems ?? []).some((item: any) => item.name.toLowerCase().includes(query));

      return titleMatch || cuisineMatch || dietaryMatch || ingredientMatch;
    });
  }, [dietaryFiltered, search]);

  // Helper: can current user edit this recipe?
  const canEditRecipe = useCallback(
    (ownerRaw: string | string[] | undefined): boolean => {
      if (!currentUserEmail) return false;
      if (isAdmin) return true;

      const owner = ownerRaw ?? 'Pantry Pals Team';

      if (Array.isArray(owner)) {
        return owner.includes(currentUserEmail);
      }
      return owner === currentUserEmail;
    },
    [currentUserEmail, isAdmin],
  );

  // When editMode is ON, only show recipes the user can edit
  const recipesToShow = useMemo(() => {
    if (!editMode) return filteredRecipes;
    return filteredRecipes.filter((r) => canEditRecipe(r.owner));
  }, [filteredRecipes, editMode, canEditRecipe]);
  const sortedRecipes = useMemo(() => {
    const arr = [...recipesToShow];

    if (sort === 'newest') {
      return arr.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (sort === 'quickest') {
      return arr.sort((a, b) => {
        const aTotal = (a.prepMinutes ?? 0) + (a.cookMinutes ?? 0);
        const bTotal = (b.prepMinutes ?? 0) + (b.cookMinutes ?? 0);
        return aTotal - bTotal;
      });
    }

    if (sort === 'az') {
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    }

    return arr;
  }, [recipesToShow, sort]);

  const displayedRecipes = useMemo(() => {
  if (sort !== 'popular') {
    return sortedRecipes;
  }

  const filteredIds = new Set(recipesToShow.map((r) => r.id));
  return popularRecipes.filter((r) => filteredIds.has(r.id));
}, [sort, sortedRecipes, popularRecipes, recipesToShow]);


  useEffect(() => {
  if (sort !== 'popular') return;

  let ignore = false;

  const fetchPopularRecipes = async () => {
    try {
      setPopularLoading(true);

      const res = await fetch('/api/recipes/popular');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to fetch popular recipes');
      }

      if (!ignore) {
        setPopularRecipes(data);
      }
    } catch (error) {
      console.error('Failed to load popular recipes:', error);
      if (!ignore) {
        setPopularRecipes([]);
      }
    } finally {
      if (!ignore) {
        setPopularLoading(false);
      }
    }
  };

  fetchPopularRecipes();

  return () => {
    ignore = true;
  };
}, [sort]);
  return (
    <>
      {/* Top controls row */}
      <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 gap-md-3">
        <div className="mb-2 mb-md-0">
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="filter-dropdown">
              <Icon.Funnel className="me-1" />
              Filters
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Container>
                <hr />
                <div className="px-3 pb-2">
                  <strong>Dietary Filters</strong>
                    {dietaryOptions.map((tag) => (
                      <Form.Check
                        key={tag}
                        type="checkbox"
                        id={`diet-${tag}`}
                        label={tag.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                        checked={selectedDietary.includes(tag)}
                        onChange={() => toggleDietary(tag)}
                        className="mt-1"
                      />
                    ))}
                    {selectedDietary.length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 mt-2"
                        onClick={() => setSelectedDietary([])}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                <Row className="d-flex flex-column flex-md-row gap-2">
                  {/* Button 1 */}
                  <Col className="mb-2 mt-2">
                    <Button
                      variant={showCanMake ? 'success' : 'outline-dark'}
                      onClick={() => setShowCanMake((v) => !v)}
                    >
                      {showCanMake ? 'Show All Recipes' : 'Show Recipes I Can Make'}
                    </Button>
                  </Col>

                  {/* Button 2 - Placeholder for "within budget" filter */}
                  <Col className="mb-2 mt-2">
                    <Button
                      variant={showWithinBudget ? 'success' : 'outline-dark'}
                      onClick={() => setShowWithinBudget((v) => !v)}
                    >
                      {showWithinBudget ? 'Show All Recipes' : 'Show Recipes Within Budget'}
                    </Button>
                  </Col>

                  {/* Button 3 - Expiring soon filter (issue-165) */}
                  <Col className="mb-2 mt-2">
                    <Button
                      variant={showExpiringFilter ? 'warning' : 'outline-dark'}
                      onClick={() => setShowExpiringFilter((v) => !v)}
                      disabled={expiringNames.size === 0}
                      title={expiringNames.size === 0 ? 'No pantry items expiring soon' : undefined}
                    >
                      <Icon.ClockHistory className="me-1" />
                      {showExpiringFilter ? 'Show All Recipes' : 'Use Expiring Items'}
                    </Button>
                    {expiringNames.size > 0 && (
                      <div className="mt-1">
                        <small className="text-muted">
                          {expiringNames.size} item{expiringNames.size !== 1 ? 's' : ''} expiring soon
                        </small>
                      </div>
                    )}
                  </Col>
                </Row>
              </Container>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="flex-grow-1 d-flex align-items-center justify-content-center mb-2 mb-md-0">
  <div className="d-flex align-items-center" style={{ width: 450 }}>
    
    {/* SEARCH (fixed width) */}
    <Form style={{ width: 350 }}>
      <Form.Control
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </Form>

    {/* SORT (fixed spacing, no influence on search width) */}
    <div className="ms-2">
      <Dropdown align="end">
        <Dropdown.Toggle variant="secondary">
          Sort: {
            sort === 'newest'
              ? 'Newest'
              : sort === 'popular'
              ? 'Most Popular'
              : sort === 'quickest'
              ? 'Quickest'
              : 'A–Z'
          }
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item active={sort === 'newest'} onClick={() => setSort('newest')}>
            Newest
          </Dropdown.Item>
          <Dropdown.Item active={sort === 'popular'} onClick={() => setSort('popular')}>
            Most Popular
          </Dropdown.Item>
          <Dropdown.Item active={sort === 'quickest'} onClick={() => setSort('quickest')}>
            Quickest
          </Dropdown.Item>
          <Dropdown.Item active={sort === 'az'} onClick={() => setSort('az')}>
            A–Z
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>

  </div>
</div>

        <div className="d-flex gap-2 flex-wrap justify-content-center">
          {canAdd && (
            <>
          <Button className="btn-add" onClick={() => setShowAdd(true)}>
            + Add Recipe
          </Button>

          <Button
            variant={editMode ? 'danger' : 'outline-secondary'}
            size="sm"
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? 'Cancel' : 'Edit Recipes'}
          </Button>
         </>
          )}
        </div>
      </div>
      {/* Active dietary filter badges */}
      {selectedDietary.length > 0 && (
      <div className="mb-3 d-flex flex-wrap gap-2">
        {selectedDietary.map((tag) => (
        <Button
          key={tag}
          size="sm"
          variant="outline-success"
          onClick={() => toggleDietary(tag)}
        >
          {tag.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())} ✕
        </Button>
        ))}
      </div>
      )}

      {/* Expiring filter active banner (issue-165) */}
      {showExpiringFilter && (
        <div className="mb-3 d-flex align-items-center gap-2 p-2 rounded" style=
        {{ background: '#fff3cd', border: '1px solid #ffc107' }}>
          <Icon.ClockHistory className="text-warning" />
          <span className="fw-semibold text-warning-emphasis">
            Showing recipes that use your expiring pantry items
          </span>
          <Button
            size="sm"
            variant="outline-warning"
            className="ms-auto"
            onClick={() => setShowExpiringFilter(false)}
          >
            Clear ✕
          </Button>
        </div>
      )}
      {/* Recipe cards */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {displayedRecipes.length > 0 ? (
          displayedRecipes.map((r) => {
            const owner = r.owner ?? 'Shelf Awareness Team';
            const canEdit = canEditRecipe(owner);

            return (
              <Col key={r.id}>
                <RecipeCard
                  id={r.id}
                  title={r.title}
                  description={r.description}
                  imageUrl={r.imageUrl ?? undefined}
                  cuisine={r.cuisine}
                  dietary={Array.isArray(r.dietary) ? r.dietary : r.dietary ? [r.dietary] : []}
                  ingredientItems={r.ingredientItems ?? []}
                  owner={owner}
                  canEdit={canEdit}
                  editMode={editMode}
                  instructions={r.instructions ?? null}
                  servings={r.servings ?? null}
                  prepMinutes={r.prepMinutes ?? null}
                  cookMinutes={r.cookMinutes ?? null}
                  proteinGrams={r.proteinGrams ?? null}
                  carbsGrams={r.carbsGrams ?? null}
                  fatGrams={r.fatGrams ?? null}
                  sourceUrl={r.sourceUrl ?? null}
                  pantryNames={pantryNames}
                  pantryItems={pantryItems}
                  expiringNames={expiringNames}
                  averageRating={r.averageRating ?? null}
                  ratingCount={r.ratingCount ?? 0}
                />
              </Col>
            );
          })
        ) : (
          <div className="text-center w-100 py-4">
            {showExpiringFilter ? (
              <div className="d-flex flex-column align-items-center gap-2">
                <Icon.ClockHistory size={32} className="text-warning" />
                <p className="text-muted mb-0 fw-semibold">No recipes match your expiring pantry items.</p>
                <p className="text-muted small">Try adding more recipes or check back as items approach expiry.</p>
                <Button size="sm" variant="outline-warning" onClick={() => setShowExpiringFilter(false)}>
                  Show all recipes
                </Button>
              </div>
            ) : (
              <p className="text-muted mb-0">
                No recipes found. Try adjusting your filters or search.
              </p>
            )}
          </div>
        )}
      </Row>

      {canAdd && (
        <AddRecipeModal show={showAdd} onHide={() => setShowAdd(false)} />
      )}
    </>
  );
}
