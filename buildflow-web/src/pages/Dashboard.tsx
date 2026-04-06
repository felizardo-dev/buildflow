import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import ThemeToggle from '../components/ThemeToggle';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <ThemeToggle />

      <header style={styles.header}>
        <h1 style={styles.logo}>BuildFlow</h1>
        <div style={styles.headerActions}>
          <button onClick={() => navigate('/settings')} style={styles.settingsButton}>
            Settings
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.welcomeCard}>
          <h2 style={styles.welcomeTitle}>Welcome to BuildFlow!</h2>
          <div style={styles.userInfo}>
            <p style={styles.infoItem}>
              <strong>Name:</strong> {user?.name}
            </p>
            <p style={styles.infoItem}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={styles.infoItem}>
              <strong>Company:</strong> {user?.companyName}
            </p>
            <p style={styles.infoItem}>
              <strong>Role:</strong> {user?.role}
            </p>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Projects</h3>
            <p style={styles.cardValue}>0</p>
            <p style={styles.cardSubtitle}>Active projects</p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Team Members</h3>
            <p style={styles.cardValue}>1</p>
            <p style={styles.cardSubtitle}>Total members</p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Tasks</h3>
            <p style={styles.cardValue}>0</p>
            <p style={styles.cardSubtitle}>Pending tasks</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--bg-surface)',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--accent)',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  settingsButton: {
    padding: '8px 16px',
    fontSize: '14px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  logoutButton: {
    padding: '8px 16px',
    fontSize: '14px',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  welcomeCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '32px',
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '24px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoItem: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
  },
  cardValue: {
    fontSize: '48px',
    fontWeight: '600',
    color: 'var(--accent)',
    marginBottom: '8px',
  },
  cardSubtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
};
