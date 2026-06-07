'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import styles from '@/styles/hero.module.css';

export default function Hero() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  const parent = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <section
      className="py-4 py-md-5"
      style={{ backgroundColor: 'var(--timberwolf)' }}
    >
      <div className="container">
        <div className="row align-items-center">

          <div className="col-md-6 mb-4 mb-md-0 mt-3 mt-md-5">
            <motion.div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: 220 }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              whileHover={{ scale: 1.04, rotate: 0.8 }}
            >
              <Image
                src="/shelf-awareness-logo.png"
                alt="Shelf Awareness Logo"
                width={420}
                height={420}
                priority
                className="img-fluid rounded shadow-lg"
                style={{
                  backgroundColor: 'white',
                  maxWidth: '85%',
                  height: 'auto',
                }}
              />
            </motion.div>
          </div>

          <div className="col-md-6 text-center text-md-start">
            <motion.div variants={parent} initial="hidden" animate="show">

              <motion.h1
                className="fw-bold mb-3"
                style={{ color: 'var(--prussian-blue)' }}
                variants={item}
              >
                Welcome to{' '}
                <span style={{ color: 'var(--light-blue)' }}>
                  Shelf Awareness
                </span>
              </motion.h1>

              <motion.p
                className="mb-4"
                style={{
                  color: 'var(--azure-blue)',
                  fontSize: '1.1rem',
                }}
                variants={item}
              >
                Keep track of your pantry, cut down on food waste, and discover
                recipes with what you already have. Smarter cooking, simplified.
              </motion.p>

              <motion.div
                className="
                  d-flex
                  flex-column flex-md-row
                  gap-3
                  justify-content-center justify-content-md-start
                "
                variants={item}
              >
                {!isLoading &&
                  (!session ? (
                    <>
                      <motion.div
                        whileHover={{ y: -3, scale: 1.02 }}
                        transition={{ duration: 0.12 }}
                        className="w-100 w-md-auto"
                      >
                        <Link
                          href="/auth/signup"
                          className={`${styles.primaryButton} w-100 w-md-auto`}
                        >
                          Sign Up
                        </Link>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.12 }}
                        className="w-100 w-md-auto"
                      >
                        <Link
                          href="/auth/signin"
                          className={`${styles.secondaryButton} w-100 w-md-auto`}
                        >
                          Log In
                        </Link>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.12 }}
                      className="d-flex flex-column gap-3 w-100 w-md-auto"
                    >
                      <Link
                        href="/dashboard"
                        className={`${styles.primaryButton} w-100 w-md-auto`}
                      >
                        Go to Dashboard
                      </Link>
                      <Link
                        href="/view-pantry"
                        className={`${styles.primaryButton} w-100 w-md-auto`}
                      >
                        Go to View Shelf
                      </Link>
                      <Link
                        href="/shopping-list"
                        className={`${styles.primaryButton} w-100 w-md-auto`}
                      >
                        Go to Shopping List
                      </Link>
                      <Link
                        href="/recipes"
                        className={`${styles.primaryButton} w-100 w-md-auto`}
                      >
                        Go to Recipes
                      </Link>
                    </motion.div>
                  ))}
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
