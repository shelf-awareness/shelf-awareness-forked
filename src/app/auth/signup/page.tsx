'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import styles from '@/styles/signup.module.css';

type SignUpForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const SignUp = () => {
  const { status } = useSession();
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const validationSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email is invalid'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(40, 'Password must not exceed 40 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password')], 'Confirm Password does not match'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: SignUpForm) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      setSuccessMessage('Account created successfully! Redirecting to sign in...');

      setTimeout(() => {
        router.push('/auth/signin');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || status === 'authenticated') return null;

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Sign Up</h1>
        <p className={styles.descriptionCentered}>Sign up with your email</p>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              {...register('email')}
              className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
            />
            {errors.email && <p className={styles.error}>{errors.email.message}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              {...register('password')}
              className={`${styles.input} ${errors.password ? styles.invalid : ''}`}
            />
            {errors.password && <p className={styles.error}>{errors.password.message}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className={`${styles.input} ${errors.confirmPassword ? styles.invalid : ''}`}
            />
            {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? <span className={styles.spinner} /> : 'Register'}
          </button>
        </form>

        <p className={styles.accountPromptWrapper}>
          Already have an account?&nbsp;
          <a href="/auth/signin" className={styles.logIn}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;