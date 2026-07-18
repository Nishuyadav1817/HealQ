import DashboardShell from '../components/common/DashboardShell';
import { ROUTES } from '../constants/routePaths';

const NAV_ITEMS = [
  { label: 'Live Queue', path: ROUTES.DOCTOR.ROOT, end: true },
  { label: 'Consultation History', path: `${ROUTES.DOCTOR.ROOT}/history` },
];

/**
 * Root layout for the Doctor Assistant panel (Panel 2 — backend role
 * `doctorAssistant`, API prefix `/api/v1/doctor-assistant`). Named
 * "Doctor" here to match the panel as requested; the role check and API
 * calls underneath still target the doctorAssistant account that
 * operates this panel on the doctor's behalf.
 */
const DoctorLayout = () => (
  <DashboardShell roleLabel="Doctor Assistant" accent="doctor" navItems={NAV_ITEMS} />
);

export default DoctorLayout;
