/* eslint-disable react/jsx-one-expression-per-line */

'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/signin.module.css';
import swal from 'sweetalert';

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSigningIn(true);

    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };

    const email = target.email.value;
    const password = target.password.value;

    const result = await signIn('credentials', {
      redirect: false,
      callbackUrl: '/dashboard',
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setIsSigningIn(false);
      return;
    }

    if (result?.url) {
      try {
        const res = await fetch(`/api/expiring?owner=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (data.expiringItems?.length > 0) {
          const itemList = data.expiringItems
            .map((item: any) => `${item.name} (expires on ${new Date(item.expiration).toLocaleDateString()})`)
            .join('\n');

          swal({
            title: 'Expiring Items!',
            text: `You have the following items expiring soon:\n\n${itemList}`,
            icon: 'warning',
            buttons: {
              add: {
                text: 'Add to Shopping List',
                value: 'add',
              },
              go: {
                text: 'Go to pantry',
                value: 'go',
              },
              later: {
                text: 'Remind me later',
                value: 'later',
              },
            },
          }).then((value) => {
            if (value === 'add') {
              const firstItem = data.expiringItems[0];

              if (firstItem) {
                const params = new URLSearchParams({
                  addItem: firstItem.name,
                  quantityValue: String(firstItem.quantity || 1),
                  quantityUnit: firstItem.unit || '',
                });

                window.location.href = `/shopping-list?${params.toString()}`;
              } else {
                window.location.href = '/shopping-list';
              }
            } else if (value === 'go') {
              window.location.href = '/view-pantry';
            } else {
              window.location.href = result.url || '/dashboard';
            }
          });
        } else {
          window.location.href = result.url;
        }
      } catch (err) {
        console.error('Failed to fetch expiring items:', err);
        window.location.href = result.url;
      }
    }

    setIsSigningIn(false);
  };

  if (status === 'loading' || status === 'authenticated') return null;

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.descriptionCentered}>
          Enter your email and password to access your Pantry Pal account.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              required
              className={styles.input}
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Password
              <span className={styles.forgotPassword}>
                <a href="/auth/forgot-password">Forgot password?</a>
              </span>
            </label>
            <input
              type="password"
              name="password"
              required
              className={styles.input}
              placeholder="Password"
            />
          </div>

          <button type="submit" className={styles.button} disabled={isSigningIn}>
            {isSigningIn ? <span className={styles.spinner} /> : 'Sign In'}
          </button>

          {error && <p className={styles.error}>{error}</p>}
        </form>

        <p className={styles.accountPromptWrapper}>
          Don&apos;t have an account?{' '}
          <a href="/auth/signup" className={styles.logIn}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}