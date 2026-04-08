import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/axios';
import ThemeToggle from '../components/ThemeToggle';

const newProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  address: z.string().min(1, 'Address is required'),
  startDate: z.string().min(1, 'Start date is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  budget: z.coerce.number({ invalid_type_error: 'Budget must be a number' }).positive('Budget must be positive'),
  description: z.string().optional(),
  latitude: z.coerce.number().optional().or(z.literal('')),
  longitude: z.coerce.number().optional().or(z.literal('')),
});

type NewProjectFormData = z.infer<typeof newProjectSchema>;

export default function NewProject() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewProjectFormData>({
    resolver: zodResolver(newProjectSchema),
  });

  const onSubmit = async (data: NewProjectFormData) => {
    setError('');
    setIsLoading(true);
    try {
      await api.post('/projects', {
        name: data.name,
        address: data.address,
        startDate: data.startDate,
        deadline: data.deadline,
        budget: data.budget,
        description: data.description || undefined,
        latitude: data.latitude !== '' ? data.latitude : undefined,
        longitude: data.longitude !== '' ? data.longitude : undefined,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to create project. Please try again.';
      setError(typeof message === 'string' ? message : 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <ThemeToggle />

      <header style={styles.header}>
        <h1 style={styles.logo}>BuildFlow</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>New Project</h2>
          <p style={styles.subtitle}>Fill in the details to create a new construction project.</p>

          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Required Information</h3>

              <div style={styles.field}>
                <label style={styles.label}>Project Name *</label>
                <input
                  {...register('name')}
                  style={styles.input}
                  placeholder="e.g. Residential Building Lisbon"
                />
                {errors.name && <span style={styles.fieldError}>{errors.name.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Address *</label>
                <input
                  {...register('address')}
                  style={styles.input}
                  placeholder="e.g. Rua Augusta 123, Lisboa"
                />
                {errors.address && <span style={styles.fieldError}>{errors.address.message}</span>}
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Start Date *</label>
                  <input
                    {...register('startDate')}
                    type="date"
                    style={styles.input}
                  />
                  {errors.startDate && <span style={styles.fieldError}>{errors.startDate.message}</span>}
                </div>

                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Deadline *</label>
                  <input
                    {...register('deadline')}
                    type="date"
                    style={styles.input}
                  />
                  {errors.deadline && <span style={styles.fieldError}>{errors.deadline.message}</span>}
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Budget (€) *</label>
                <input
                  {...register('budget')}
                  type="number"
                  step="0.01"
                  style={styles.input}
                  placeholder="e.g. 500000"
                />
                {errors.budget && <span style={styles.fieldError}>{errors.budget.message}</span>}
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Optional Information</h3>

              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  {...register('description')}
                  style={styles.textarea}
                  placeholder="Brief description of the project..."
                  rows={4}
                />
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Latitude</label>
                  <input
                    {...register('latitude')}
                    type="number"
                    step="any"
                    style={styles.input}
                    placeholder="e.g. 38.7223"
                  />
                </div>

                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Longitude</label>
                  <input
                    {...register('longitude')}
                    type="number"
                    step="any"
                    style={styles.input}
                    placeholder="e.g. -9.1393"
                  />
                </div>
              </div>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.actions}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...styles.submitButton,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
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
  backButton: {
    padding: '8px 16px',
    fontSize: '14px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '760px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  formCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '40px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  input: {
    padding: '10px 14px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    padding: '10px 14px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  fieldError: {
    fontSize: '12px',
    color: '#e53e3e',
  },
  errorBox: {
    padding: '12px 16px',
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
    border: '1px solid rgba(229, 62, 62, 0.3)',
    borderRadius: '6px',
    color: '#e53e3e',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelButton: {
    padding: '10px 24px',
    fontSize: '14px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#E8863A',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
  },
};
