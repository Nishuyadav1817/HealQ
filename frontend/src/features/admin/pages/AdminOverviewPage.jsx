import React from "react";
import { Spinner, ErrorNotice } from '../../../components/ui/StateNotice';
import StatCard from '../../../components/ui/StatCard';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useAnalytics } from '../hooks/useAnalytics';
import AppointmentsTrendChart from '../components/charts/AppointmentsTrendChart';
import StatusBreakdownChart from '../components/charts/StatusBreakdownChart';
import RevenueTrendChart from '../components/charts/RevenueTrendChart';
import {
  HospitalIcon,
  DoctorIcon,
  PatientsIcon,
  CalendarIcon,
  QueueIcon,
  RevenueIcon,
} from '../components/icons/AdminIcons';

const formatCurrency = (value) => `₹${(value ?? 0).toLocaleString('en-IN')}`;

const AdminOverviewPage = () => {
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } =
    useDashboardSummary();
  const { data: analytics, isLoading: isAnalyticsLoading, isError: isAnalyticsError } =
    useAnalytics(14);

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-ink">Admin Overview</h1>
        <p className="mt-1 text-sm text-ink-muted">
          A snapshot of every hospital, doctor, patient, and appointment on the platform.
        </p>
      </div>

      {isSummaryLoading && <Spinner label="Loading dashboard…" />}
      {isSummaryError && <ErrorNotice message="Couldn't load the dashboard summary right now." />}

      {summary && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            label="Hospitals"
            value={summary.hospitals.active}
            hint={`${summary.hospitals.total} total`}
            icon={HospitalIcon}
            tone="admin"
          />
          <StatCard
            label="Doctors"
            value={summary.doctors.active}
            hint={`${summary.doctors.total} total`}
            icon={DoctorIcon}
            tone="secondary"
          />
          <StatCard label="Patients" value={summary.patients.total} icon={PatientsIcon} tone="sky" />
          <StatCard
            label="Appointments Today"
            value={summary.appointments.today}
            trendPct={summary.appointments.trendPct}
            hint="vs. prior week"
            icon={CalendarIcon}
            tone="primary"
          />
          <StatCard
            label="Active Queues Now"
            value={summary.activeQueuesToday}
            icon={QueueIcon}
            tone="gold"
          />
          <StatCard
            label="Revenue Today"
            value={formatCurrency(summary.revenue.today)}
            hint={`${formatCurrency(summary.revenue.total)} all-time`}
            icon={RevenueIcon}
            tone="primary"
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isAnalyticsLoading && <Spinner label="Loading charts…" />}
          {isAnalyticsError && <ErrorNotice message="Couldn't load chart data right now." />}
          {analytics && <AppointmentsTrendChart data={analytics.appointmentsPerDay} subtitle="Last 14 days" />}
        </div>
        <div>
          {analytics && <StatusBreakdownChart data={analytics.appointmentsByStatus} subtitle="Last 14 days" />}
        </div>
      </div>

      {analytics && (
        <div className="mt-4">
          <RevenueTrendChart data={analytics.revenuePerDay} subtitle="Last 14 days, successful payments" />
        </div>
      )}
    </div>
  );
};

export default AdminOverviewPage;
