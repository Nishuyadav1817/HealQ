import PatientTopNav from '../features/patient/components/ui/PatientTopNav';

/** Root layout for the Patient panel — wraps every /patient/* route.
 * Uses its own dedicated shell (PatientTopNav) rather than the shared
 * DashboardShell that Reception/Doctor Assistant/Admin use, since the
 * patient-facing redesign is intentionally scoped to just this panel. */
const PatientLayout = () => <PatientTopNav />;

export default PatientLayout;
