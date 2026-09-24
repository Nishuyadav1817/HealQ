import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthField from '../components/AuthField';
import PasswordField from '../components/PasswordField';
import PasswordStrength from '../components/PasswordStrength';
import AuthAlert from '../components/AuthAlert';
import { MailIcon, UserIcon, PhoneIcon, CalendarIcon, CheckCircleIcon } from '../components/icons';
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9]{10,15}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/**
 * Registers a new PATIENT account (the only role the public /auth/register
 * endpoint allows — staff accounts are provisioned by an admin, so no role
 * picker belongs on this form). Does not log the person in automatically:
 * it shows a brief in-card success state, then sends them to Login so the
 * credential they just chose is the first thing they use — mirroring how
 * most consumer signup flows confirm the password actually works.
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Enter your full name.';
    if (!form.email.trim()) errors.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.';
    if (!form.phone.trim()) errors.phone = 'Enter your phone number.';
    else if (!PHONE_PATTERN.test(form.phone.trim())) errors.phone = 'Enter a 10–15 digit phone number.';
    if (!form.password) errors.password = 'Create a password.';
    else if (!PASSWORD_PATTERN.test(form.password)) {
      errors.password = 'Password doesn\u2019t meet the requirements below yet.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.gender) delete payload.gender;
      if (!payload.dateOfBirth) delete payload.dateOfBirth;

      await registerRequest(payload);
      setIsSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.LOGIN, { replace: true, state: { justRegistered: true } });
      }, 1100);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please check your details.'));
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        eyebrow="Join UpcharGanga"
        title="Create your account"
        subtitle="Book appointments and track your place in the queue."
        footerText="Already have an account?"
        footerLinkText="Log in"
        footerLinkTo={ROUTES.LOGIN}
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <CheckCircleIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-ink">Account created</p>
            <p className="mt-1 text-sm text-ink-muted">Taking you to log in…</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Join UpcharGanga"
      title="Create your account"
      subtitle="Book appointments and track your place in the queue."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo={ROUTES.LOGIN}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          label="Full name"
          icon={UserIcon}
          name="fullName"
          placeholder="Jordan Lee"
          autoComplete="name"
          value={form.fullName}
          onChange={handleChange}
          error={fieldErrors.fullName}
          disabled={isSubmitting}
          required
        />
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
        <AuthField
          label="Phone number"
          icon={PhoneIcon}
          name="phone"
          autoComplete="tel"
          placeholder="10–15 digits"
          value={form.phone}
          onChange={handleChange}
          error={fieldErrors.phone}
          disabled={isSubmitting}
          required
        />

        <div className="space-y-2.5">
          <PasswordField
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            disabled={isSubmitting}
            required
          />
          <PasswordStrength password={form.password} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AuthField
            label="Gender (optional)"
            as="select"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </AuthField>
          <AuthField
            label="Date of birth (optional)"
            icon={CalendarIcon}
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        {error && <AuthAlert variant="error">{error}</AuthAlert>}

        <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
