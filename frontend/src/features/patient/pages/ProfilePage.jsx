import { useAuth } from '../../../context/AuthContext';
import Card from '../components/ui/PCard';
import Button from '../components/ui/PButton';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/**
 * Read-only for now — there is no PATCH /auth/me (or /patients/profile)
 * endpoint on the backend yet to save edits to. Showing what's known
 * (from the /auth/me payload AuthContext already holds) is honest about
 * what this screen can actually do today; wiring up an edit form is a
 * drop-in addition once that endpoint exists.
 */
const ProfilePage = () => {
  const { user, logout } = useAuth();

  const rows = [
    { label: 'Full name', value: user?.fullName },
    { label: 'Email', value: user?.email },
    { label: 'Phone', value: user?.phone },
    { label: 'Gender', value: user?.gender ? user.gender[0].toUpperCase() + user.gender.slice(1) : '—' },
    { label: 'Date of birth', value: formatDate(user?.dateOfBirth) },
  ];

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-2xl font-semibold text-ink">Profile</h1>
      <p className="mt-1 text-sm text-ink-muted">Your account details.</p>

      <Card className="mt-4">
        <dl className="space-y-3 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-ink-muted">{row.label}</dt>
              <dd className="text-right font-medium text-ink">{row.value || '—'}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="mt-6">
        <Button variant="secondary" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
