import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  return (
    <div style={styles.container}>
      <ThemeToggle />
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>BuildFlow</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <div style={styles.placeholder}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Login page coming soon...
          </p>
          <Link to="/register" style={styles.link}>
            Don't have an account? Register here
          </Link>
        </div>
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
  placeholder: {
    textAlign: 'center',
    padding: '40px 0',
  },
  link: {
    display: 'inline-block',
    marginTop: '20px',
  },
};
