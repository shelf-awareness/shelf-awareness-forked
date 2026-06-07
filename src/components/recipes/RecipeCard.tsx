'use client';

/* eslint-disable react/require-default-props */
/* eslint-disable no-alert */

import Link from 'next/link';
import { Card, Image, Badge, Button, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import React from 'react';
import EditRecipeModal from '@/components/recipes/EditRecipeModal';
import { PencilSquare, Trash, ClockHistory } from 'react-bootstrap-icons';
import { convertUnits } from '@/lib/unitConverter';
import { QuantityUnit } from '@prisma/client';

export type IngredientItemCard = {
  id?: number;
  name: string;
  quantity: number | null;
  unit: string | null;
};

export type RecipeCardProps = {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  cuisine: string;
  dietary: string[];
  ingredientItems: IngredientItemCard[]; // ← REQUIRED NOW
  owner: string | string[];
  canEdit: boolean;
  editMode: boolean;
  instructions?: string | null;
  servings?: number | null;
  prepMinutes?: number | null;
  cookMinutes?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;
  sourceUrl?: string | null;
  pantryNames: Set<string>;
  pantryItems: {
  name: string;
  quantity: number;
  unit: QuantityUnit | null;
}[]
  expiringNames?: Set<string>;
  averageRating?: number | null;
  ratingCount?: number;
  onSelect?: (recipe: { id: number; title: string; ingredientItems: IngredientItemCard[] }) => void;
};

export default function RecipeCard({
  id,
  title,
  description = null,
  imageUrl = null,
  cuisine,
  dietary,
  ingredientItems,
  owner,
  canEdit,
  editMode,
  instructions = null,
  servings = null,
  prepMinutes = null,
  cookMinutes = null,
  proteinGrams = null,
  carbsGrams = null,
  fatGrams = null,
  sourceUrl = null,
  pantryNames,
  pantryItems,
  expiringNames = new Set(),
  averageRating = null,
  ratingCount = 0,
  onSelect,
}: RecipeCardProps) {
  const dietTags = Array.isArray(dietary) ? dietary.filter(Boolean) : [];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    if (!canEdit) return;

    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete recipe');

      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Something went wrong while deleting the recipe.');
    } finally {
      setLoading(false);
    }
  };

  const isAdminOwner = Array.isArray(owner)
    ? owner.includes('admin@foo.com')
    : owner === 'admin@foo.com';

  const ownerLabel = Array.isArray(owner) ? owner.join(', ') : owner;
  const displayOwner = isAdminOwner ? 'Shelf Awareness Team' : ownerLabel;
  const renderStars = (rating: number) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  let stars = '';

  for (let i = 0; i < full; i++) {
    stars += '★';
  }

  if (hasHalf) {
    stars += '⯨'; // half star-ish character
  }

  const remaining = 5 - full - (hasHalf ? 1 : 0);

  for (let i = 0; i < remaining; i++) {
    stars += '☆';
  }

  return stars;
};

  return (
    <>
      <Card
        className={`recipe-card h-100 d-flex flex-column shadow-sm position-relative ${
          !editMode ? 'clickable-card' : ''
        }`}
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!editMode) {
            if (onSelect) {
              onSelect({ id, title, ingredientItems });
            } else {
              router.push(`/recipes/${id}`);
            }
          }
        }}
        onKeyDown={(e) => {
          if (!editMode && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            if (onSelect) {
              onSelect({ id, title, ingredientItems });
            } else {
              router.push(`/recipes/${id}`);
            }
          }
        }}
      >
        <div className="position-relative">
          <Image
            src={imageUrl || 'https://placehold.co/800x450?text=Recipe'}
            alt={title}
            className="w-100 recipe-card-img"
          />
          {/* Expiring items banner on card image (issue-165) */}
          {ingredientItems.some((item) => expiringNames.has(item.name.toLowerCase())) && (
            <div
              className="position-absolute bottom-0 start-0 end-0 d-flex align-items-center gap-1 px-2 py-1"
              style={{ background: 'rgba(255, 193, 7, 0.92)', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <ClockHistory size={13} />
              Uses expiring pantry items
            </div>
          )}
        </div>

        <Card.Body className="d-flex flex-column">
          <div className="flex-grow-1">
            <Card.Title className="recipe-title line-clamp-2">
              <Link
                href={`/recipes/${id}`}
                className="text-decoration-none text-reset"
                onClick={(e) => e.stopPropagation()}
              >
                {title}
              </Link>
            </Card.Title>
            <div className="mb-2 d-flex align-items-center gap-2">
              <span
                style={{
                  color: '#f5c518',
                  fontSize: '0.95rem',
                  letterSpacing: '1px',
                  lineHeight: 1,
                }}
              >
                {ratingCount > 0 ? renderStars(averageRating ?? 0) : '☆☆☆☆☆'}
              </span>

              <small className="text-muted">
                {ratingCount > 0
                  ? `${(averageRating ?? 0).toFixed(1)} (${ratingCount})`
                  : 'No ratings yet'}
              </small>
            </div>
            {/* Cuisine + Dietary badges */}
            <div>
              <Badge bg="secondary" pill className="me-2 mb-2">
                {cuisine}
              </Badge>
              {dietTags.map((tag) => (
                <Badge key={tag} bg="secondary" pill className="me-2 mb-2">
                  {tag.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
              ))}
            </div>

            <div className="mb-2">
              <Badge bg="light" text="dark">
                {'Made By: '}
                {displayOwner}
              </Badge>
            </div>

            {description && (
              <Card.Text className="text-muted line-clamp-3 mb-2">
                {description}
              </Card.Text>
            )}

            {/* INGREDIENT ITEMS */}
            {ingredientItems.length > 0 && (
              <div className="mt-2">
                <span className="fw-semibold">Ingredients:</span>

                <div className="mt-1 d-flex flex-wrap gap-2">
                {ingredientItems.map((item) => {
                    const hasItem = pantryNames.has(item.name.toLowerCase());
                    const isExpiring = expiringNames.has(item.name.toLowerCase());
                    let hasEnough = false;
                    let convertedUnit = 0;
                    for (let p of pantryItems){
                      if (hasItem && p.name.toLowerCase() === item.name.toLowerCase()){
                        convertedUnit += convertUnits(p.quantity, p.unit, item.unit);
                         
                      }
                    }
                    if (hasItem && typeof item.quantity === 'number' && convertedUnit >= item.quantity) {
                      hasEnough = true;
                    }

                    // Determine badge color: expiring takes priority over normal in-pantry state
                    const badgeBg = isExpiring
                      ? 'warning'
                      : !hasItem
                        ? 'danger'
                        : hasEnough
                          ? 'success'
                          : 'warning';

                    const badge = (
                      <Badge
                        key={`${id}-${item.id ?? item.name}`}
                        pill
                        bg={badgeBg}
                        text={badgeBg === 'warning' ? 'dark' : undefined}
                        className="px-2 py-1 d-inline-flex align-items-center gap-1"
                      >
                        {isExpiring && <ClockHistory size={10} />}
                        {item.name}
                      </Badge>
                    );

                    return isExpiring ? (
                      <OverlayTrigger
                        key={`${id}-${item.id ?? item.name}`}
                        placement="top"
                        overlay={<Tooltip>Expiring soon – use it up!</Tooltip>}
                      >
                        <span>{badge}</span>
                      </OverlayTrigger>
                    ) : badge;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 d-flex flex-column gap-2">
            {editMode && canEdit && (
              <Row>
                <Col xs={6}>
                  <Button
                    variant="primary"
                    className="btn-edit w-100 py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEdit(true);
                    }}
                  >
                    <PencilSquare color="white" size={18} />
                  </Button>
                </Col>
                <Col xs={6}>
                  <Button
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={loading}
                    className="btn-delete w-100 py-2"
                  >
                    {loading ? 'Deleting…' : <Trash color="white" size={18} />}
                  </Button>
                </Col>
              </Row>
            )}
          </div>
        </Card.Body>
      </Card>

      {canEdit && (
        <EditRecipeModal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          recipe={{
            id,
            title,
            cuisine,
            description: description ?? '',
            imageUrl: imageUrl ?? '',
            dietary: dietary,
            ingredientItems,
            instructions: instructions ?? '',
            servings: servings ?? undefined,
            prepMinutes: prepMinutes ?? undefined,
            cookMinutes: cookMinutes ?? undefined,
            proteinGrams: proteinGrams ?? undefined,
            carbsGrams: carbsGrams ?? undefined,
            fatGrams: fatGrams ?? undefined,
            sourceUrl: sourceUrl ?? '',
          }}
        />
      )}
    </>
  );
}
