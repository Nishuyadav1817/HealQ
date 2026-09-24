import React from "react";
import { useDoctorSelection } from '../context/DoctorSelectionContext';
import DashboardShell from '../../../components/common/DashboardShell';
import { EmptyState } from '../../../components/ui/StateNotice';

/**
 * Doctor Assistant's completed appointments page
 * Shows historical record of all appointments handled by a doctor
 */
const DoctorCompletedPage = () => {
  const { doctor } = useDoctorSelection();

  return (
    <DashboardShell>
      <div>
        <h1 className="text-xl font-semibold text-ink">
          {doctor ? `Dr. ${doctor.user?.fullName}'s Completed Appointments` : 'Completed Appointments'}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">Review appointments you've completed.</p>
      </div>

      <div className="mt-6">
        <EmptyState>
          Completed appointments tracking coming soon.
        </EmptyState>
      </div>
    </DashboardShell>
  );
};

export default DoctorCompletedPage;
