import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import ThemeToggle from '../components/ThemeToggle';
import { useAuthStore } from '../store/useAuthStore';

interface MemberDto {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface ProjectDetailResponse {
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
  members: MemberDto[];
  phases: unknown[];
  recentTasks: unknown[];
}

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

const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  MANAGER: { bg: '#E8863A22', color: '#E8863A', border: '#E8863A44' },
  WORKER: { bg: '#3B82F622', color: '#3B82F6', border: '#3B82F644' },
  CLIENT: { bg: '#22C55E22', color: '#22C55E', border: '#22C55E44' },
};

function isOverdue(deadline: string, status: string): boolean {
  if (status === 'COMPLETED' || status === 'SUSPENDED') return false;
  return new Date(deadline) < new Date();
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const { data: project, isLoading, isError } = useQuery<ProjectDetailResponse>({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const overdue = project ? isOverdue(project.deadline, project.status) : false;

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
        {isLoading ? (
          <div style={styles.center}>
            <p style={styles.loadingText}>Loading project...</p>
          </div>
        ) : isError || !project ? (
          <div style={styles.center}>
            <p style={styles.loadingText}>Project not found.</p>
          </div>
        ) : (
          <>
            {/* Project Header */}
            <div style={styles.projectHeader}>
              <div style={styles.projectHeaderLeft}>
                <button onClick={() => navigate('/projects')} style={styles.backButton}>
                  ← Back
                </button>
                <div>
                  <div style={styles.projectTitleRow}>
                    <h2 style={styles.projectTitle}>{project.name}</h2>
                    {overdue && <span style={styles.overdueTag}>Overdue</span>}
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
                  <p style={styles.projectAddress}>{project.address}</p>
                  {project.description && (
                    <p style={styles.projectDescription}>{project.description}</p>
                  )}
                </div>
              </div>
              <button onClick={() => navigate(`/projects/${id}/edit`)} style={styles.primaryButton}>
                Edit
              </button>
            </div>

            {/* Summary Cards */}
            <div style={styles.summaryGrid}>
              {/* Progress */}
              <div style={styles.summaryCard}>
                <span style={styles.summaryLabel}>Progress</span>
                <span style={styles.summaryValue}>{project.progress}%</span>
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

              {/* Budget */}
              <div style={styles.summaryCard}>
                <span style={styles.summaryLabel}>Budget</span>
                <span style={styles.summaryValue}>
                  {project.budget != null
                    ? new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(project.budget)
                    : '—'}
                </span>
              </div>

              {/* Deadline */}
              <div style={styles.summaryCard}>
                <span style={styles.summaryLabel}>Deadline</span>
                <span
                  style={{
                    ...styles.summaryValue,
                    color: overdue ? '#EF4444' : 'var(--text-primary)',
                  }}
                >
                  {new Date(project.deadline).toLocaleDateString('en-GB')}
                </span>
                {overdue && <span style={styles.overdueNote}>Past deadline</span>}
              </div>

              {/* Team */}
              <div style={styles.summaryCard}>
                <span style={styles.summaryLabel}>Team</span>
                <span style={styles.summaryValue}>
                  {project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>
            </div>

            {/* Members Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Team Members</h3>
              {project.members.length === 0 ? (
                <p style={styles.emptyText}>No members yet.</p>
              ) : (
                <div style={styles.memberList}>
                  {project.members.map((member) => {
                    const roleStyle = ROLE_COLORS[member.role] ?? ROLE_COLORS['WORKER'];
                    return (
                      <div key={member.id} style={styles.memberCard}>
                        <div style={styles.memberAvatar}>
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.name} style={styles.avatarImg} />
                          ) : (
                            <span style={styles.avatarInitial}>
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div style={styles.memberInfo}>
                          <span style={styles.memberName}>{member.name}</span>
                          <span style={styles.memberEmail}>{member.email}</span>
                        </div>
                        <span
                          style={{
                            ...styles.roleBadge,
                            backgroundColor: roleStyle.bg,
                            color: roleStyle.color,
                            border: `1px solid ${roleStyle.border}`,
                          }}
                        >
                          {member.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Phases Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Phases</h3>
              <div style={styles.emptySection}>
                <p style={styles.emptyText}>
                  No phases yet — phases will appear here once added.
                </p>
              </div>
            </div>

            {/* Recent Tasks Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Recent Tasks</h3>
              <div style={styles.emptySection}>
                <p style={styles.emptyText}>
                  No tasks yet — tasks will appear here once added.
                </p>
              </div>
            </div>
          </>
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
  center: {
    display: 'flex',
    justifyContent: 'center',
    padding: '60px 0',
  },
  loadingText: {
    color: 'var(--text-secondary)',
    fontSize: '16px',
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    gap: '16px',
  },
  projectHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  backButton: {
    padding: '6px 14px',
    fontSize: '14px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  projectTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  projectTitle: {
    fontSize: '28px',
    fontWeight: '700',
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
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  projectAddress: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: '4px 0 0',
  },
  projectDescription: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: '8px 0 0',
    maxWidth: '600px',
    lineHeight: '1.5',
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
    flexShrink: 0,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  summaryCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  summaryValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  overdueNote: {
    fontSize: '11px',
    color: '#EF4444',
    fontWeight: '500',
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--border)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '4px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '0 0 16px',
  },
  memberList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  memberCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '14px 16px',
  },
  memberAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#E8863A22',
    border: '1px solid #E8863A44',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarInitial: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#E8863A',
  },
  memberInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  memberName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  memberEmail: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    flexShrink: 0,
  },
  emptySection: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '32px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
};
