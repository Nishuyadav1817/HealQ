import { DoctorSelectionProvider } from '../features/doctorAssistant/context/DoctorSelectionContext';
import DoctorTopNav from '../features/doctorAssistant/components/ui/DoctorTopNav';

/**
 * Root layout for the Doctor Assistant panel (Panel 2 — backend role
 * `doctorAssistant`, API prefix `/api/v1/doctor-assistant`). Named
 * "Doctor" here to match the panel as requested; the role check and API
 * calls underneath still target the doctorAssistant account that
 * operates this panel on the doctor's behalf.
 *
 * Uses its own dedicated shell (DoctorTopNav) rather than the shared
 * DashboardShell — the same "scope the redesign to one panel" approach
 * already used for Reception (ReceptionTopNav); Admin keeps using
 * DashboardShell untouched. DoctorSelectionProvider wraps the whole
 * panel (not just the board page) so the header can show which doctor
 * is currently selected, in sync with DoctorQueuePage underneath it.
 */
const DoctorLayout = () => (
  <DoctorSelectionProvider>
    <DoctorTopNav />
  </DoctorSelectionProvider>
);

export default DoctorLayout;
