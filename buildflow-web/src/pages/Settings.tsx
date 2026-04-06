import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/useAuthStore';
import ThemeToggle from '../components/ThemeToggle';
import api from '../lib/axios';
import {
  updateProfileSchema,
  updateEmailSchema,
} from '../schemas/settings.schema';
import type { UpdateProfileFormData, UpdateEmailFormData } from '../schemas/settings.schema';
export default function Settings() {
  const navigate = useNavigate();
  const { user, token, login, logout } = useAuthStore();

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: '',
    },
  });

  const emailForm = useForm<UpdateEmailFormData>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: { newEmail: '', password: '' },
  });

  const handleProfileSubmit = async (data: UpdateProfileFormData) => {
    setProfileSuccess('');
    setProfileError('');
    try {
      const response = await api.put('/users/profile', data);
      const updated = response.data;
      // Refresh the auth store with updated name
      if (token && user) {
        login(token, { ...user, name: updated.name });
      }
      setProfileSuccess('Profile updated successfully.');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to update profile.';
      setProfileError(typeof message === 'string' ? message : 'Failed to update profile.');
    }
  };

  const handleEmailSubmit = async (data: UpdateEmailFormData) => {
    setEmailSuccess('');
    setEmailError('');
    try {
      await api.post('/users/profile/email', data);
      setEmailSuccess('Check your email to confirm the change.');
      emailForm.reset();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to request email change.';
      setEmailError(typeof message === 'string' ? message : 'Failed to request email change.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <ThemeToggle />

      <header style={styles.header}>
        <h1 style={styles.logo}>BuildFlow</h1>
        <nav style={styles.nav}>
          <button onClick={() => navigate('/dashboard')} style={styles.navButton}>
            Dashboard
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </nav>
      </header>

      <main style={styles.main}>
        <h2 style={styles.pageTitle}>Account Settings</h2>

        {/* ── Personal Information ── */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Personal Information</h3>
          <p style={styles.sectionSubtitle}>Update your name and phone number.</p>

          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                {...profileForm.register('name')}
                style={styles.input}
                placeholder="Your full name"
              />
              {profileForm.formState.errors.name && (
                <span style={styles.fieldError}>
                  {profileForm.formState.errors.name.message}
                </span>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone (optional)</label>
              <input
                {...profileForm.register('phone')}
                style={styles.input}
                placeholder="+351 912 345 678"
              />
            </div>

            {profileSuccess && <p style={styles.successMsg}>{profileSuccess}</p>}
            {profileError && <p style={styles.errorMsg}>{profileError}</p>}

            <button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              style={styles.submitButton}
            >
              {profileForm.formState.isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* ── Change Email ── */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Change Email</h3>
          <p style={styles.sectionSubtitle}>
            Enter your new email address and current password. You will receive a confirmation link.
          </p>

          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>New Email</label>
              <input
                {...emailForm.register('newEmail')}
                type="email"
                style={styles.input}
                placeholder="new@example.com"
              />
              {emailForm.formState.errors.newEmail && (
                <span style={styles.fieldError}>
                  {emailForm.formState.errors.newEmail.message}
                </span>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Current Password</label>
              <input
                {...emailForm.register('password')}
                type="password"
                style={styles.input}
                placeholder="Your current password"
              />
              {emailForm.formState.errors.password && (
                <span style={styles.fieldError}>
                  {emailForm.formState.errors.password.message}
                </span>
              )}
            </div>

            {emailSuccess && <p style={styles.successMsg}>{emailSuccess}</p>}
            {emailError && <p style={styles.errorMsg}>{emailError}</p>}

            <button
              type="submit"
              disabled={emailForm.formState.isSubmitting}
              style={styles.submitButton}
            >
              {emailForm.formState.isSubmitting ? 'Sending…' : 'Request Email Change'}
            </button>
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
    margin: 0,
  },
  nav: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  navButton: {
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
    maxWidth: '680px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '6px',
    marginTop: 0,
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
    marginTop: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  input: {
    padding: '10px 14px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  fieldError: {
    fontSize: '13px',
    color: '#ef4444',
  },
  successMsg: {
    fontSize: '14px',
    color: '#22c55e',
    margin: 0,
  },
  errorMsg: {
    fontSize: '14px',
    color: '#ef4444',
    margin: 0,
  },
  submitButton: {
    padding: '11px 24px',
    fontSize: '15px',
    fontWeight: '600',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
};
