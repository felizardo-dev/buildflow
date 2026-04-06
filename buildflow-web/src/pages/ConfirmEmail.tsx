import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/axios';

type Status = 'loading' | 'success' | 'error';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    api
      .get(`/users/confirm-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>BuildFlow</h1>

        {status === 'loading' && (
          <p style={styles.message}>Confirming your new email address…</p>
        )}

        {status === 'success' && (
          <>
            <div style={styles.iconSuccess}>✓</div>
            <h2 style={styles.title}>Email updated successfully</h2>
            <p style={styles.subtitle}>
              Your email address has been updated. Please log in with your new address.
            </p>
            <Link to="/login" style={styles.button}>
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.iconError}>✕</div>
            <h2 style={styles.title}>Invalid or expired link</h2>
            <p style={styles.subtitle}>
              This confirmation link is invalid or has already been used. Please request a new
              email change from your account settings.
            </p>
            <Link to="/login" style={styles.button}>
              Back to Login
            </Link>
          </>
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
    backgroundColor: 'var(--bg-primary)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '48px 40px',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--accent)',
    marginBottom: '32px',
  },
  iconSuccess: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    color: '#fff',
    fontSize: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  iconError: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  message: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
  },
  button: {
    display: 'inline-block',
    padding: '12px 28px',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
  },
};
