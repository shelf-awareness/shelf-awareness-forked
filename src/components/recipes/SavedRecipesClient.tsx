"use client";

import { useEffect, useMemo, useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useSession } from "next-auth/react";
import RecipeCard from "./RecipeCard";
import UnsaveButton from "@/components/recipes/UnsaveButton";
import { QuantityUnit } from "@prisma/client";

export default function SavedRecipesClient() {
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email ?? null;
  type PantryItem = {
    name: string;
    quantity: number;
    unit: QuantityUnit | null;
  };
  const [recipes, setRecipes] = useState<any[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const dietaryOptions = [
  "VEGAN",
  "VEGETARIAN",
  "KETO",
  "GLUTEN_FREE",
  "HIGH_PROTEIN",
  "LOW_CARB",
  ];

  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  const toggleDietary = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };
  // Quick lookup for names
  const pantryNames = useMemo(
    () => new Set(pantry.map((p) => p.name.toLowerCase())),
    [pantry]
  );

  useEffect(() => {
    if (!currentUserEmail) return;

    const loadData = async () => {
      try {
        // 1️⃣ Fetch saved recipes
        const savedRes = await fetch(`/api/saved-recipes?owner=${encodeURIComponent(currentUserEmail)}`);
        if (!savedRes.ok) throw new Error(await savedRes.text());
        const savedData = await savedRes.json();
        setRecipes(Array.isArray(savedData) ? savedData : []);

        // 2️⃣ Fetch full produce items for pantry
        const pantryRes = await fetch(`/api/produce?owner=${encodeURIComponent(currentUserEmail)}`);
        if (!pantryRes.ok) throw new Error(await pantryRes.text());
        const pantryData = await pantryRes.json();

        const mappedPantry: PantryItem[] = Array.isArray(pantryData)
          ? pantryData.map((p: any) => ({
            name: p.name,
            quantity: p.quantityValue,
            unit: p.quantityUnit,
          }))
        : [];

        setPantry(mappedPantry);
      } catch (error) {
        console.error("SavedRecipesClient load error:", error);
      }
    };

    loadData();
  }, [currentUserEmail]);

  // Filter recipes by search
  const filteredRecipes = useMemo(() => {
    let base = recipes;

    // Dietary filter first
    if (selectedDietary.length > 0) {
      base = base.filter((r) => {
        const recipeDietary = Array.isArray(r.dietary)
          ? r.dietary
          : r.dietary
          ? [r.dietary]
          : [];

        const normalized = recipeDietary.map((d: string) =>
          d.toUpperCase()
        );

        return selectedDietary.every((tag) =>
          normalized.includes(tag.toUpperCase())
      );
    });
  }

  const query = search.toLowerCase().trim();
  if (!query) return base;

  return base.filter((r) => {
    const titleMatch = (r.title ?? "").toLowerCase().includes(query);
    const cuisineMatch = (r.cuisine ?? "").toLowerCase().includes(query);
    const dietaryMatch = (r.dietary ?? []).some((tag: string) =>
      tag.toLowerCase().includes(query)
    );
    const ingredientMatch = (r.ingredientItems ?? []).some((item: any) =>
      (item.name ?? "").toLowerCase().includes(query)
    );

    return titleMatch || cuisineMatch || dietaryMatch || ingredientMatch;
  });
}, [recipes, search, selectedDietary]);

  const removeFromUI = (recipeId: number) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  if (!currentUserEmail) {
    return <p className="text-muted">Sign in to view your saved recipes.</p>;
  }

  return (
    <>
      {/* Search + Edit */}
      <Row className="mb-3 align-items-center g-2">
        <Col md={3} className="d-none d-md-block" />
          <Col xs={12} md={6} className="d-flex flex-column align-items-center">
            {/* Search Bar */}
            <Form style={{ width: "100%", maxWidth: 400 }}>
              <Form.Control
                type="text"
                placeholder="Search saved recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Form>
            {/* Dietary Filter Pills */}
            <div className="d-flex flex-wrap gap-2 mt-2 justify-content-center">
              {dietaryOptions.map((tag) => (
              <Button
                key={tag}
                size="sm"
                className="rounded-pill"
                variant={
                selectedDietary.includes(tag)
                ? "success"
                : "outline-secondary"
                }
                onClick={() => toggleDietary(tag)}
              >
               {tag.replace("_", " ")}
              </Button>
              ))}
            </div>
          </Col>
        <Col xs={12} md={3} className="d-flex justify-content-center justify-content-md-end">
          <Button
            variant={editMode ? "danger" : "outline-secondary"}
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? "Done" : "Edit Saved"}
          </Button>
        </Col>
      </Row>

      {/* Recipe Cards */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((r) => (
            <Col key={r.id}>
              <div className={`saved-card-wrap ${editMode ? "is-edit" : ""}`}>
                <RecipeCard
                  id={r.id}
                  title={r.title}
                  description={r.description}
                  imageUrl={r.imageUrl ?? undefined}
                  cuisine={r.cuisine}
                  dietary={Array.isArray(r.dietary) ? r.dietary : r.dietary ? [r.dietary] : []}
                  ingredientItems={r.ingredientItems ?? []}
                  owner={r.owner ?? "Pantry Pals Team"}
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
                  pantryItems={pantry} // ✅ full Produce[]
                />

                {editMode && (
                  <div className="saved-card-footer">
                    <UnsaveButton
                      recipeId={r.id}
                      ownerEmail={currentUserEmail}
                      onRemoved={removeFromUI}
                    />
                  </div>
                )}
              </div>
            </Col>
          ))
        ) : (
          <p className="text-center text-muted w-100 py-4">
            No saved recipes found.
          </p>
        )}
      </Row>
    </>
  );
}
