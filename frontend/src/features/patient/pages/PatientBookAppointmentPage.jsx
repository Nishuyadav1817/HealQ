import React from "react";
import DashboardShell from '../../../components/common/DashboardShell';
import ComingSoon from '../../../components/common/ComingSoon';

const PatientBookAppointmentPage = () => {
  return (
    <DashboardShell>
      <ComingSoon
        title="Book Appointment"
        message="The appointment booking interface will be available soon."
      />
    </DashboardShell>
  );
};

export default PatientBookAppointmentPage;
