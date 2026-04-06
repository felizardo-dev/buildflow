import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { z } from 'zod';
import api from '../lib/axios';
import ThemeToggle from '../components/ThemeToggle';

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await api.post('/auth/reset-password', { token, newPassword: data.newPassword });
      navigate('/login', { state: { successMessage: 'Password updated successfully. You can now sign in.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired token. Please request a new recovery link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <ThemeToggle />
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>BuildFlow</h1>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Invalid or missing reset token.{' '}
            <Link to="/forgot-password" style={styles.link}>
              Request a new link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ThemeToggle />
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>BuildFlow</h1>
          <p style={styles.subtitle}>Set a new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.formGroup}>
            <label>New Password</label>
            <input
              {...register('newPassword')}
              type="password"
              placeholder="••••••••"
            />
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label>Confirm Password</label>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword.message}</span>
            )}
          </div>

          {error && (
            <div className="error-message" style={{ textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {isLoading ? 'Saving...' : 'Update password'}
          </button>

          <p style={styles.footer}>
            <Link to="/login" style={styles.link}>
              Back to Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: 'var(--accent)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  footer: {
    textAlign: 'center',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '8px',
  },
  link: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontWeight: '500',
  },
};
