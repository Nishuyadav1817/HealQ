import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Field from '../../patient/components/ui/PField';
import Button from '../../patient/components/ui/PButton';
import { registerRequest } from '../services/auth.api';
import { ROUTES } from '../../../constants/routePaths';
import { getApiErrorMessage } from '../../../utils/apiError';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  gender: '',
  dateOfBirth: '',
};

/**
 * Registers a new PATIENT account (the only role the public /auth/register
 * endpoint allows — staff accounts are provisioned by an admin). Does not
 * log the person in automatically; sends them to Login so the credential
 * they just chose is the first thing they use, mirroring how most
 * consumer signup flows confirm the password actually works.
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.gender) delete payload.gender;
      if (!payload.dateOfBirth) delete payload.dateOfBirth;

      await registerRequest(payload);
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { justRegistered: true },
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please check your details.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Book appointments and track your place in the queue."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo={ROUTES.LOGIN}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Full name"
          name="fullName"
          autoComplete="name"
          value={form.fullName}
          onChange={handleChange}
          required
        />
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
          label="Phone number"
          name="phone"
          autoComplete="tel"
          placeholder="10-15 digits"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <Field
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <p className="-mt-3 text-xs text-ink-subtle">
          At least 8 characters, with an uppercase letter, lowercase letter, number, and symbol.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Gender (optional)" as="select" name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Field>
          <Field
            label="Date of birth (optional)"
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        {error && <p className="text-sm font-medium text-danger">{error}</p>}

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
