import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import ThemeToggle from '../components/ThemeToggle';
import { useAuthStore } from '../store/useAuthStore';

interface ProjectResponse {
  id: string;
  name: string;
  address: string;
  status: string;
  budget: number;
  startDate: string;
  deadline: string;
  progress: number;
  description?: string;
  createdBy?: string;
  memberCount: number;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'progress', label: 'Progress' },
];

const STATUS_COLORS: Record<string, string> = {
  PLANNING: '#3B82F6',
  IN_PROGRESS: '#E8863A',
  COMPLETED: '#22C55E',
  SUSPENDED: '#6B7280',
};

const STATUS_LABELS: Record<string, string> = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  SUSPENDED: 'Suspended',
};

function isOverdue(deadline: string, status: string): boolean {
  if (status === 'COMPLETED' || status === 'SUSPENDED') return false;
  return new Date(deadline) < new Date();
}

export default function Projects() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  const { data: projects = [], isLoading } = useQuery<ProjectResponse[]>({
    queryKey: ['projects', statusFilter, sortBy],
    queryFn: async () => {
      const params: Record<string, string> = { sortBy };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/projects', { params });
      return res.data;
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <ThemeToggle />

      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => navigate('/dashboard')} role="button">
          BuildFlow
        </h1>
        <div style={styles.headerActions}>
          <button onClick={() => navigate('/settings')} style={styles.ghostButton}>
            Settings
          </button>
          <button onClick={handleLogout} style={styles.ghostButton}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>Projects</h2>
          <button onClick={() => navigate('/projects/new')} style={styles.primaryButton}>
            + New Project
          </button>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div style={styles.center}>
            <p style={styles.loadingText}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>No projects yet</p>
            <p style={styles.emptySubtitle}>Create your first project to get started.</p>
            <button onClick={() => navigate('/projects/new')} style={styles.primaryButton}>
              + New Project
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {projects.map((project) => {
              const overdue = isOverdue(project.deadline, project.status);
              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  style={{
                    ...styles.card,
                    ...(overdue ? styles.cardOverdue : {}),
                    cursor: 'pointer',
                  }}
                >
                  <div style={styles.cardTop}>
                    <div style={styles.cardLeft}>
                      <div style={styles.cardTitleRow}>
                        <h3 style={styles.cardName}>{project.name}</h3>
                        {overdue && <span style={styles.overdueTag}>Overdue</span>}
                      </div>
                      <p style={styles.cardAddress}>{project.address}</p>
                    </div>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: STATUS_COLORS[project.status] + '22',
                        color: STATUS_COLORS[project.status],
                        border: `1px solid ${STATUS_COLORS[project.status]}44`,
                      }}
                    >
                      {STATUS_LABELS[project.status] ?? project.status}
                    </span>
                  </div>

                  <div style={styles.progressWrapper}>
                    <div style={styles.progressHeader}>
                      <span style={styles.progressLabel}>Progress</span>
                      <span style={styles.progressValue}>{project.progress}%</span>
                    </div>
                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${project.progress}%`,
                          backgroundColor: overdue ? '#EF4444' : '#E8863A',
                        }}
                      />
                    </div>
                  </div>

                  <div style={styles.cardMeta}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Deadline</span>
                      <span
                        style={{
                          ...styles.metaValue,
                          color: overdue ? '#EF4444' : 'var(--text-primary)',
                        }}
                      >
                        {new Date(project.deadline).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Budget</span>
                      <span style={styles.metaValue}>
                        {project.budget != null
                          ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0,
                            }).format(project.budget)
                          : '—'}
                      </span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Members</span>
                      <span style={styles.metaValue}>{project.memberCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
    cursor: 'pointer',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  ghostButton: {
    padding: '8px 16px',
    fontSize: '14px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  primaryButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#E8863A',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
  },
  toolbar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    minWidth: '140px',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    padding: '60px 0',
  },
  loadingText: {
    color: 'var(--text-secondary)',
    fontSize: '16px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '80px 0',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  emptySubtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardOverdue: {
    borderColor: '#EF444444',
    backgroundColor: 'var(--bg-surface)',
    boxShadow: '0 0 0 1px #EF444422',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardName: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  overdueTag: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#EF4444',
    backgroundColor: '#EF444422',
    border: '1px solid #EF444444',
    borderRadius: '4px',
    padding: '2px 6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardAddress: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  progressWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  progressValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--border)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  cardMeta: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metaLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metaValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
};
