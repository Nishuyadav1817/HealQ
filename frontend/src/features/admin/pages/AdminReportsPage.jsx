import React from "react";
import { useState } from 'react';
import { Spinner, ErrorNotice } from '../../../components/ui/StateNotice';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import { useAnalytics } from '../hooks/useAnalytics';
import DateRangeSelect from '../components/DateRangeSelect';
import { downloadCsv } from '../../../utils/csv';

const ReportSection = ({ title, subtitle, filename, columns, rows }) => (
  <Card>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-subtle">{subtitle}</p>}
      </div>
      <Button
        size="sm"
        variant="secondary"
        disabled={!rows.length}
        onClick={() => downloadCsv(filename, columns, rows)}
      >
        Export CSV
      </Button>
    </div>
    <div className="mt-4">
      <DataTable
        columns={columns.map((col) => ({ key: col.key, header: col.header, render: col.render }))}
        rows={rows}
        keyField="key"
        emptyTitle="No data for this range"
        emptyDescription="Try a wider date range."
      />
    </div>
  </Card>
);

const AdminReportsPage = () => {
  const [days, setDays] = useState(30);
  const { data: analytics, isLoading, isError } = useAnalytics(days);

  const hospitalRows = (analytics?.appointmentsByHospital ?? []).map((h, i) => ({
    key: h.hospitalId,
    rank: i + 1,
    name: h.name,
    appointments: h.count,
  }));

  const departmentRows = (analytics?.appointmentsByDepartment ?? []).map((d, i) => ({
    key: d.departmentId,
    rank: i + 1,
    name: d.name,
    appointments: d.count,
  }));

  const doctorRows = (analytics?.topDoctors ?? []).map((d, i) => ({
    key: d.doctorId,
    rank: i + 1,
    name: d.name,
    specialization: d.specialization,
    consultationsCompleted: d.consultationsCompleted,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Reports</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Ranked summaries you can export straight to a spreadsheet.
          </p>
        </div>
        <DateRangeSelect value={days} onChange={setDays} />
      </div>

      {isLoading && <Spinner label="Building reports…" />}
      {isError && <ErrorNotice message="Couldn't load report data right now." />}

      {analytics && (
        <div className="mt-6 space-y-4">
          <ReportSection
            title="Hospital Performance"
            subtitle={`Appointment volume, last ${analytics.range.days} days`}
            filename={`hospital-performance-${analytics.range.days}d.csv`}
            rows={hospitalRows}
            columns={[
              { key: 'rank', header: '#', render: (r) => r.rank, value: (r) => r.rank },
              { key: 'name', header: 'Hospital', render: (r) => r.name, value: (r) => r.name },
              {
                key: 'appointments',
                header: 'Appointments',
                render: (r) => r.appointments,
                value: (r) => r.appointments,
              },
            ]}
          />

          <ReportSection
            title="Department Performance"
            subtitle={`Appointment volume, last ${analytics.range.days} days`}
            filename={`department-performance-${analytics.range.days}d.csv`}
            rows={departmentRows}
            columns={[
              { key: 'rank', header: '#', render: (r) => r.rank, value: (r) => r.rank },
              { key: 'name', header: 'Department', render: (r) => r.name, value: (r) => r.name },
              {
                key: 'appointments',
                header: 'Appointments',
                render: (r) => r.appointments,
                value: (r) => r.appointments,
              },
            ]}
          />

          <ReportSection
            title="Top Doctors"
            subtitle={`By completed consultations, last ${analytics.range.days} days`}
            filename={`top-doctors-${analytics.range.days}d.csv`}
            rows={doctorRows}
            columns={[
              { key: 'rank', header: '#', render: (r) => r.rank, value: (r) => r.rank },
              { key: 'name', header: 'Doctor', render: (r) => `Dr. ${r.name}`, value: (r) => r.name },
              {
                key: 'specialization',
                header: 'Specialization',
                render: (r) => r.specialization,
                value: (r) => r.specialization,
              },
              {
                key: 'consultationsCompleted',
                header: 'Consultations Completed',
                render: (r) => r.consultationsCompleted,
                value: (r) => r.consultationsCompleted,
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
