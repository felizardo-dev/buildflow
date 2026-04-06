import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { registerSchema } from '../schemas/auth.schema';
import type { RegisterFormData } from '../schemas/auth.schema';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.post('/auth/register', data);

      const { accessToken, user } = response.data;

      login(accessToken, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <p style={styles.subtitle}>Create your company account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.formGroup}>
            <label>Company Name</label>
            <input
              {...register('companyName')}
              type="text"
              placeholder="Your Company Ltd."
            />
            {errors.companyName && (
              <span className="error-message">{errors.companyName.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label>Full Name</label>
            <input
              {...register('name')}
              type="text"
              placeholder="John Doe"
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

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

          <div style={styles.formGroup}>
            <label>Password</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label>Country</label>
            <select {...register('country')}>
              <option value="">Select a country</option>
              <option value="PT">Portugal</option>
              <option value="ES">Spain</option>
              <option value="FR">France</option>
              <option value="UK">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="IT">Italy</option>
              <option value="BR">Brazil</option>
              <option value="US">United States</option>
            </select>
            {errors.country && (
              <span className="error-message">{errors.country.message}</span>
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <p style={styles.footer}>
            Already have an account?{' '}
            <a href="/login">Sign in</a>
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
};
