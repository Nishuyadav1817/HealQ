import React from "react";
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthField from '../components/AuthField';
import PasswordField from '../components/PasswordField';
import AuthAlert from '../components/AuthAlert';
import { MailIcon } from '../components/icons';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routePaths';
import { USER_ROLES } from '../../../constants/roles';

const ROLE_HOME = {
  [USER_ROLES.PATIENT]: ROUTES.PATIENT.ROOT,
  [USER_ROLES.RECEPTIONIST]: ROUTES.RECEPTION?.ROOT,
  [USER_ROLES.DOCTOR_ASSISTANT]: ROUTES.DOCTOR?.ROOT,
  [USER_ROLES.ADMIN]: ROUTES.ADMIN?.ROOT,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const justRegistered = Boolean(location.state?.justRegistered);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.';
    if (!form.password) errors.password = 'Enter your password.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const user = await login(form);
      const from = location.state?.from;
      navigate(from || ROLE_HOME[user.role] || ROUTES.HOME, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Sign in to UpcharGanga"
      title="Welcome back"
      subtitle="Log in to book visits and track your place in the queue."
      footerText="Don't have an account?"
      footerLinkText="Register"
      footerLinkTo={ROUTES.REGISTER}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {justRegistered && (
          <AuthAlert variant="success">Account created. Log in to get started.</AuthAlert>
        )}

        <AuthField
          label="Email address"
          icon={MailIcon}
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          disabled={isSubmitting}
          required
        />
        <PasswordField
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          disabled={isSubmitting}
          required
        />

        {error && <AuthAlert variant="error">{error}</AuthAlert>}

        <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
