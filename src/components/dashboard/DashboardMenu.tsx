'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BoxSeam,
  CartCheck,
  BookHalf,
} from 'react-bootstrap-icons';
import QuickAlerts from './QuickAlerts';
import TrendingRecipeCard from './TrendingRecipeCard';
import MacroTracker from './MacroTracker';

interface DashboardMenuProps {
  ownerEmail: string;
  recipes: any[];
  produce: any[];
  trendingRecipes: any[];
  proteinGoal: number | null;
  carbsGoal: number | null;
  fatGoal: number | null;
  caloriesGoal: number | null;
}

export default function DashboardMenu({
  ownerEmail,
  recipes,
  produce,
  trendingRecipes,
  proteinGoal,
  carbsGoal,
  fatGoal,
  caloriesGoal,
}: DashboardMenuProps) {
  const parent = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
  const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
  const menuItems = [
    {
      label: 'View Shelf',
      href: '/view-pantry',
      icon: <BoxSeam size={38} />,
      color: 'var(--azure-blue)',
    },
    {
      label: 'Shopping List',
      href: '/shopping-list',
      icon: <CartCheck size={38} />,
      color: 'var(--azure-blue)',
    },
    {
      label: 'Recipes',
      href: '/recipes',
      icon: <BookHalf size={38} />,
      color: 'var(--azure-blue)',
    },
  ];

  return (
    <main>
      <div className="container mobile-section" id="dashboard">
        <div className="row align-items-center text-center mt-5">
          <motion.div variants={parent} initial="hidden" animate="show">
            <motion.h1
              className="fw-bold mb-3"
              style={{ color: 'var(--azure-blue)' }}
              variants={item}
            >
              Welcome to your
              {' '}
              <span style={{ color: 'var(--prussian-blue)' }}>Dashboard</span>
            </motion.h1>

            <motion.p
              className="mb-4"
              style={{
                color: 'var(--hunter-green)',
                fontSize: '1rem',
              }}
              variants={item}
            >
              What would you like to see?
            </motion.p>
          </motion.div>
        </div>

        <MacroTracker
          ownerEmail={ownerEmail}
          proteinGoal={proteinGoal}
          carbsGoal={carbsGoal}
          fatGoal={fatGoal}
          caloriesGoal={caloriesGoal}
        />

        <QuickAlerts ownerEmail={ownerEmail} recipes={recipes} produce={produce} />
        <div className="text-center mt-5 mb-3">
          <h2 className="fw-bold" style={{ color: 'var(--prussian-blue)' }}>
            🔥 Trending Recipes
          </h2>
          <p style={{ color: 'var(--hunter-green)', fontSize: '0.95rem' }}>
            The most-made recipes curated by the Shelf Awareness team!
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch',
          }}
        >
          {trendingRecipes.length > 0 ? (
            trendingRecipes.map((recipe, index) => (
              <motion.div key={recipe.id} variants={item}>
                <TrendingRecipeCard
                  id={recipe.id}
                  title={recipe.title}
                  description={recipe.description}
                  imageUrl={recipe.imageUrl}
                  cookCount={recipe.cookCount}
                  rank={index + 1}
                  averageRating={recipe.averageRating ?? null}
                  ratingCount={recipe.ratingCount ?? 0}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              variants={item}
              className="text-center"
              style={{
                gridColumn: '1 / -1',
                background: 'white',
                borderRadius: '18px',
                padding: '2rem',
                boxShadow: '0 6px 14px rgba(0, 0, 0, 0.08)',
              }}
            >
              <p className="mb-0 text-muted">No trending recipes yet.</p>
            </motion.div>
          )}
        </div>

        {/* Dashboard cards */}
        <motion.div
          className="grid gap-4 mt-5 mb-5 mobile-grid"
          variants={parent}
          initial="hidden"
          animate="show"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            justifyItems: 'center',
          }}
        >
          {menuItems.map((itemData) => (
            <motion.div
              key={itemData.href}
              className="mobile-card"
              variants={item}
              whileHover={{
                scale: 1.06,
                y: -5,
              }}
              transition={{ duration: 0.15 }}
              style={{
                background: itemData.color,
                color: 'white',
                borderRadius: '22px',
                padding: '2.5rem 1rem',
                width: '100%',
                maxWidth: '320px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 14px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.25s ease',
              }}
            >
              <Link
                href={itemData.href}
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '50%',
                    padding: '0.75rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'background-color 0.25s',
                  }}
                >
                  {itemData.icon}
                </div>
                <span style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                }}
                >
                  {itemData.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
