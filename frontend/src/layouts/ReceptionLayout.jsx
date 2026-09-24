import ReceptionTopNav from '../features/reception/components/ui/ReceptionTopNav';

/**
 * Root layout for the Reception panel (Panel 1) — wraps every
 * /reception/* route. Uses its own dedicated shell (ReceptionTopNav),
 * the same "scope the redesign to one panel" approach the Patient
 * layout already established with PatientTopNav, so Doctor Assistant
 * and Admin keep using the shared DashboardShell untouched.
 */
const ReceptionLayout = () => <ReceptionTopNav />;

export default ReceptionLayout;
