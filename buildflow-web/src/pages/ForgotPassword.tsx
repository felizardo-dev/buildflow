import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { z } from 'zod';
import api from '../lib/axios';
import ThemeToggle from '../components/ThemeToggle';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError('');
      await api.post('/auth/forgot-password', data);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <ThemeToggle />
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>BuildFlow</h1>
          <p style={styles.subtitle}>Recover your password</p>
        </div>

        {submitted ? (
          <div style={styles.successBox}>
            <p style={styles.successText}>
              Check your email for a recovery link.
            </p>
            <p style={styles.successHint}>
              If that address is registered you'll receive an email shortly. The link expires in 30 minutes.
            </p>
            <Link to="/login" style={styles.link}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="john@company.com"
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
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
              {isLoading ? 'Sending...' : 'Send recovery link'}
            </button>

            <p style={styles.footer}>
              <Link to="/login" style={styles.link}>
                Back to Sign In
              </Link>
            </p>
          </form>
        )}
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
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
  },
  successText: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  successHint: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
};
