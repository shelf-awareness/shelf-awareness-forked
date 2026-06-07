'use client';

import {
  Modal,
  Button,
  Form,
  Alert,
  Row,
  Col,
  InputGroup,
  Image as RBImage,
} from 'react-bootstrap';
import { useState, useTransition, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DietaryCategory } from '@prisma/client';
import ImagePickerModal from '@/components/images/ImagePickerModal';
import { updateRecipe } from '@/lib/recipes';
import '@/styles/buttons.css';

// Your schema stores substitutes as a single string (RecipeIngredient.substitutes String?)
// We'll encode/decode as: "pepperoni|salami|ham"
const splitNameAndSubs = (raw: string) => {
  const parts = raw
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    main: parts[0] ?? '',
    subs: parts.slice(1),
  };
};

const decodeSubs = (s?: string | null): string[] => {
  if (!s) return [];

  const parts = s.includes('|') ? s.split('|') : s.split(',');
  return parts.map((x) => x.trim()).filter(Boolean);
};

type EditRecipeModalProps = {
  show: boolean;
  onHide: () => void;
  recipe: {
    id: number;
    title: string;
    cuisine: string;
    description: string;
    imageUrl: string;
    dietary: string[];
    ingredientItems: {
      id?: number;
      name: string;
      quantity: number | null;
      unit: string | null;
      order?: number | null;
      substitutes?: string | null; // ✅ matches Prisma schema
    }[];
    instructions?: string | null;
    servings?: number | null;
    prepMinutes?: number | null;
    cookMinutes?: number | null;
    proteinGrams?: number | null;
    carbsGrams?: number | null;
    fatGrams?: number | null;
    sourceUrl?: string | null;
  };
};

