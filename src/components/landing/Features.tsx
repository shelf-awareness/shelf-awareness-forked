'use client';

import Image from 'next/image';

const features = [
  {
    title: 'Track Your Pantry Shelf',
    description:
      'Easily keep track of your pantry, fridge, freezer, and spices, so you always know what you have.',
    icon: '/trackpantry.png',
  },
  {
    title: 'Reduce Food Waste',
    description:
      'Get expiration reminders and suggestions to finish food before it spoils.',
    icon: '/reducewaste.png',
  },
  {
    title: 'Generate Shopping Lists',
    description:
      'Automatically create shopping lists based on low or missing items in your pantry.',
    icon: '/shoppinglist.png',
  },
  {
    title: 'Discover Recipes',
    description:
      'Find recipes based on ingredients you already have, reducing waste and meal prep stress.',
    icon: '/discovery.png',
  },
];

export default function Features() {
  return (
    <section className="features-section">
      <div className="features-grid">
        {features.map((feature) => (
          <div key={feature.title} className="feature-card hover-card">
            <Image
              src={feature.icon}
              alt={feature.title}
              width={212}
              height={116}
              className="feature-icon"
            />

            <h3 className="feature-title">{feature.title}</h3>

            <p className="feature-description">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .features-section {
          padding: 6rem 2rem;
          background-color: var(--timberwolf);
        }

        .features-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2.5rem;
        }

        .feature-card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .feature-icon {
          margin-bottom: 1.5rem;
        }

        .feature-title {
          font-weight: 600;
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: var(--brunswick-green);
        }

        .feature-description {
          font-size: 1rem;
          color: var(--hunter-green);
          line-height: 1.6;
        }

        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }

        /* -------------------- */
        /* 📱 MOBILE OVERRIDES */
        /* -------------------- */

        @media (max-width: 768px) {
          .features-section {
            padding: 3rem 1.25rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .feature-card {
            padding: 1.5rem;
          }

          .feature-icon {
            width: 60px !important;
            height: 60px !important;
            margin-bottom: 1rem;
          }

          .feature-title {
            font-size: 1.1rem;
            margin-bottom: 0.75rem;
          }

          .feature-description {
            font-size: 0.95rem;
            line-height: 1.5;
          }
        }
      `}</style>
    </section>
  );
}
