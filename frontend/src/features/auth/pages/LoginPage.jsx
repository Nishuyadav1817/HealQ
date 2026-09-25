import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Field from '../../patient/components/ui/PField';
import Button from '../../patient/components/ui/PButton';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routePaths';
import { USER_ROLES } from '../../../constants/roles';
import { getApiErrorMessage } from '../../../utils/apiError';

const ROLE_HOME = {
  [USER_ROLES.PATIENT]: ROUTES.PATIENT.ROOT,
  [USER_ROLES.RECEPTIONIST]: ROUTES.RECEPTION?.ROOT,
  [USER_ROLES.DOCTOR_ASSISTANT]: ROUTES.DOCTOR?.ROOT,
  [USER_ROLES.ADMIN]: ROUTES.ADMIN?.ROOT,
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(form);
      const from = location.state?.from;
      navigate(from || ROLE_HOME[user.role] || ROUTES.HOME, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back — book and track your hospital visits."
      footerText="Don't have an account?"
      footerLinkText="Register"
      footerLinkTo={ROUTES.REGISTER}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Field
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && <p className="text-sm font-medium text-danger">{error}</p>}

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