function buildIngredientText(
  items: EditRecipeModalProps['recipe']['ingredientItems'],
) {
  return (items ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((i) => {
      const subs = decodeSubs(i.substitutes);
      const suffix = subs.length ? `/${subs.join('/')}` : '';
      const nameWithSubs = `${i.name}${suffix}`;

      return `${i.quantity ?? ''} ${i.unit ?? ''} ${nameWithSubs}`
        .trim()
        .replace(/\s+/g, ' ');
    })
    .join('\n');
}

export default function EditRecipeModal({ show, onHide, recipe }: EditRecipeModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // Local form state (prefilled)
  const [title, setTitle] = useState(recipe.title);
  const [cuisine, setCuisine] = useState(recipe.cuisine);
  const [description, setDescription] = useState(recipe.description || '');
  const [imageUrl, setImageUrl] = useState(recipe.imageUrl || '');
  const [dietary, setDietary] = useState<string[]>(recipe.dietary ?? []);

  // ✅ ingredientText shows name/subs as "pizza/pepperoni"
  const [ingredientText, setIngredientText] = useState(
    buildIngredientText(recipe.ingredientItems ?? []),
  );

  const [instructions, setInstructions] = useState(recipe.instructions || '');
  const [servings, setServings] = useState<number | ''>(recipe.servings ?? '');
  const [prepMinutes, setPrepMinutes] = useState<number | ''>(recipe.prepMinutes ?? '');
  const [cookMinutes, setCookMinutes] = useState<number | ''>(recipe.cookMinutes ?? '');
  const [proteinGrams, setProteinGrams] = useState<number | ''>(recipe.proteinGrams ?? '');
  const [carbsGrams, setCarbsGrams] = useState<number | ''>(recipe.carbsGrams ?? '');
  const [fatGrams, setFatGrams] = useState<number | ''>(recipe.fatGrams ?? '');
  const [sourceUrl, setSourceUrl] = useState(recipe.sourceUrl || '');

  // image picker modal
  const [showPicker, setShowPicker] = useState(false);
  const [imageAlt, setImageAlt] = useState('');

  // If the recipe prop changes while modal is open, re-sync state
  useEffect(() => {
    setTitle(recipe.title);
    setCuisine(recipe.cuisine);
    setDescription(recipe.description || '');
    setImageUrl(recipe.imageUrl || '');
    setDietary(recipe.dietary ?? []);
    setIngredientText(buildIngredientText(recipe.ingredientItems ?? []));
    setInstructions(recipe.instructions || '');
    setServings(recipe.servings ?? '');
    setPrepMinutes(recipe.prepMinutes ?? '');
    setCookMinutes(recipe.cookMinutes ?? '');
    setProteinGrams(recipe.proteinGrams ?? '');
    setCarbsGrams(recipe.carbsGrams ?? '');
    setFatGrams(recipe.fatGrams ?? '');
    setSourceUrl(recipe.sourceUrl || '');
  }, [recipe]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErr(null);

      // Parse ingredientText → ingredientItems
      // Stores substitutes as a pipe-separated string in `substitutes`
      const normalizedIngredientItems = ingredientText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const parts = line.split(/\s+/);

          const qty = Number(parts[0]);
          const hasNumericQty = !Number.isNaN(qty);

          if (hasNumericQty && parts.length >= 3) {
            const quantity = qty;
            const unit = parts[1];
            const rawName = parts.slice(2).join(' ');
            const { main, subs } = splitNameAndSubs(rawName);

            return {
              name: main,
              substitutes: subs.map((x) => x.trim()).filter(Boolean).join('|') || null,
              quantity,
              unit,
              order: index,
            };
          }

          const { main, subs } = splitNameAndSubs(line);

          return {
            name: main,
            substitutes: subs.map((x) => x.trim()).filter(Boolean).join('|') || null,
            quantity: null,
            unit: null,
            order: index,
          };
        });

      try {
        await updateRecipe(recipe.id, {
          title,
          cuisine,
          description,
          imageUrl,
          dietary: dietary.map((d) => d as DietaryCategory),
          ingredientItems: normalizedIngredientItems as any, // if TS complains, fix RecipeInput type later
          instructions,
          servings: servings === '' ? undefined : Number(servings),
          prepMinutes: prepMinutes === '' ? undefined : Number(prepMinutes),
          cookMinutes: cookMinutes === '' ? undefined : Number(cookMinutes),
          proteinGrams: proteinGrams === '' ? undefined : Number(proteinGrams),
          carbsGrams: carbsGrams === '' ? undefined : Number(carbsGrams),
          fatGrams: fatGrams === '' ? undefined : Number(fatGrams),
          sourceUrl: sourceUrl || undefined,
        });

        startTransition(() => {
          router.refresh();
          onHide();
        });
      } catch (error: any) {
        setErr(error?.message ?? 'Failed to update recipe');
      }
    },
    [
      recipe.id,
      title,
      cuisine,
      description,
      imageUrl,
      dietary,
      ingredientText,
      instructions,
      servings,
      prepMinutes,
      cookMinutes,
      proteinGrams,
      carbsGrams,
      fatGrams,
      sourceUrl,
      router,
      onHide,
    ],
  );

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Recipe</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  value={title}
                  placeholder="e.g., Spaghetti Bolognese"
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cuisine *</Form.Label>
                <Form.Control
                  value={cuisine}
                  placeholder="e.g., Italian, Mexican, Chinese"
                  onChange={(e) => setCuisine(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="A brief description of the recipe"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <InputGroup>
                  <Form.Control
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://…"
                  />
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => setShowPicker(true)}
                  >
                    Pick image
                  </Button>
                </InputGroup>
                {imageAlt && (
                  <Form.Text className="text-muted">
                    Alt:
                    {imageAlt}
                  </Form.Text>
                )}
                {imageUrl && (
                  <div className="mt-2">
                    <RBImage
                      src={imageUrl}
                      alt={imageAlt || 'Preview'}
                      style={{
                        maxHeight: 140,
                        borderRadius: 8,
                        objectFit: 'cover',
                      }}
                      thumbnail
                    />
                  </div>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dietary</Form.Label>
                <Form.Select
                  multiple
                  value={dietary}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                      (opt) => opt.value,
                    );
                    setDietary(selected);
                  }}
                >
                  <option value="VEGAN">Vegan</option>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="KETO">Keto</option>
                  <option value="GLUTEN_FREE">Gluten-Free</option>
                  <option value="HIGH_PROTEIN">High-Protein</option>
                  <option value="LOW_CARB">Low-Carb</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* INGREDIENT TEXTAREA */}
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">Ingredients</Form.Label>
            <Form.Text className="d-block ps-3 mb-2 text-muted">
              Enter one ingredient per line, in the format:
              <br />
              <code>quantity unit name</code>
              <br />
              Examples:
              <br />
              <code>1 cup sugar</code>
              <br />
              <code>2 tbsp olive oil</code>
              <br />
              You can add substitutes like:
              <br />
              <code>1 cup pizza/pepperoni</code>
            </Form.Text>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder={'1 cup onion\n2 pcs tomatoes\n1 tsp basil'}
              value={ingredientText}
              onChange={(e) => setIngredientText(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Instructions (one step per line)</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              placeholder={'1. Preheat oven...\n2. Mix the dry ingredients...\n3. ...'}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <Form.Text className="text-muted">
              Line breaks will be preserved on the recipe page.
            </Form.Text>
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Servings</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 2, 4, 6"
                  min={0}
                  value={servings}
                  onChange={(e) =>
                    setServings(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Prep (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 15, 20, 25"
                  min={0}
                  value={prepMinutes}
                  onChange={(e) =>
                    setPrepMinutes(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Cook (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 15, 30, 45"
                  min={0}
                  value={cookMinutes}
                  onChange={(e) =>
                    setCookMinutes(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Protein (grams per serving)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 1, 5, 10"
                  min={0}
                  value={proteinGrams}
                  onChange={(e) =>
                    setProteinGrams(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Carbs (grams per serving)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 2, 4, 8"
                  min={0}
                  value={carbsGrams}
                  onChange={(e) =>
                    setCarbsGrams(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Fat (grams per serving)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 3, 6, 9"
                  min={0}
                  value={fatGrams}
                  onChange={(e) =>
                    setFatGrams(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Source URL (optional)</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com/recipe"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-between mt-3">
            <Button type="submit" className="btn-add" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button variant="secondary" type="button" onClick={onHide}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>

      {/* Image picker modal */}
      <ImagePickerModal
        show={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(url, meta) => {
          setImageUrl(url);
          if (meta?.alt) setImageAlt(meta.alt);
        }}
      />
    </Modal>
  );
}