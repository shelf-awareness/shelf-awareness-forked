'use client';
import { DietaryCategory } from '@prisma/client';
import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { createRecipe } from '@/lib/recipes';
import ImagePickerModal from '@/components/images/ImagePickerModal';
import '@/styles/buttons.css';
import { set } from 'react-hook-form';

const dietaryOptions: DietaryCategory[] = [
  DietaryCategory.VEGAN,
  DietaryCategory.VEGETARIAN,
  DietaryCategory.KETO,
  DietaryCategory.GLUTEN_FREE,
  DietaryCategory.HIGH_PROTEIN,
  DietaryCategory.LOW_CARB,
];

type Props = {
  show: boolean;
  onHide: () => void;
};

export default function AddRecipeModal({ show, onHide }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dietary, setDietary] = useState<string[]>([]);
  const [ingredientText, setIngredientText] = useState(''); // multiline "qty unit name"

  // new fields
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState<number | ''>('');
  const [prepMinutes, setPrepMinutes] = useState<number | ''>('');
  const [cookMinutes, setCookMinutes] = useState<number | ''>('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [proteinGrams, setProteinGrams] = useState<number | ''>('');
  const [carbsGrams, setCarbsGrams] = useState<number | ''>('');
  const [fatGrams, setFatGrams] = useState<number | ''>('');

  // image picker modal
  const [showPicker, setShowPicker] = useState(false);
  const [imageAlt, setImageAlt] = useState('');

  const handleReset = useCallback(() => {
    setTitle('');
    setCuisine('');
    setDescription('');
    setImageUrl('');
    setDietary(['']);
    setIngredientText('');
    setInstructions('');
    setServings('');
    setPrepMinutes('');
    setCookMinutes('');
    setProteinGrams('');
    setCarbsGrams('');
    setFatGrams('');

    setSourceUrl('');
    setImageAlt('');
  }, []);


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

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErr(null);

      // Parse ingredientText → ingredientItems (same logic as EditRecipeModal)
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
            substitutes: subs,
            quantityValue: quantity,
            quantityUnit: unit,
            order: index,
};
          }

          // fallback: entire line is name only
          const { main, subs } = splitNameAndSubs(line);

          return {
            name: main,
            substitutes: subs,
            quantityValue: null,
            quantityUnit: null,
            order: index,
          };
        });

      try {
        const dietaryMap: Record<string, DietaryCategory> = {
        vegan: DietaryCategory.VEGAN,
        vegetarian: DietaryCategory.VEGETARIAN,
        keto: DietaryCategory.KETO,
        'gluten-free': DietaryCategory.GLUTEN_FREE,
        'high-protein': DietaryCategory.HIGH_PROTEIN,
        'low-carb': DietaryCategory.LOW_CARB,
        };
        const dietaryEnums = dietary
        .map((s) => s.trim().toLowerCase())
        .map((tag) => dietaryMap[tag])
        .filter(Boolean); // remove any invalid/undefined

        await createRecipe({
          title,
          cuisine,
          description,
          imageUrl,
          dietary: dietaryEnums,
          ingredientItems: normalizedIngredientItems,
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
          handleReset();
          onHide();
        });
      } catch (error: any) {
        setErr(error?.message ?? 'Failed to create recipe');
      }
    },
    [
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
      handleReset,
      onHide,
    ],
  );

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add a New Recipe</Modal.Title>
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
                  as="select"
                  multiple
                  value={dietary}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                      (opt) => (opt as any).value,
                    );
                    setDietary(selected);
                  }}
                  
                >
                  {dietaryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                    </option>
                  ))}
                </Form.Select>
                  <Form.Text className="text-muted">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple
                  </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* INGREDIENT TEXTAREA – same UX as edit modal */}
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
              If you want to add substitutes, use a slash to separate them:
              <br />
              Examples:
              <br />
              <code>1 cup onion/shallots</code>
              <br />
              <code>2 pcs tomatoes/red peppers</code>
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
                  onChange={(e) => setServings(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )}
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
                  onChange={(e) => setPrepMinutes(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )}
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
                  onChange={(e) => setCookMinutes(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )}
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
                  onChange={(e) => setProteinGrams(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )}
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
                  onChange={(e) => setCarbsGrams(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )}
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
                  onChange={(e) => setFatGrams(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )}
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
              {isPending ? 'Saving…' : 'Submit'}
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
