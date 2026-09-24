import React from "react";
import DashboardShell from '../../../components/common/DashboardShell';
import ComingSoon from '../../../components/common/ComingSoon';

const PatientNotificationsPage = () => {
  return (
    <DashboardShell>
      <ComingSoon
        title="Notifications"
        message="Your notifications will appear here once the notification system is implemented."
      />
    </DashboardShell>
  );
};

export default PatientNotificationsPage;
