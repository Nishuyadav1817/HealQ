import DashboardShell from '../components/common/DashboardShell';
import { ROUTES } from '../constants/routePaths';

const NAV_ITEMS = [
  { label: 'Overview', path: ROUTES.ADMIN.ROOT, end: true },
  { label: 'Analytics', path: `${ROUTES.ADMIN.ROOT}/analytics` },
  { label: 'Reports', path: `${ROUTES.ADMIN.ROOT}/reports` },
  { label: 'Hospitals', path: `${ROUTES.ADMIN.ROOT}/hospitals` },
  { label: 'Doctors', path: `${ROUTES.ADMIN.ROOT}/doctors` },
  { label: 'Patients', path: `${ROUTES.ADMIN.ROOT}/patients` },
  { label: 'Appointments', path: `${ROUTES.ADMIN.ROOT}/appointments` },
  { label: 'Departments', path: `${ROUTES.ADMIN.ROOT}/departments` },
  { label: 'Cities', path: `${ROUTES.ADMIN.ROOT}/cities` },
  { label: 'Staff', path: `${ROUTES.ADMIN.ROOT}/staff` },
];

/** Root layout for the Admin panel — wraps every /admin/* route. */
const AdminLayout = () => (
  <DashboardShell roleLabel="Admin" accent="admin" navItems={NAV_ITEMS} />
);

export default AdminLayout;
