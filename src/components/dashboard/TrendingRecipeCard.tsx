/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

type TrendingRecipeCardProps = {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  cookCount: number;
  rank: number;
  averageRating?: number | null;
  ratingCount?: number;
};

export default function TrendingRecipeCard({
  id,
  title,
  description,
  imageUrl,
  cookCount,
  rank,
  averageRating = null,
  ratingCount = 0,
}: TrendingRecipeCardProps) {
    const renderStars = (rating: number) => {
    const normalized = Math.round(rating * 2) / 2;
    const full = Math.floor(normalized);
    const hasHalf = normalized % 1 !== 0;

    let stars = '';

    for (let i = 0; i < full; i++) stars += '★';
    if (hasHalf) stars += '⯨';
    for (let i = stars.length; i < 5; i++) stars += '☆';

    return stars;
  };
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.18 }}
      style={{
        background: 'white',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 6px 14px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        height: '100%',
        cursor: 'pointer',
      }}
    >
      <Link
        href={`/recipes/${id}`}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
          height: '100%',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '180px',
            overflow: 'hidden',
          }}
        >
          <img
            src={imageUrl || 'https://placehold.co/800x600?text=Recipe'}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(0, 0, 0, 0.72)',
              color: 'white',
              borderRadius: '999px',
              padding: '0.35rem 0.7rem',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            #{rank}
          </div>
        </div>

        <div style={{ padding: '1rem 1rem 1.1rem' }}>
          <h5
            className="fw-bold mb-2"
            style={{
              color: 'var(--prussian-blue)',
              fontSize: '1.1rem',
            }}
          >
            {title}
          </h5>
                      <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginBottom: '0.65rem',
            }}
          >
            <span
              style={{
                color: '#f5c518',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                lineHeight: 1,
              }}
            >
              {ratingCount > 0 ? renderStars(averageRating ?? 0) : '☆☆☆☆☆'}
            </span>

            <span
              style={{
                color: '#5f6b7a',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              {ratingCount > 0
                ? `${(averageRating ?? 0).toFixed(1)} (${ratingCount})`
                : 'No ratings yet'}
            </span>
          </div>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--azure-blue)',
              color: 'white',
              borderRadius: '999px',
              padding: '0.3rem 0.7rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            {cookCount} made
          </div>

          {description && (
            <p
              className="mb-0"
              style={{
                color: '#5f6b7a',
                fontSize: '0.95rem',
                lineHeight: 1.5,
              }}
            >
              {description.length > 90
                ? `${description.slice(0, 90)}...`
                : description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}