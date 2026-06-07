'use client';

import { useEffect, useState, useCallback } from 'react';
import { Modal, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { getRecipes } from '@/lib/recipes';
import { getUserProduceByEmail, createShoppingListFromRecipe } from '@/lib/dbActions';
import RecipeCard from './RecipeCard';
import { IngredientItemCard } from './RecipeCard';
import { ShoppingListWithProtein } from '../../types/shoppingList';
import { QuantityUnit } from '@prisma/client';  

interface RecipesModalProps {
  show: boolean;
  onHide: () => void;
  onListCreated: (newList: ShoppingListWithProtein) => void;
}

type PantryItem = {
  name: string;
  quantity: number;
  unit: QuantityUnit | null;
};

type PendingRecipe = {
  id: number;
  title: string;
  ingredientItems: IngredientItemCard[];
};


export default function RecipesModal({ show, onHide, onListCreated }: RecipesModalProps) {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingRecipe, setPendingRecipe] = useState<PendingRecipe | null>(null);

  useEffect(() => {
    if (!show) {
      setSuccessMessage(null);
      setErrorMessage(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedRecipes, fetchedProduce] = await Promise.all([
          getRecipes(),
          session?.user?.email
            ? getUserProduceByEmail(session.user.email)
            : Promise.resolve([]),
        ]);
        setRecipes(fetchedRecipes);
        setPantryItems(fetchedProduce);
      } catch (err) {
        console.error('Failed to fetch recipes or pantry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [show, session?.user?.email]);

  // Called when a card is clicked — opens the confirmation modal
  const handleSelect = useCallback((recipe: PendingRecipe) => {
    setPendingRecipe(recipe);
  }, []);

  // Called when user confirms in the confirmation modal
  const handleConfirm = useCallback(async () => {
    const email = session?.user?.email;
    if (!email || !pendingRecipe) return;

    setPendingRecipe(null);
    setCreating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const list = await createShoppingListFromRecipe({
        owner: email,
        recipeName: pendingRecipe.title,
        ingredients: pendingRecipe.ingredientItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
        })),
      });
      onListCreated({ ...list, totalProtein: 0 });
      setSuccessMessage(`Shopping list "${list.name}" created successfully!`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message ?? 'Failed to create shopping list.');
    } finally {
      setCreating(false);
    }
  }, [session?.user?.email, pendingRecipe, onListCreated]);

  const pantryNames = new Set(pantryItems.map((p) => p.name.toLowerCase()));

  return (
    <>
      {/* Main recipes modal */}
      <Modal show={show} onHide={onHide} size="xl" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Your Recipes</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert variant="danger" dismissible onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          {!loading && recipes.length > 0 && (
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              Click a recipe card to create a shopping list from its ingredients.
            </p>
          )}

          {creating && (
            <div className="d-flex justify-content-center align-items-center py-3">
              <Spinner animation="border" role="status" size="sm" className="me-2" />
              <span>Creating shopping list...</span>
            </div>
          )}

          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : recipes.length === 0 ? (
            <p className="text-center text-muted py-4">No recipes found.</p>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {recipes.map((r) => {
                const owner = r.owner ?? 'Pantry Pals Team';
                return (
                  <Col key={r.id}>
                    <RecipeCard
                      id={r.id}
                      title={r.title}
                      description={r.description ?? null}
                      imageUrl={r.imageUrl ?? null}
                      cuisine={r.cuisine}
                      dietary={r.dietary ?? []}
                      ingredientItems={r.ingredientItems ?? []}
                      owner={owner}
                      canEdit={false}
                      editMode={false}
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
                      onSelect={handleSelect}
                    />
                  </Col>
                );
              })}
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* Confirmation modal */}
      <Modal show={!!pendingRecipe} onHide={() => setPendingRecipe(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Shopping List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pendingRecipe && (
            <p>
              Create a shopping list from <strong>{pendingRecipe.title}</strong>?
              {pendingRecipe.ingredientItems.length > 0
                ? ` It will include ${pendingRecipe.ingredientItems.length} 
                ingredient${pendingRecipe.ingredientItems.length === 1 ? '' : 's'}.`
                : ' This recipe has no ingredients.'}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPendingRecipe(null)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            style={{ backgroundColor: 'var(--fern-green)', border: 'none' }}
          >
            Create List
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
