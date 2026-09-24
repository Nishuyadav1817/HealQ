import React from "react";
import { useState } from 'react';
import { usePatientAppointments, useCancelAppointment } from '../hooks/usePatientAppointments';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import StateNotice from '../../../components/ui/StateNotice';
import DashboardShell from '../../../components/common/DashboardShell';

const PatientAppointmentsPage = () => {
  const { data: appointments, isLoading, error } = usePatientAppointments();
  const cancelMutation = useCancelAppointment();

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const handleCancelClick = (appointment) => {
    // Don't allow cancelling already cancelled or completed appointments
    if (['cancelled', 'completed', 'no-show'].includes(appointment.status)) {
      return;
    }
    setSelectedAppointment(appointment);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    try {
      await cancelMutation.mutateAsync({
        appointmentId: selectedAppointment._id,
        reason: cancellationReason,
      });

      // Success - dialog will close automatically
      setShowCancelDialog(false);
      setCancellationReason('');
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      'checked-in': 'bg-purple-100 text-purple-800',
      'in-consultation': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading your appointments...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <StateNotice
          type="error"
          title="Error loading appointments"
          message={error.message || 'Failed to load your appointments. Please try again.'}
        />
      </DashboardShell>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <DashboardShell>
        <StateNotice
          type="empty"
          title="No appointments"
          message="You don't have any appointments yet."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-2">
            Manage your appointments and track their status
          </p>
        </div>

        <div className="grid gap-6">
          {appointments.map((appointment) => (
            <Card key={appointment._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {appointment.doctor?.user?.fullName || 'Unknown Doctor'}
                      </h3>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {appointment.department?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                      Date
                    </p>
                    <p className="text-gray-900 font-medium">
                      {formatDate(appointment.appointmentDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                      Time
                    </p>
                    <p className="text-gray-900 font-medium">
                      {formatTime(appointment.timeSlot?.start)} - {formatTime(appointment.timeSlot?.end)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                      Token
                    </p>
                    <p className="text-gray-900 font-medium">
                      #{appointment.tokenNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                      Booking Number
                    </p>
                    <p className="text-gray-900 font-medium">
                      {appointment.bookingNumber}
                    </p>
                  </div>
                </div>

                {appointment.reasonForVisit && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Reason for Visit
                    </p>
                    <p className="text-sm text-gray-700">
                      {appointment.reasonForVisit}
                    </p>
                  </div>
                )}

                {appointment.hospital && (
                  <div className="mb-6 text-sm">
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                      Hospital
                    </p>
                    <p className="text-gray-900 font-medium">
                      {appointment.hospital.name}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {appointment.hospital.address?.line1}
                    </p>
                  </div>
                )}

                {appointment.status === 'cancelled' && appointment.cancellationReason && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs text-red-700 font-medium">
                      Cancellation Reason: {appointment.cancellationReason}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  {!['cancelled', 'completed', 'no-show'].includes(appointment.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelClick(appointment)}
                      disabled={cancelMutation.isPending}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {cancelMutation.isPending && selectedAppointment?._id === appointment._id
                        ? 'Cancelling...'
                        : 'Cancel Appointment'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                  >
                    Print Ticket
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setCancellationReason('');
          setSelectedAppointment(null);
        }}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        message={
          selectedAppointment
            ? `Are you sure you want to cancel your appointment with Dr. ${selectedAppointment.doctor?.user?.fullName} on ${formatDate(selectedAppointment.appointmentDate)}?`
            : ''
        }
        confirmText={cancelMutation.isPending ? 'Cancelling...' : 'Cancel Appointment'}
        cancelText="Keep Appointment"
        isDestructive
        isPending={cancelMutation.isPending}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for cancellation (optional)
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Please tell us why you're cancelling..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            disabled={cancelMutation.isPending}
          />
        </div>
      </ConfirmDialog>

      {/* Success Toast */}
      {cancelMutation.isSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          Appointment cancelled successfully.
        </div>
      )}

      {/* Error Toast */}
      {cancelMutation.isError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          {cancelMutation.error?.message || 'Failed to cancel appointment.'}
        </div>
      )}
    </DashboardShell>
  );
};

export default PatientAppointmentsPage;
