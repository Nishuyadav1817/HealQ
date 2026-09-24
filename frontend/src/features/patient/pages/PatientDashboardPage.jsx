import React from "react";
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { ROUTE_PATHS } from '../../../constants/routePaths';
import DashboardShell from '../../../components/common/DashboardShell';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import StatCard from '../../../components/ui/StatCard';

const PatientDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.fullName}</h1>
          <p className="text-gray-600 mt-2">Manage your appointments and health services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Upcoming Appointments"
            value="0"
            icon="📅"
            action={() => navigate(ROUTE_PATHS.PATIENT.APPOINTMENTS)}
            actionLabel="View All"
          />
          <StatCard
            title="Completed Consultations"
            value="0"
            icon="✅"
            action={() => navigate(ROUTE_PATHS.PATIENT.APPOINTMENTS)}
            actionLabel="History"
          />
          <StatCard
            title="Unread Notifications"
            value="0"
            icon="🔔"
            action={() => navigate(ROUTE_PATHS.PATIENT.NOTIFICATIONS)}
            actionLabel="Check"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                onClick={() => navigate(ROUTE_PATHS.PATIENT.BOOK)}
                className="w-full"
              >
                Book New Appointment
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTE_PATHS.PATIENT.APPOINTMENTS)}
                className="w-full"
              >
                View My Appointments
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTE_PATHS.PATIENT.NOTIFICATIONS)}
                className="w-full"
              >
                View Notifications
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Profile</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Email</p>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Phone</p>
                <p className="text-gray-900">{user?.phone}</p>
              </div>
              {user?.dateOfBirth && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Date of Birth</p>
                  <p className="text-gray-900">
                    {new Date(user.dateOfBirth).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
};

export default PatientDashboardPage;
