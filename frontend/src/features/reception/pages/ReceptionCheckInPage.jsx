import React from "react";
import { useState } from 'react';
import DashboardShell from '../../../components/common/DashboardShell';
import { EmptyState } from '../../../components/ui/StateNotice';
import Button from '../../../components/ui/Button';

/**
 * Reception Check-In Page
 * Handles patient check-in at reception desk
 */
const ReceptionCheckInPage = () => {
  const [patientId, setPatientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!patientId.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Implement check-in API call
      console.log('Checking in patient:', patientId);
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div>
        <h1 className="text-xl font-semibold text-ink">Patient Check-In</h1>
        <p className="mt-1 text-sm text-ink-muted">Check patients in for their appointments.</p>
      </div>

      <div className="mt-8 max-w-md">
        <form onSubmit={handleCheckIn} className="space-y-4 rounded-lg border border-surface-border p-6">
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-ink">
              Patient ID / Phone
            </label>
            <input
              id="patientId"
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient ID or phone number"
              className="mt-2 w-full rounded-md border border-surface-border px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              disabled={isLoading}
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? 'Checking in...' : 'Check In'}
          </Button>
        </form>
      </div>

      <div className="mt-12">
        <EmptyState>
          Recent check-ins will appear here.
        </EmptyState>
      </div>
    </DashboardShell>
  );
};

export default ReceptionCheckInPage;
