import DashboardShell from '../components/common/DashboardShell';
import { ROUTES } from '../constants/routePaths';

const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.RECEPTION.ROOT, end: true },
  { label: 'Search Booking', path: `${ROUTES.RECEPTION.ROOT}/search` },
];

/** Root layout for the Reception panel (Panel 1) — wraps every
 * /reception/* route. */
const ReceptionLayout = () => (
  <DashboardShell roleLabel="Reception" accent="reception" navItems={NAV_ITEMS} />
);

export default ReceptionLayout;
