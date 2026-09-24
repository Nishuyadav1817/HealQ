import { useState } from 'react';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Field from '../../../components/ui/Field';
import TokenChip from './ui/TokenChip';
import RAvatar from './ui/RAvatar';
import {
  useVerifyPatient,
  useCollectPayment,
  useMarkArrived,
  useMoveToDoctorQueue,
  useUpdateAppointmentStatus,
} from '../hooks/useReceptionActions';
import { getApiErrorMessage } from '../../../utils/apiError';

const TERMINAL_STATUSES = ['completed', 'cancelled', 'no-show'];

const formatTime = (slot) => (slot ? `${slot.start}–${slot.end}` : '—');

/**
 * One card = one appointment + every action a receptionist can take on
 * it, gated by the exact same rules the backend enforces (see
 * reception.service.js) so a disabled/hidden button here never leads to
 * a 400 from the API. Used identically on the Today's Patients board and
 * the Search Booking result — one component, two call sites, no drift.
 *
 * Visual redesign only — every mutation, gating condition, and form
 * field below is unchanged from before.
 */
const ReceptionAppointmentCard = ({ appointment }) => {
  const [openPanel, setOpenPanel] = useState(null); // null | 'verify' | 'payment' | 'no-show' | 'cancelled'
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [reason, setReason] = useState('');

  const verifyMutation = useVerifyPatient();
  const paymentMutation = useCollectPayment();
  const arriveMutation = useMarkArrived();
  const moveMutation = useMoveToDoctorQueue();
  const statusMutation = useUpdateAppointmentStatus();

  const closePanel = () => {
    setOpenPanel(null);
    setNotes('');
    setPaymentMethod('cash');
    setPaymentAmount('');
    setReason('');
  };

  const isTerminal = TERMINAL_STATUSES.includes(appointment.status);
  const canMarkArrived = ['pending', 'confirmed'].includes(appointment.status);
  const canMoveToQueue =
    appointment.status === 'checked-in' && appointment.payment && !appointment.isInDoctorQueue;
  const canManage = !isTerminal;

  const handleVerify = async () => {
    await verifyMutation.mutateAsync({ id: appointment._id, verificationNotes: notes });
    closePanel();
  };

  const handlePayment = async () => {
    await paymentMutation.mutateAsync({
      id: appointment._id,
      method: paymentMethod,
      amount: paymentAmount ? Number(paymentAmount) : undefined,
    });
    closePanel();
  };

  const handleStatusUpdate = async (status) => {
    await statusMutation.mutateAsync({ id: appointment._id, status, reason });
    closePanel();
  };

  return (
    <Card className={isTerminal ? 'opacity-80' : ''}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <TokenChip
            value={appointment.tokenNumber}
            tone={appointment.status === 'in-consultation' ? 'active' : isTerminal ? 'muted' : 'default'}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <RAvatar name={appointment.patient?.fullName} size="sm" />
              <p className="truncate font-semibold text-ink">{appointment.patient?.fullName}</p>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              Dr. {appointment.doctor?.user?.fullName} · {appointment.department?.name}
            </p>
            <p className="mt-0.5 text-xs text-ink-subtle">
              {formatTime(appointment.timeSlot)} · {appointment.bookingNumber}
            </p>
            {appointment.patient?.phone && (
              <p className="text-xs text-ink-subtle">{appointment.patient.phone}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge status={appointment.status} />
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              appointment.verifiedAt ? 'bg-success/10 text-success' : 'bg-surface-muted text-ink-subtle'
            }`}
          >
            {appointment.verifiedAt ? '✓ Verified' : 'Not verified'}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              appointment.payment ? 'bg-success/10 text-success' : 'bg-gold-100 text-gold-700'
            }`}
          >
            {appointment.payment ? `✓ Paid ₹${appointment.payment.amount}` : 'Payment pending'}
          </span>
          {appointment.isInDoctorQueue && (
            <span className="inline-flex items-center gap-1 rounded-full bg-role-doctor/10 px-2 py-0.5 text-xs font-medium text-role-doctor">
              In doctor queue
            </span>
          )}
        </div>
      </div>

      {canManage && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-surface-border pt-3">
          {!appointment.verifiedAt && (
            <Button size="sm" variant="secondary" onClick={() => setOpenPanel('verify')}>
              Verify Patient
            </Button>
          )}
          {!appointment.payment && (
            <Button size="sm" variant="secondary" onClick={() => setOpenPanel('payment')}>
              Collect Payment
            </Button>
          )}
          {canMarkArrived && (
            <Button
              size="sm"
              variant="secondary"
              isLoading={arriveMutation.isPending}
              onClick={() => arriveMutation.mutate({ id: appointment._id })}
            >
              Mark Arrived
            </Button>
          )}
          {canMoveToQueue && (
            <Button
              size="sm"
              isLoading={moveMutation.isPending}
              onClick={() => moveMutation.mutate({ id: appointment._id })}
            >
              Move to Doctor Queue
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setOpenPanel('no-show')}>
            Mark No-show
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpenPanel('cancelled')}>
            Cancel
          </Button>
        </div>
      )}

      {openPanel === 'verify' && (
        <div className="mt-3 space-y-3 rounded-lg border border-surface-border bg-surface p-3">
          <Field
            label="Verification notes (optional)"
            as="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. ID confirmed against booking name"
          />
          {verifyMutation.isError && (
            <p className="text-xs font-medium text-danger">
              {getApiErrorMessage(verifyMutation.error, 'Verification failed.')}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" isLoading={verifyMutation.isPending} onClick={handleVerify}>
              Confirm verification
            </Button>
            <Button size="sm" variant="ghost" onClick={closePanel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {openPanel === 'payment' && (
        <div className="mt-3 space-y-3 rounded-lg border border-surface-border bg-surface p-3">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Payment method"
              as="select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Net banking</option>
              <option value="wallet">Wallet</option>
            </Field>
            <Field
              label={`Amount (optional — defaults to ₹${appointment.doctor?.consultationFee ?? '—'})`}
              type="number"
              min="0"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={appointment.doctor?.consultationFee}
            />
          </div>
          {paymentMutation.isError && (
            <p className="text-xs font-medium text-danger">
              {getApiErrorMessage(paymentMutation.error, 'Payment failed.')}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" isLoading={paymentMutation.isPending} onClick={handlePayment}>
              Confirm payment
            </Button>
            <Button size="sm" variant="ghost" onClick={closePanel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {(openPanel === 'no-show' || openPanel === 'cancelled') && (
        <div className="mt-3 space-y-3 rounded-lg border border-danger/30 bg-danger/5 p-3">
          <p className="text-sm font-medium text-ink">
            {openPanel === 'no-show' ? 'Mark this patient as a no-show?' : 'Cancel this appointment?'}
          </p>
          <Field
            label="Reason (optional)"
            as="textarea"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {statusMutation.isError && (
            <p className="text-xs font-medium text-danger">
              {getApiErrorMessage(statusMutation.error, 'Update failed.')}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              isLoading={statusMutation.isPending}
              onClick={() => handleStatusUpdate(openPanel)}
            >
              Confirm
            </Button>
            <Button size="sm" variant="ghost" onClick={closePanel}>
              Keep appointment
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ReceptionAppointmentCard;
