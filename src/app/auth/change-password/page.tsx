'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { changePassword } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from '@/styles/change-password.module.css';
import swal from 'sweetalert';

export default function ChangePasswordPage() {
  const { data: session, status } = useSession();
  const email = session?.user?.email || '';

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Confirm Password does not match.');
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 40) {
      setError('Password must be between 6 and 40 characters.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from old password.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({ email, oldPassword, newPassword });
      if (res.success) {
        await swal('Password Changed', 'Your password has been changed', 'success', { timer: 2000 });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Change Password</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter old password"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter new password"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="Confirm new password"
              required
            />
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
